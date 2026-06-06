import styles from './PageTransition.module.css';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className={styles.wrapper}>{children}</div>;
}
