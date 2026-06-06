import styles from './Navigation.module.css';

export type Page = 'overview' | 'fund' | 'expenses';

interface Props {
  active: Page;
  onChange: (page: Page) => void;
}

const tabs: { key: Page; icon: string; label: string }[] = [
  { key: 'overview', icon: '📊', label: '总览' },
  { key: 'fund', icon: '💰', label: '基金' },
  { key: 'expenses', icon: '💳', label: '花费' },
];

export default function Navigation({ active, onChange }: Props) {
  return (
    <nav className={styles.nav}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${active === tab.key ? styles.tabActive : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
