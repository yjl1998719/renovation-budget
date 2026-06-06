import { useState } from 'react';
import type { ExpenseRecord } from '../../types/expense';
import type { RenovationStage } from '../../types/budget';
import AnimatedModal from '../shared/AnimatedModal';
import styles from './EditExpenseModal.module.css';

interface Props {
  expense: ExpenseRecord;
  stages: RenovationStage[];
  onSave: (updates: Partial<ExpenseRecord>) => void;
  onClose: () => void;
}

export default function EditExpenseModal({ expense, stages, onSave, onClose }: Props) {
  const [name, setName] = useState(expense.name);
  const [estimatedAmount, setEstimatedAmount] = useState(expense.estimatedAmount.toString());
  const [depositAmount, setDepositAmount] = useState(expense.depositAmount.toString());
  const [hasBalance, setHasBalance] = useState(expense.hasBalance);
  const [balanceAmount, setBalanceAmount] = useState(expense.balanceAmount.toString());
  const [balancePaid, setBalancePaid] = useState(expense.balancePaid);
  const [balancePaidDate, setBalancePaidDate] = useState(expense.balancePaidDate);
  const [vendor, setVendor] = useState(expense.vendor);
  const [date, setDate] = useState(expense.date);
  const [notes, setNotes] = useState(expense.notes);
  const [stageId, setStageId] = useState(expense.stageId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      estimatedAmount: parseFloat(estimatedAmount) || 0,
      depositAmount: parseFloat(depositAmount) || 0,
      hasBalance,
      balanceAmount: hasBalance ? (parseFloat(balanceAmount) || 0) : 0,
      balancePaid,
      balancePaidDate,
      vendor: vendor.trim(),
      date,
      notes: notes.trim(),
      stageId,
    });
  };

  const totalPaid = (parseFloat(depositAmount) || 0) + (balancePaid ? parseFloat(balanceAmount) || 0 : 0);

  return (
    <AnimatedModal onClose={onClose}>
      <h3 className={styles.title}>编辑花费记录</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>项目名称</label>
          <input className={styles.fieldInput} type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>预估总价 (元)</label>
          <input className={styles.fieldInput} type="number" value={estimatedAmount} onChange={(e) => setEstimatedAmount(e.target.value)} min="0" step="any" />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>定金金额 (元)</label>
          <input className={styles.fieldInput} type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} min="0" step="any" />
        </div>
        <div className={styles.field}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#666' }}>
            <input type="checkbox" checked={hasBalance} onChange={(e) => setHasBalance(e.target.checked)} style={{ accentColor: '#e8a87c' }} />
            分期付款（有尾款）
          </label>
        </div>
        {hasBalance && (
          <>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>尾款金额 (元)</label>
              <input className={styles.fieldInput} type="number" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} min="0" step="any" />
            </div>
            <div className={styles.field}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#666' }}>
                <input type="checkbox" checked={balancePaid} onChange={(e) => {
                  setBalancePaid(e.target.checked);
                  if (e.target.checked && !balancePaidDate) setBalancePaidDate(new Date().toISOString().slice(0, 10));
                }} style={{ accentColor: '#7ec8c8' }} />
                尾款已支付
              </label>
            </div>
            {balancePaid && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>尾款支付日期</label>
                <input className={styles.fieldInput} type="date" value={balancePaidDate} onChange={(e) => setBalancePaidDate(e.target.value)} />
              </div>
            )}
          </>
        )}
        <div className={styles.field} style={{ textAlign: 'right', fontSize: 13, color: '#e8a87c', fontWeight: 600 }}>
          已付合计：¥{totalPaid.toLocaleString()}
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>商家</label>
          <input className={styles.fieldInput} type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>日期</label>
          <input className={styles.fieldInput} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>所属阶段</label>
          <select className={styles.fieldInput} value={stageId} onChange={(e) => setStageId(e.target.value)}>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>备注</label>
          <input className={styles.fieldInput} type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div className={styles.buttons}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>取消</button>
          <button type="submit" className={styles.saveBtn}>保存</button>
        </div>
      </form>
    </AnimatedModal>
  );
}
