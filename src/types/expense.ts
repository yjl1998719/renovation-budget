export interface ExpenseRecord {
  id: string;
  stageId: string;
  name: string;
  estimatedAmount: number;   // 预估总价
  depositAmount: number;     // 已付定金
  hasBalance: boolean;       // 是否有尾款
  balanceAmount: number;     // 尾款金额
  balancePaid: boolean;      // 尾款是否已支付
  balancePaidDate: string;   // 尾款支付日期
  vendor: string;
  date: string;              // 购买/定金日期
  notes: string;
}

export interface StageExpenseSummary {
  stageId: string;
  stageName: string;
  allocatedAmount: number;
  totalEstimated: number;
  totalDeposit: number;
  totalBalancePaid: number;
  totalBalanceUnpaid: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  expenseCount: number;
}

export interface ExpensesGrandSummary {
  totalEstimated: number;
  totalDeposit: number;
  totalBalancePaid: number;
  totalBalanceUnpaid: number;
  totalSpent: number;
  totalAllocated: number;
  remaining: number;
  percentUsed: number;
  stageSummaries: StageExpenseSummary[];
}
