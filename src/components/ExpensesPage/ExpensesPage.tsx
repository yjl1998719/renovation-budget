import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import type { ExpenseRecord } from '../../types/expense';
import CountUp from '../shared/CountUp';
import AddExpenseForm from './AddExpenseForm';
import EditExpenseModal from './EditExpenseModal';
import PayBalanceModal from './PayBalanceModal';
import ConfirmDialog from '../shared/ConfirmDialog';
import { showToast } from '../shared/ToastContainer';
import styles from './ExpensesPage.module.css';

export default function ExpensesPage() {
  const app = useApp();
  const { data, stages, expensesSummary, fundSummary } = app;
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(stages.map((s) => s.id)));
  const [showFormStage, setShowFormStage] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [payingBalance, setPayingBalance] = useState<ExpenseRecord | null>(null);

  const toggleStage = (stageId: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      {/* Header bar */}
      <div className={styles.headerBar}>
        <div className={styles.headerTitle}>花费概览</div>
        <div className={styles.headerAmounts}>
          <span className={styles.headerMain}>
            <CountUp value={expensesSummary.totalSpent} formatter={formatCurrency} />
          </span>
          <span className={styles.headerSub}>已付 / 预估 {formatCurrency(expensesSummary.totalEstimated)}</span>
        </div>
        <div className={styles.headerDetail}>
          <span>定金 {formatCurrency(expensesSummary.totalDeposit)}</span>
          <span>尾款已付 {formatCurrency(expensesSummary.totalBalancePaid)}</span>
          {expensesSummary.totalBalanceUnpaid > 0 && (
            <span style={{ color: '#ffd' }}>待付 {formatCurrency(expensesSummary.totalBalanceUnpaid)}</span>
          )}
        </div>
        <div className={styles.headerProgress}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(expensesSummary.percentUsed, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stage cards */}
      {stages.map((stage) => {
        const isExpanded = expandedStages.has(stage.id);
        const stageExpenses = data.expenses.filter((e) => e.stageId === stage.id);
        const ss = expensesSummary.stageSummaries.find((s) => s.stageId === stage.id);
        const totalSpent = ss?.totalSpent ?? 0;
        const totalEstimated = ss?.totalEstimated ?? 0;

        return (
          <div key={stage.id} className={styles.card}>
            <div className={styles.stageHeader} onClick={() => toggleStage(stage.id)}>
              <span className={styles.stageIcon}>{stage.icon}</span>
              <div className={styles.stageInfo}>
                <div className={styles.stageName}>{stage.name}</div>
                <div className={styles.stageMeta}>{stageExpenses.length} 笔花费</div>
              </div>
              <div className={styles.stageRight}>
                <div className={styles.stageSpent}>{formatCurrency(totalSpent)}</div>
                {totalEstimated > 0 && (
                  <div className={styles.stageEstimate}>预估 {formatCurrency(totalEstimated)}</div>
                )}
              </div>
              <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </span>
            </div>

            {isExpanded && (
              <div className={styles.stageBody}>
                {stageExpenses.length === 0 && !showFormStage && (
                  <div className={styles.empty}>暂无花费记录</div>
                )}
                {stageExpenses.map((exp) => {
                  const totalPaid = exp.depositAmount + (exp.balancePaid ? exp.balanceAmount : 0);
                  return (
                    <div key={exp.id} className={styles.expenseRow}>
                      <div className={styles.expenseTop}>
                        <div>
                          <span className={styles.expenseName}>{exp.name}</span>
                          {exp.vendor && (
                            <div className={styles.expenseVendor}>
                              {exp.vendor}{exp.date ? ` · ${exp.date}` : ''}
                            </div>
                          )}
                        </div>
                        <span className={styles.expenseEstimate}>
                          预估 {formatCurrency(exp.estimatedAmount)}
                        </span>
                      </div>
                      <div className={styles.expenseBottom}>
                        <div className={styles.payments}>
                          <span className={styles.paymentItem}>
                            <span className={styles.paymentLabel}>定金 </span>
                            <span className={`${styles.paymentVal} ${exp.depositAmount > 0 ? styles.paymentValPaid : ''}`}>
                              {formatCurrency(exp.depositAmount)}
                            </span>
                          </span>
                          {exp.hasBalance && (
                            exp.balancePaid ? (
                              <span className={styles.paymentItem}>
                                <span className={styles.paymentLabel}>尾款 </span>
                                <span className={`${styles.paymentVal} ${styles.paymentValPaid}`}>
                                  {formatCurrency(exp.balanceAmount)}
                                </span>
                                <span className={styles.paymentLabel}>
                                  {' '}{exp.balancePaidDate}
                                </span>
                              </span>
                            ) : (
                              <span className={styles.paymentItem}>
                                <span className={styles.paymentLabel}>尾款待付 </span>
                                <span className={`${styles.paymentVal} ${styles.paymentValUnpaid}`}>
                                  {formatCurrency(exp.balanceAmount)}
                                </span>
                              </span>
                            )
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {exp.hasBalance && !exp.balancePaid && (
                            <button
                              className={styles.payBtn}
                              onClick={(e) => { e.stopPropagation(); setPayingBalance(exp); }}
                            >
                              支付尾款
                            </button>
                          )}
                          <span className={styles.totalPaid}>{formatCurrency(totalPaid)}</span>
                          <div className={styles.expenseActions}>
                            <button className={styles.expenseBtn} onClick={(e) => { e.stopPropagation(); setEditingExpense(exp); }} title="编辑">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button className={styles.expenseBtn} onClick={(e) => { e.stopPropagation(); setDeletingExpenseId(exp.id); }} title="删除">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {showFormStage === stage.id ? (
                  <AddExpenseForm
                    stageId={stage.id}
                    onAdd={(expense) => {
                      app.addExpense(expense);
                      setShowFormStage(null);
                      showToast('花费记录已添加');
                    }}
                    onCancel={() => setShowFormStage(null)}
                  />
                ) : (
                  <button className={styles.addBtn} onClick={() => setShowFormStage(stage.id)}>
                    + 添加花费
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {fundSummary.totalAllocated === 0 && data.expenses.length > 0 && (
        <div className={styles.card} style={{ padding: 16, textAlign: 'center' }}>
          <span style={{ fontSize: 14, color: '#999' }}>
            已付总额：{formatCurrency(expensesSummary.totalSpent)}
          </span>
        </div>
      )}

      {/* Modals */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          stages={stages}
          onSave={(updates) => {
            app.updateExpense(editingExpense.id, updates);
            setEditingExpense(null);
            showToast('花费记录已更新');
          }}
          onClose={() => setEditingExpense(null)}
        />
      )}
      {deletingExpenseId && (
        <ConfirmDialog
          title="删除花费记录"
          message="确定要删除这条花费记录吗？"
          confirmLabel="删除"
          danger
          onConfirm={() => {
            app.deleteExpense(deletingExpenseId);
            setDeletingExpenseId(null);
            showToast('花费记录已删除', 'info');
          }}
          onCancel={() => setDeletingExpenseId(null)}
        />
      )}
      {payingBalance && (
        <PayBalanceModal
          itemName={payingBalance.name}
          balanceAmount={payingBalance.balanceAmount}
          onPay={(payDate) => {
            app.updateExpense(payingBalance.id, {
              balancePaid: true,
              balancePaidDate: payDate,
            });
            setPayingBalance(null);
            showToast('尾款已支付');
          }}
          onClose={() => setPayingBalance(null)}
        />
      )}
    </div>
  );
}
