import styles from './ProgressBar.module.css';

interface Props {
  label: string;
  value: string;
  percent: number;
}

export default function ProgressBar({ label, value, percent }: Props) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const fillClass =
    clamped >= 100 ? styles.fillOver :
    clamped >= 75 ? styles.fillWarn :
    styles.fillNormal;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value} ({Math.round(clamped)}%)</span>
      </div>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${fillClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
