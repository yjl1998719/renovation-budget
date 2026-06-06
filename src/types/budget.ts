import type { FundData } from './fund';
import type { ExpenseRecord } from './expense';

export interface RenovationStage {
  id: string;
  name: string;
  order: number;
  icon: string;
}

export interface AppData {
  version: number;
  stages: RenovationStage[];
  fund: FundData;
  expenses: ExpenseRecord[];
  lastModified: string;
}
