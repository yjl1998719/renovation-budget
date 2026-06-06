import { useState } from 'react';
import type { FundSource } from '../../types/fund';
import { FUND_SOURCE_COLORS } from '../../utils/constants';
import AnimatedModal from '../shared/AnimatedModal';
import styles from './AddFundSourceModal.module.css';

interface Props {
  source?: FundSource;
  onSave: (source: Omit<FundSource, 'id'>) => void;
  onClose: () => void;
}

export default function AddFundSourceModal({ source, onSave, onClose }: Props) {
  const isEdit = !!source;
  const [name, setName] = useState(source?.name ?? '');
  const [amount, setAmount] = useState(source?.amount.toString() ?? '');
  const [color, setColor] = useState(source?.color ?? FUND_SOURCE_COLORS[0]);
  const [notes, setNotes] = useState(source?.notes ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      color,
      notes: notes.trim(),
    });
  };

  return (
    <AnimatedModal onClose={onClose}>
      <h3 className={styles.title}>{isEdit ? '编辑资金来源' : '添加资金来源'}</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>来源名称</label>
          <input
            className={styles.fieldInput}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：家庭储蓄、公积金贷款"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>金额 (元)</label>
          <input
            className={styles.fieldInput}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="any"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>颜色标记</label>
          <div className={styles.colors}>
            {FUND_SOURCE_COLORS.map((c) => (
              <div
                key={c}
                className={`${styles.colorDot} ${color === c ? styles.colorDotActive : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>备注（可选）</label>
          <input
            className={styles.fieldInput}
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="备注信息"
          />
        </div>
        <div className={styles.buttons}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>取消</button>
          <button type="submit" className={styles.saveBtn}>{isEdit ? '保存' : '添加'}</button>
        </div>
      </form>
    </AnimatedModal>
  );
}
