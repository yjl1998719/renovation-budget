import type { RenovationStage } from '../types/budget';

export const defaultStages: RenovationStage[] = [
  { id: 'stage-hard', name: '硬装', order: 1, icon: '🏗️' },
  { id: 'stage-soft', name: '软装', order: 2, icon: '🛋️' },
];
