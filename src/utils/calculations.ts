import type { RenovationStage } from '../types/budget';
import type { FundData, FundSummary } from '../types/fund';
import type { ExpenseRecord, StageExpenseSummary, ExpensesGrandSummary } from '../types/expense';

// -- Fund calculations -----------------------------------------------------

export function calculateFundSummary(fund: FundData): FundSummary {
  const totalFund = fund.sources.reduce((sum, s) => sum + s.amount, 0);
  const totalAllocated = fund.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
  return {
    totalFund,
    totalAllocated,
    unallocated: totalFund - totalAllocated,
  };
}

// -- Expense calculations --------------------------------------------------

export function calculateStageExpenseSummary(
  stage: RenovationStage,
  fund: FundData,
  expenses: ExpenseRecord[],
): StageExpenseSummary {
  const allocation = fund.allocations.find((a) => a.stageId === stage.id);
  const allocatedAmount = allocation?.allocatedAmount ?? 0;
  const stageExpenses = expenses.filter((e) => e.stageId === stage.id);

  let totalEstimated = 0;
  let totalDeposit = 0;
  let totalBalancePaid = 0;
  let totalBalanceUnpaid = 0;

  for (const e of stageExpenses) {
    totalEstimated += e.estimatedAmount;
    totalDeposit += e.depositAmount;
    if (e.balancePaid) {
      totalBalancePaid += e.balanceAmount;
    } else {
      totalBalanceUnpaid += e.balanceAmount;
    }
  }

  const totalSpent = totalDeposit + totalBalancePaid;

  return {
    stageId: stage.id,
    stageName: stage.name,
    allocatedAmount,
    totalEstimated,
    totalDeposit,
    totalBalancePaid,
    totalBalanceUnpaid,
    totalSpent,
    remaining: totalEstimated - totalSpent,
    percentUsed: totalEstimated > 0 ? Math.min((totalSpent / totalEstimated) * 100, 100) : 0,
    expenseCount: stageExpenses.length,
  };
}

export function calculateExpensesGrandSummary(
  stages: RenovationStage[],
  fund: FundData,
  expenses: ExpenseRecord[],
): ExpensesGrandSummary {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  const stageSummaries = sorted.map((s) => calculateStageExpenseSummary(s, fund, expenses));

  let totalEstimated = 0;
  let totalDeposit = 0;
  let totalBalancePaid = 0;
  let totalBalanceUnpaid = 0;

  for (const e of expenses) {
    totalEstimated += e.estimatedAmount;
    totalDeposit += e.depositAmount;
    if (e.balancePaid) {
      totalBalancePaid += e.balanceAmount;
    } else {
      totalBalanceUnpaid += e.balanceAmount;
    }
  }

  const totalSpent = totalDeposit + totalBalancePaid;
  const totalAllocated = fund.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);

  return {
    totalEstimated,
    totalDeposit,
    totalBalancePaid,
    totalBalanceUnpaid,
    totalSpent,
    totalAllocated,
    remaining: totalEstimated - totalSpent,
    percentUsed: totalEstimated > 0 ? Math.min((totalSpent / totalEstimated) * 100, 100) : 0,
    stageSummaries,
  };
}

// -- Currency formatting ---------------------------------------------------

export function formatCurrency(amount: number): string {
  const safe = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `¥${safe.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
