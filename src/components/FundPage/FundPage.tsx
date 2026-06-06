import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import CountUp from '../shared/CountUp';
import AddFundSourceModal from './AddFundSourceModal';
import EditAllocationModal from './EditAllocationModal';
import EmptyState from '../shared/EmptyState';
import ConfirmDialog from '../shared/ConfirmDialog';
import { showToast } from '../shared/ToastContainer';
import styles from './FundPage.module.css';

export default function FundPage() {
  const app = useApp();
  const { data, fundSummary, stages } = app;
  const [showAddSource, setShowAddSource] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  const totalFund = fundSummary.totalFund;
  const reserve = fundSummary.unallocated;

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroLabel}>装修基金总额</div>
        <div className={styles.heroAmount}>
          <CountUp value={totalFund} formatter={formatCurrency} />
        </div>
        <button className={styles.heroAddBtn} onClick={() => setShowAddSource(true)}>
          + 添加资金来源
        </button>
      </div>

      {/* Fund Sources */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>资金来源</h3>
        {data.fund.sources.length === 0 ? (
          <EmptyState icon="💡" text="还没有添加资金来源，点击上方按钮添加" />
        ) : (
          <div className={styles.sources}>
            {data.fund.sources.map((s) => (
              <div key={s.id} className={styles.sourceRow}>
                <div className={styles.sourceColor} style={{ background: s.color }} />
                <span className={styles.sourceName}>{s.name}</span>
                <span className={styles.sourceAmount}>{formatCurrency(s.amount)}</span>
                <div className={styles.sourceActions}>
                  <button
                    className={styles.sourceActionBtn}
                    onClick={() => setEditingSourceId(s.id)}
                    title="编辑"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    className={styles.sourceActionBtn}
                    onClick={() => setDeletingSourceId(s.id)}
                    title="删除"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stage Allocations */}
      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>阶段预算分配</h3>
        {stages.map((stage) => {
          const alloc = data.fund.allocations.find((a) => a.stageId === stage.id);
          const amount = alloc?.allocatedAmount ?? 0;
          return (
            <div key={stage.id} className={styles.allocRow}>
              <span className={styles.allocIcon}>{stage.icon}</span>
              <span className={styles.allocName}>{stage.name}</span>
              <span
                className={`${styles.allocAmount} ${amount === 0 ? styles.allocZero : ''}`}
                onClick={() => setEditingStageId(stage.id)}
              >
                {formatCurrency(amount)}
              </span>
            </div>
          );
        })}
        <div className={styles.reserve}>
          {reserve >= 0 ? (
            <>未分配储备金：<span className={styles.reserveVal}>{formatCurrency(reserve)}</span></>
          ) : (
            <>分配超出资金：<span className={styles.reserveNeg}>{formatCurrency(Math.abs(reserve))}</span></>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddSource && (
        <AddFundSourceModal
          onSave={(source) => {
            app.addFundSource(source);
            setShowAddSource(false);
            showToast('资金来源已添加');
          }}
          onClose={() => setShowAddSource(false)}
        />
      )}
      {editingSourceId && (
        <AddFundSourceModal
          source={data.fund.sources.find((s) => s.id === editingSourceId)}
          onSave={(updates) => {
            app.updateFundSource(editingSourceId, updates);
            setEditingSourceId(null);
            showToast('资金来源已更新');
          }}
          onClose={() => setEditingSourceId(null)}
        />
      )}
      {deletingSourceId && (
        <ConfirmDialog
          title="删除资金来源"
          message="确定要删除这个资金来源吗？已分配的预算不会自动调整。"
          confirmLabel="删除"
          danger
          onConfirm={() => {
            app.deleteFundSource(deletingSourceId);
            setDeletingSourceId(null);
            showToast('资金来源已删除', 'info');
          }}
          onCancel={() => setDeletingSourceId(null)}
        />
      )}
      {editingStageId && (
        <EditAllocationModal
          stageId={editingStageId}
          stages={stages}
          onSave={(stageId, amount) => {
            const otherAllocated = data.fund.allocations
              .filter((a) => a.stageId !== stageId)
              .reduce((s, a) => s + a.allocatedAmount, 0);
            if (amount + otherAllocated > fundSummary.totalFund && fundSummary.totalFund > 0) {
              showToast('分配总额不能超过基金总额', 'error');
              return;
            }
            app.setAllocation(stageId, amount);
            setEditingStageId(null);
            showToast('预算分配已更新');
          }}
          onClose={() => setEditingStageId(null)}
        />
      )}
    </div>
  );
}
