import { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation';
import type { Page } from './components/Navigation/Navigation';
import OverviewPage from './components/OverviewPage/OverviewPage';
import FundPage from './components/FundPage/FundPage';
import ExpensesPage from './components/ExpensesPage/ExpensesPage';
import Toolbar from './components/Toolbar/Toolbar';
import PageTransition from './components/shared/PageTransition';
import ToastContainer, { showToast } from './components/shared/ToastContainer';
import { useApp } from './context/AppContext';
import styles from './App.module.css';

export default function App() {
  const [page, setPage] = useState<Page>('overview');
  const { importFromShareUrl } = useApp();

  // Check for shared data in URL hash on mount
  useEffect(() => {
    if (window.location.hash.startsWith('#data=')) {
      const ok = importFromShareUrl(window.location.hash);
      if (ok) {
        showToast('数据已从分享链接导入', 'info');
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>装修预算管理</h1>
      <p className={styles.subtitle}>基金规划 · 花费记录 · 一目了然</p>
      <Toolbar />

      {page === 'overview' && (
        <PageTransition key="overview">
          <OverviewPage onNavigate={setPage} />
        </PageTransition>
      )}
      {page === 'fund' && (
        <PageTransition key="fund">
          <FundPage />
        </PageTransition>
      )}
      {page === 'expenses' && (
        <PageTransition key="expenses">
          <ExpensesPage />
        </PageTransition>
      )}

      <Navigation active={page} onChange={setPage} />
      <ToastContainer />
    </div>
  );
}
