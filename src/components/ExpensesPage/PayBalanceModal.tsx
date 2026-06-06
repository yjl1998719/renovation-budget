import { useState } from 'react';
import { formatCurrency } from '../../utils/calculations';
import AnimatedModal from '../shared/AnimatedModal';
import styles from './PayBalanceModal.module.css';

interface Props {
  itemName: string;
  balanceAmount: number;
  onPay: (date: string) => void;
  onClose: () => void;
}

export default function PayBalanceModal({ itemName, balanceAmount, onPay, onClose }: Props) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPay(date);
  };

  return (
    <AnimatedModal onClose={onClose} maxWidth={340}>
      <h3 className={styles.title}>支付尾款</h3>
      <p className={styles.info}>
        <strong>{itemName}</strong>
      </p>
      <p className={styles.amount}>尾款金额：{formatCurrency(balanceAmount)}</p>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>支付日期</label>
          <input
            className={styles.fieldInput}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className={styles.buttons}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>取消</button>
          <button type="submit" className={styles.payBtn}>确认支付</button>
        </div>
      </form>
    </AnimatedModal>
  );
}
