export interface FundSource {
  id: string;
  name: string;
  amount: number;
  color: string;
  notes: string;
}

export interface FundAllocation {
  stageId: string;
  allocatedAmount: number;
}

export interface FundData {
  sources: FundSource[];
  allocations: FundAllocation[];
}

export interface FundSummary {
  totalFund: number;
  totalAllocated: number;
  unallocated: number;
}
