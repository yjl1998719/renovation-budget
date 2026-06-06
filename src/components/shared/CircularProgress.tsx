import styles from './CircularProgress.module.css';

export interface RingSegment {
  percent: number;
  color: string;
}

interface Props {
  segments: RingSegment[];
  value: string;
  label: string;
}

export default function CircularProgress({ segments, value, label }: Props) {
  // Build conic-gradient from segments
  const gradientParts: string[] = [];
  let accumulated = 0;
  for (const seg of segments) {
    const from = accumulated;
    const to = accumulated + seg.percent;
    gradientParts.push(`${seg.color} ${from}% ${to}%`);
    accumulated = to;
  }
  // Fill remaining with bg color
  if (accumulated < 100) {
    gradientParts.push(`#eee ${accumulated}% 100%`);
  }
  const gradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className={styles.ring}>
      <div
        className={styles.ringCircle}
        style={{ background: gradient }}
      >
        <div className={styles.ringInner} />
      </div>
      <div className={styles.center}>
        <span className={styles.centerValue}>{value}</span>
        <span className={styles.centerLabel}>{label}</span>
      </div>
    </div>
  );
}
