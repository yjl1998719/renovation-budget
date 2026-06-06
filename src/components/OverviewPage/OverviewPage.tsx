import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import CircularProgress from '../shared/CircularProgress';
import type { RingSegment } from '../shared/CircularProgress';
import ProgressBar from '../shared/ProgressBar';
import EmptyState from '../shared/EmptyState';
import styles from './OverviewPage.module.css';

interface Props {
  onNavigate?: (page: 'fund' | 'expenses') => void;
}

export default function OverviewPage({ onNavigate }: Props) {
  const app = useApp();
  const { fundSummary, expensesSummary } = app;

  const totalFund = fundSummary.totalFund;
  const totalDeposit = expensesSummary.totalDeposit;
  const totalBalancePaid = expensesSummary.totalBalancePaid;
  const totalBalanceUnpaid = expensesSummary.totalBalanceUnpaid;
  // 实际可用 = 总资金 - 所有已承诺金额（定金 + 尾款全部）
  const totalCommitted = totalDeposit + totalBalancePaid + totalBalanceUnpaid;
  const actuallyAvailable = totalFund - totalCommitted;

  const hasAnyData = totalFund > 0 || totalCommitted > 0;

  // Breakdown proportions for the stacked bar
  const depositPct = totalFund > 0 ? (totalDeposit / totalFund) * 100 : 0;
  const balancePaidPct = totalFund > 0 ? (totalBalancePaid / totalFund) * 100 : 0;
  const unpaidPct = totalFund > 0 ? (totalBalanceUnpaid / totalFund) * 100 : 0;
  const availPct = totalFund > 0 ? Math.max(actuallyAvailable / totalFund * 100, 0) : 100;

  return (
    <div className={styles.page}>
      {/* Stat cards */}
      <div className={styles.cards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>总资金</div>
          <div className={`${styles.statValue} ${styles.fundColor}`}>{formatCurrency(totalFund)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>实际可用</div>
          <div className={`${styles.statValue} ${actuallyAvailable > 0 ? styles.spentColor : styles.balanceColor}`}>
            {formatCurrency(actuallyAvailable)}
          </div>
          <div className={styles.statSub}>总资金 - 已承诺支出</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>已付定金</div>
          <div className={`${styles.statValue} ${styles.depositColor}`}>{formatCurrency(totalDeposit)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>尾款状态</div>
          <div className={`${styles.statValue} ${styles.balanceColor}`} style={{ fontSize: 16 }}>
            已付 {formatCurrency(totalBalancePaid)}
          </div>
          {totalBalanceUnpaid > 0 && (
            <div className={styles.statSub} style={{ color: '#e07a5f' }}>待付 {formatCurrency(totalBalanceUnpaid)}</div>
          )}
        </div>
      </div>

      {/* Circular progress + breakdown */}
      {hasAnyData ? (
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>资金使用情况</div>
          <CircularProgress
            segments={[
              { percent: depositPct, color: '#f0c75e' },
              { percent: balancePaidPct, color: '#95b8d1' },
              ...(totalBalanceUnpaid > 0 ? [{ percent: unpaidPct, color: '#e8a87c' }] : []),
              { percent: availPct, color: '#eee' },
            ] as RingSegment[]}
            value={formatCurrency(actuallyAvailable)}
            label="实际可用"
          />
          {/* Stacked breakdown bar */}
          <div className={styles.breakdown}>
            <div className={styles.breakdownBar}>
              <div className={styles.breakDeposit} style={{ flex: depositPct > 0 ? depositPct : 0.1 }} />
              <div className={styles.breakBalance} style={{ flex: balancePaidPct > 0 ? balancePaidPct : 0.1 }} />
              {totalBalanceUnpaid > 0 && (
                <div className={styles.breakUnpaid} style={{ flex: unpaidPct > 0 ? unpaidPct : 0.1 }} />
              )}
              <div className={styles.breakRest} style={{ flex: availPct > 0 ? availPct : 0.1 }} />
            </div>
            <div className={styles.breakdownLegend}>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotDeposit}`} />
                定金 {formatCurrency(totalDeposit)}
              </span>
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotBalance}`} />
                尾款已付 {formatCurrency(totalBalancePaid)}
              </span>
              {totalBalanceUnpaid > 0 && (
                <span className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendDotUnpaid}`} />
                  待付 {formatCurrency(totalBalanceUnpaid)}
                </span>
              )}
              <span className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendDotRest}`} />
                实际可用 {formatCurrency(Math.max(actuallyAvailable, 0))}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.chartCard}>
          <EmptyState icon="📊" text="添加基金和花费后，这里将显示数据概览" />
        </div>
      )}

      {/* Stage progress bars */}
      {expensesSummary.stageSummaries.some((s) => s.totalSpent > 0 || s.totalEstimated > 0) && (
        <div className={styles.stageCard}>
          <div className={styles.stageCardTitle}>各阶段花费明细</div>
          {expensesSummary.stageSummaries.map((ss) => {
            if (ss.totalSpent === 0 && ss.totalEstimated === 0) return null;
            const stage = app.stages.find((s) => s.id === ss.stageId);
            return (
              <div key={ss.stageId} className={styles.stageItem}>
                <ProgressBar
                  label={`${stage?.icon ?? ''} ${ss.stageName}`}
                  value={`${formatCurrency(ss.totalSpent)} / ${formatCurrency(ss.totalEstimated)}`}
                  percent={ss.percentUsed}
                />
                {(ss.totalDeposit > 0 || ss.totalBalancePaid > 0 || ss.totalBalanceUnpaid > 0) && (
                  <div className={styles.stagePayDetail}>
                    定金 {formatCurrency(ss.totalDeposit)} · 尾款已付 {formatCurrency(ss.totalBalancePaid)}
                    {ss.totalBalanceUnpaid > 0 && <> · 待付 <span style={{ color: '#e07a5f' }}>{formatCurrency(ss.totalBalanceUnpaid)}</span></>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick actions */}
      <div className={styles.actions}>
        <button
          className={styles.quickBtn}
          onClick={() => onNavigate?.('fund')}
        >
          <span className={styles.quickBtnIcon}>💰</span>
          管理基金
        </button>
        <button
          className={styles.quickBtn}
          onClick={() => onNavigate?.('expenses')}
        >
          <span className={styles.quickBtnIcon}>💳</span>
          记录花费
        </button>
      </div>
    </div>
  );
}
