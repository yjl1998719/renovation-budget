import type { AppData } from '../types/budget';
import type { FundData } from '../types/fund';
import type { ExpenseRecord } from '../types/expense';
import { defaultStages } from '../data/defaultStages';
import { createDefaultFund } from '../data/defaultFund';
import { generateId } from './idGenerator';

const STORAGE_KEY = 'renovation-budget-data';
const CURRENT_VERSION = 5;

function createDefaultData(): AppData {
  return {
    version: CURRENT_VERSION,
    stages: JSON.parse(JSON.stringify(defaultStages)),
    fund: createDefaultFund(),
    expenses: [],
    lastModified: new Date().toISOString(),
  };
}

// -- Migration helpers -----------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateExpenseRecord(e: any): ExpenseRecord {
  // v3: had `amount` field
  if (typeof e.amount === 'number' && e.estimatedAmount === undefined) {
    return {
      id: e.id || generateId(),
      stageId: e.stageId || '',
      name: e.name || '',
      estimatedAmount: e.amount,
      depositAmount: 0,
      hasBalance: false,
      balanceAmount: 0,
      balancePaid: false,
      balancePaidDate: '',
      vendor: e.vendor || '',
      date: e.date || '',
      notes: e.notes || '',
    };
  }
  // v4: has `balancePaid` as number
  if (typeof e.balancePaid === 'number' && e.hasBalance === undefined) {
    const oldBalance = e.balancePaid as number;
    return {
      id: e.id || generateId(),
      stageId: e.stageId || '',
      name: e.name || '',
      estimatedAmount: e.estimatedAmount ?? 0,
      depositAmount: e.depositAmount ?? 0,
      hasBalance: oldBalance > 0,
      balanceAmount: oldBalance,
      balancePaid: oldBalance > 0,
      balancePaidDate: oldBalance > 0 ? (e.date || '') : '',
      vendor: e.vendor || '',
      date: e.date || '',
      notes: e.notes || '',
    };
  }
  // v5+: current
  return {
    id: e.id || generateId(),
    stageId: e.stageId || '',
    name: e.name || '',
    estimatedAmount: e.estimatedAmount ?? 0,
    depositAmount: e.depositAmount ?? 0,
    hasBalance: e.hasBalance ?? false,
    balanceAmount: e.balanceAmount ?? 0,
    balancePaid: e.balancePaid ?? false,
    balancePaidDate: e.balancePaidDate ?? '',
    vendor: e.vendor || '',
    date: e.date || '',
    notes: e.notes || '',
  };
}

// Map old 9-stage IDs to new 2-stage model
const OLD_TO_NEW_STAGE: Record<string, string> = {
  'stage-prep': 'stage-hard',
  'stage-demolition': 'stage-hard',
  'stage-electrical': 'stage-hard',
  'stage-masonry': 'stage-hard',
  'stage-woodwork': 'stage-hard',
  'stage-painting': 'stage-hard',
  'stage-installation': 'stage-hard',
  'stage-furnishing': 'stage-soft',
  'stage-cleaning': 'stage-hard',
};

// v1/v2 → current
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateV2ToV4(raw: any): AppData {
  const oldStages: { id: string; name: string; order: number; items: any[] }[] = raw.stages ?? [];
  const stages = JSON.parse(JSON.stringify(defaultStages));

  const expenses: ExpenseRecord[] = [];
  const allocations: { stageId: string; allocatedAmount: number }[] = [];
  let totalEstimated = 0;
  const stageEstimates: Record<string, number> = { 'stage-hard': 0, 'stage-soft': 0 };

  for (const os of oldStages) {
    let stageEstimated = 0;
    const newStageId = OLD_TO_NEW_STAGE[os.id] || 'stage-hard';

    for (const item of os.items ?? []) {
      stageEstimated += item.estimatedAmount || 0;
      const isPackage = item.isPackage === true;
      const actualPaid = isPackage ? item.estimatedAmount : item.actualAmount;

      if (actualPaid > 0) {
        expenses.push({
          id: generateId(),
          stageId: newStageId,
          name: item.name,
          estimatedAmount: item.estimatedAmount,
          depositAmount: 0,
          hasBalance: false,
          balanceAmount: 0,
          balancePaid: false,
          balancePaidDate: '',
          vendor: isPackage ? '装修公司' : '',
          date: raw.lastModified?.slice(0, 10) ?? '',
          notes: item.notes ?? '',
        });
      }
    }
    stageEstimates[newStageId] += stageEstimated;
    totalEstimated += stageEstimated;
  }

  if (stageEstimates['stage-hard'] > 0) {
    allocations.push({ stageId: 'stage-hard', allocatedAmount: stageEstimates['stage-hard'] });
  }
  if (stageEstimates['stage-soft'] > 0) {
    allocations.push({ stageId: 'stage-soft', allocatedAmount: stageEstimates['stage-soft'] });
  }

  const fund: FundData = {
    sources: totalEstimated > 0
      ? [{ id: generateId(), name: '初始预算', amount: totalEstimated, color: '#e8a87c', notes: '从旧版数据导入' }]
      : [],
    allocations,
  };

  return { version: CURRENT_VERSION, stages, fund, expenses, lastModified: new Date().toISOString() };
}

// -- Public API ------------------------------------------------------------

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();
    const parsed = JSON.parse(raw);

    if (!parsed.version || !Array.isArray(parsed.stages)) {
      return createDefaultData();
    }

    // Current version
    if (parsed.version >= CURRENT_VERSION) {
      return parsed as AppData;
    }

    // v4: migrate expense records (balancePaid number → booleans)
    if (parsed.version === 4 && parsed.fund && parsed.expenses) {
      const expenses = (parsed.expenses as any[]).map(migrateExpenseRecord);
      return {
        ...parsed,
        version: CURRENT_VERSION,
        expenses,
        lastModified: new Date().toISOString(),
      };
    }

    // v3: migrate expense records in place
    if (parsed.version === 3 && parsed.fund && parsed.expenses) {
      const expenses = (parsed.expenses as any[]).map(migrateExpenseRecord);
      const newStages = JSON.parse(JSON.stringify(defaultStages));
      const fund = parsed.fund as FundData;

      // Remap allocations from old 9-stage IDs to new 2-stage IDs if needed
      const allocations = fund.allocations.map((a) => ({
        ...a,
        stageId: OLD_TO_NEW_STAGE[a.stageId] || a.stageId,
      }));

      // Merge allocations for the same new stage
      const mergedAllocs: FundData['allocations'] = [];
      const seen = new Set<string>();
      for (const a of allocations) {
        if (seen.has(a.stageId)) {
          const existing = mergedAllocs.find((m) => m.stageId === a.stageId)!;
          existing.allocatedAmount += a.allocatedAmount;
        } else {
          mergedAllocs.push({ ...a });
          seen.add(a.stageId);
        }
      }

      // Also remap expense stageIds
      const remappedExpenses = expenses.map((e) => ({
        ...e,
        stageId: OLD_TO_NEW_STAGE[e.stageId] || e.stageId,
      }));

      return {
        version: CURRENT_VERSION,
        stages: newStages,
        fund: { ...fund, allocations: mergedAllocs },
        expenses: remappedExpenses,
        lastModified: new Date().toISOString(),
      };
    }

    // v1/v2: full migration
    return migrateV2ToV4(parsed);
  } catch {
    return createDefaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function exportToJson(data: AppData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `renovation-budget-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJson(jsonStr: string): AppData | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.version || !Array.isArray(parsed.stages)) {
      return null;
    }
    // v5+ (current): accept directly
    if (parsed.version >= CURRENT_VERSION) {
      return parsed as AppData;
    }
    // v4: migrate expense records
    if (parsed.version === 4 && parsed.fund && parsed.expenses) {
      return {
        ...parsed,
        version: CURRENT_VERSION,
        expenses: (parsed.expenses as any[]).map(migrateExpenseRecord),
        lastModified: new Date().toISOString(),
      };
    }
    // v3: migrate expense records
    if (parsed.version === 3 && parsed.fund && parsed.expenses) {
      const expenses = (parsed.expenses as any[]).map(migrateExpenseRecord);
      const allocations = (parsed.fund as FundData).allocations.map((a) => ({
        ...a,
        stageId: OLD_TO_NEW_STAGE[a.stageId] || a.stageId,
      }));
      const mergedAllocs: FundData['allocations'] = [];
      const seen = new Set<string>();
      for (const a of allocations) {
        if (seen.has(a.stageId)) {
          const existing = mergedAllocs.find((m) => m.stageId === a.stageId)!;
          existing.allocatedAmount += a.allocatedAmount;
        } else {
          mergedAllocs.push({ ...a });
          seen.add(a.stageId);
        }
      }
      return {
        version: CURRENT_VERSION,
        stages: JSON.parse(JSON.stringify(defaultStages)),
        fund: { ...parsed.fund, allocations: mergedAllocs },
        expenses,
        lastModified: new Date().toISOString(),
      };
    }
    return migrateV2ToV4(parsed);
  } catch {
    return null;
  }
}

// -- Share-link helpers ----------------------------------------------------

export function encodeDataForShare(data: AppData): string {
  const json = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeDataFromShare(encoded: string): AppData | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return importFromJson(json);
  } catch {
    return null;
  }
}

export function generateShareUrl(data: AppData): string {
  const encoded = encodeDataForShare(data);
  return `${window.location.origin}${window.location.pathname}#data=${encoded}`;
}

export { createDefaultData };
