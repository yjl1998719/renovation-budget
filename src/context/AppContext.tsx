import { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import type { AppData, RenovationStage } from '../types/budget';
import type { FundSource, FundSummary } from '../types/fund';
import type { ExpenseRecord, ExpensesGrandSummary } from '../types/expense';
import { calculateFundSummary, calculateExpensesGrandSummary, formatCurrency } from '../utils/calculations';
import { loadData, saveData, exportToJson, importFromJson, createDefaultData, generateShareUrl, decodeDataFromShare } from '../utils/storage';
import { generateId } from '../utils/idGenerator';

// -- Actions ---------------------------------------------------------------
type AppAction =
  | { type: 'ADD_FUND_SOURCE'; source: Omit<FundSource, 'id'> }
  | { type: 'UPDATE_FUND_SOURCE'; sourceId: string; updates: Partial<FundSource> }
  | { type: 'DELETE_FUND_SOURCE'; sourceId: string }
  | { type: 'SET_ALLOCATION'; stageId: string; amount: number }
  | { type: 'ADD_EXPENSE'; expense: Omit<ExpenseRecord, 'id'> }
  | { type: 'UPDATE_EXPENSE'; expenseId: string; updates: Partial<ExpenseRecord> }
  | { type: 'DELETE_EXPENSE'; expenseId: string }
  | { type: 'IMPORT_DATA'; data: AppData }
  | { type: 'RESET_DATA' };

// -- Reducer ---------------------------------------------------------------
function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'ADD_FUND_SOURCE': {
      const newSource: FundSource = { ...action.source, id: generateId() };
      return {
        ...state,
        fund: { ...state.fund, sources: [...state.fund.sources, newSource] },
        lastModified: new Date().toISOString(),
      };
    }
    case 'UPDATE_FUND_SOURCE': {
      const sources = state.fund.sources.map((s) =>
        s.id === action.sourceId ? { ...s, ...action.updates } : s,
      );
      return {
        ...state,
        fund: { ...state.fund, sources },
        lastModified: new Date().toISOString(),
      };
    }
    case 'DELETE_FUND_SOURCE': {
      const sources = state.fund.sources.filter((s) => s.id !== action.sourceId);
      return {
        ...state,
        fund: { ...state.fund, sources },
        lastModified: new Date().toISOString(),
      };
    }
    case 'SET_ALLOCATION': {
      const existing = state.fund.allocations.find((a) => a.stageId === action.stageId);
      const allocations = existing
        ? state.fund.allocations.map((a) =>
            a.stageId === action.stageId ? { ...a, allocatedAmount: action.amount } : a,
          )
        : [...state.fund.allocations, { stageId: action.stageId, allocatedAmount: action.amount }];
      return {
        ...state,
        fund: { ...state.fund, allocations },
        lastModified: new Date().toISOString(),
      };
    }
    case 'ADD_EXPENSE': {
      const newExpense: ExpenseRecord = { ...action.expense, id: generateId() };
      return {
        ...state,
        expenses: [...state.expenses, newExpense],
        lastModified: new Date().toISOString(),
      };
    }
    case 'UPDATE_EXPENSE': {
      const expenses = state.expenses.map((e) =>
        e.id === action.expenseId ? { ...e, ...action.updates } : e,
      );
      return { ...state, expenses, lastModified: new Date().toISOString() };
    }
    case 'DELETE_EXPENSE': {
      const expenses = state.expenses.filter((e) => e.id !== action.expenseId);
      return { ...state, expenses, lastModified: new Date().toISOString() };
    }
    case 'IMPORT_DATA':
      return { ...action.data, lastModified: new Date().toISOString() };
    case 'RESET_DATA':
      return createDefaultData();
    default:
      return state;
  }
}

// -- Context ---------------------------------------------------------------
interface AppContextValue {
  data: AppData;
  stages: RenovationStage[];
  fundSummary: FundSummary;
  expensesSummary: ExpensesGrandSummary;
  addFundSource: (source: Omit<FundSource, 'id'>) => void;
  updateFundSource: (sourceId: string, updates: Partial<FundSource>) => void;
  deleteFundSource: (sourceId: string) => void;
  setAllocation: (stageId: string, amount: number) => void;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  updateExpense: (expenseId: string, updates: Partial<ExpenseRecord>) => void;
  deleteExpense: (expenseId: string) => void;
  importData: (jsonStr: string) => boolean;
  importFromShareUrl: (hash: string) => boolean;
  resetData: () => void;
  handleExport: () => void;
  handleShare: () => void;
  formatMoney: (amount: number) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

// -- Provider --------------------------------------------------------------
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, dispatch] = useReducer(appReducer, null, loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const stages = useMemo(() => [...data.stages].sort((a, b) => a.order - b.order), [data.stages]);
  const fundSummary = useMemo(() => calculateFundSummary(data.fund), [data.fund]);
  const expensesSummary = useMemo(
    () => calculateExpensesGrandSummary(data.stages, data.fund, data.expenses),
    [data.stages, data.fund, data.expenses],
  );

  const addFundSource = useCallback(
    (source: Omit<FundSource, 'id'>) => dispatch({ type: 'ADD_FUND_SOURCE', source }), [],
  );
  const updateFundSource = useCallback(
    (sourceId: string, updates: Partial<FundSource>) =>
      dispatch({ type: 'UPDATE_FUND_SOURCE', sourceId, updates }), [],
  );
  const deleteFundSource = useCallback(
    (sourceId: string) => dispatch({ type: 'DELETE_FUND_SOURCE', sourceId }), [],
  );
  const setAllocation = useCallback(
    (stageId: string, amount: number) => dispatch({ type: 'SET_ALLOCATION', stageId, amount }), [],
  );
  const addExpense = useCallback(
    (expense: Omit<ExpenseRecord, 'id'>) => dispatch({ type: 'ADD_EXPENSE', expense }), [],
  );
  const updateExpense = useCallback(
    (expenseId: string, updates: Partial<ExpenseRecord>) =>
      dispatch({ type: 'UPDATE_EXPENSE', expenseId, updates }), [],
  );
  const deleteExpense = useCallback(
    (expenseId: string) => dispatch({ type: 'DELETE_EXPENSE', expenseId }), [],
  );
  const importDataFn = useCallback((jsonStr: string): boolean => {
    const parsed = importFromJson(jsonStr);
    if (!parsed) return false;
    dispatch({ type: 'IMPORT_DATA', data: parsed });
    return true;
  }, []);
  const resetData = useCallback(() => dispatch({ type: 'RESET_DATA' }), []);
  const handleExport = useCallback(() => exportToJson(data), [data]);
  const handleShare = useCallback(() => {
    const url = generateShareUrl(data);
    navigator.clipboard.writeText(url).then(() => {
      // Clipboard write succeeded
    }).catch(() => {
      // Fallback: show the URL in a prompt
    });
  }, [data]);
  const importFromShareUrl = useCallback((hash: string): boolean => {
    if (!hash.startsWith('#data=')) return false;
    const encoded = hash.slice(6);
    const parsed = decodeDataFromShare(encoded);
    if (!parsed) return false;
    dispatch({ type: 'IMPORT_DATA', data: parsed });
    // Clean URL
    window.history.replaceState(null, '', window.location.pathname);
    return true;
  }, []);
  const formatMoney = useCallback((amount: number) => formatCurrency(amount), []);

  const value = useMemo<AppContextValue>(
    () => ({
      data, stages, fundSummary, expensesSummary,
      addFundSource, updateFundSource, deleteFundSource, setAllocation,
      addExpense, updateExpense, deleteExpense,
      importData: importDataFn, importFromShareUrl, resetData, handleExport, handleShare, formatMoney,
    }),
    [data, stages, fundSummary, expensesSummary,
     addFundSource, updateFundSource, deleteFundSource, setAllocation,
     addExpense, updateExpense, deleteExpense,
     importDataFn, importFromShareUrl, resetData, handleExport, handleShare, formatMoney],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// -- Hook ------------------------------------------------------------------
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
