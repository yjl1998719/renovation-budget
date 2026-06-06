import { useState } from 'react';
import type { RenovationStage } from '../../types/budget';
import { useApp } from '../../context/AppContext';
import AnimatedModal from '../shared/AnimatedModal';
import styles from './EditAllocationModal.module.css';

interface Props {
  stageId: string;
  stages: RenovationStage[];
  onSave: (stageId: string, amount: number) => void;
  onClose: () => void;
}

export default function EditAllocationModal({ stageId, stages, onSave, onClose }: Props) {
  const { data } = useApp();
  const stage = stages.find((s) => s.id === stageId);
  const alloc = data.fund.allocations.find((a) => a.stageId === stageId);
  const [value, setValue] = useState(alloc?.allocatedAmount.toString() ?? '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(stageId, parseFloat(value) || 0);
  };

  if (!stage) return null;

  return (
    <AnimatedModal onClose={onClose} maxWidth={360}>
      <h3 className={styles.title}>设置阶段预算</h3>
      <div className={styles.stageInfo}>
        <span>{stage.icon}</span>
        <span>{stage.name}</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>预算金额 (元)</label>
          <input
            className={styles.fieldInput}
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            min="0"
            step="any"
            autoFocus
          />
        </div>
        <div className={styles.buttons}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>取消</button>
          <button type="submit" className={styles.saveBtn}>保存</button>
        </div>
      </form>
    </AnimatedModal>
  );
}
