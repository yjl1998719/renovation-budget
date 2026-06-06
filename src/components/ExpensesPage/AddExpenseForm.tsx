import { useState } from 'react';
import type { ExpenseRecord } from '../../types/expense';
import styles from './AddExpenseForm.module.css';

interface Props {
  stageId: string;
  onAdd: (expense: Omit<ExpenseRecord, 'id'>) => void;
  onCancel: () => void;
}

export default function AddExpenseForm({ stageId, onAdd, onCancel }: Props) {
  const [name, setName] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [deposit, setDeposit] = useState('');
  const [hasBalance, setHasBalance] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      stageId,
      name: name.trim(),
      estimatedAmount: parseFloat(estimatedAmount) || 0,
      depositAmount: parseFloat(deposit) || 0,
      hasBalance,
      balanceAmount: hasBalance ? (parseFloat(balanceAmount) || 0) : 0,
      balancePaid: false,
      balancePaidDate: '',
      vendor: vendor.trim(),
      date,
      notes: notes.trim(),
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fields}>
        <input
          className={`${styles.input} ${styles.fullWidth}`}
          type="text"
          placeholder="项目名称 *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className={styles.input}
          type="number"
          placeholder="预估总价"
          value={estimatedAmount}
          onChange={(e) => setEstimatedAmount(e.target.value)}
          min="0"
          step="any"
        />
        <input
          className={styles.input}
          type="number"
          placeholder="定金金额"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
          min="0"
          step="any"
        />
        <input
          className={styles.input}
          type="text"
          placeholder="商家（可选）"
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
        />
        <input
          className={styles.input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {/* Balance toggle */}
        <label className={`${styles.input} ${styles.toggleLabel}`} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', border: 'none', padding: 0, background: 'none', fontSize: 13, color: '#666' }}>
          <input
            type="checkbox"
            checked={hasBalance}
            onChange={(e) => setHasBalance(e.target.checked)}
            style={{ accentColor: '#e8a87c' }}
          />
          分期付款（有尾款）
        </label>
        {hasBalance && (
          <input
            className={styles.input}
            type="number"
            placeholder="尾款金额"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            min="0"
            step="any"
          />
        )}
        <input
          className={`${styles.input} ${styles.fullWidth}`}
          type="text"
          placeholder="备注（可选）"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className={styles.buttons}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>取消</button>
        <button type="submit" className={styles.submitBtn}>添加</button>
      </div>
    </form>
  );
}
