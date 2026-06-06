import type { FundData } from '../types/fund';

export function createDefaultFund(): FundData {
  return {
    sources: [],
    allocations: [],
  };
}
