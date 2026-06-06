import { useState } from 'react';
import Navigation from './components/Navigation/Navigation';
import type { Page } from './components/Navigation/Navigation';
import OverviewPage from './components/OverviewPage/OverviewPage';
import FundPage from './components/FundPage/FundPage';
import ExpensesPage from './components/ExpensesPage/ExpensesPage';
import Toolbar from './components/Toolbar/Toolbar';
import PageTransition from './components/shared/PageTransition';
import ToastContainer from './components/shared/ToastContainer';
import styles from './App.module.css';

export default function App() {
  const [page, setPage] = useState<Page>('overview');

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
