import { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { showToast } from '../shared/ToastContainer';
import styles from './Toolbar.module.css';

export default function Toolbar() {
  const { handleExport, handleShare, importData, resetData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importData(reader.result as string);
      if (ok) {
        showToast('数据导入成功', 'info');
      } else {
        showToast('导入失败：文件格式不正确', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('确定要重置所有数据吗？此操作不可恢复。')) {
      resetData();
      showToast('数据已重置', 'info');
    }
  };

  const handleCopyShareLink = () => {
    handleShare();
    setCopied(true);
    showToast('分享链接已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.toolbar}>
      <button className={styles.btn} onClick={handleCopyShareLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        {copied ? '已复制' : '分享'}
      </button>
      <button className={styles.btn} onClick={handleExport}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        导出
      </button>
      <button className={styles.btn} onClick={handleImport}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="3 10 8 15 13 10"/><line x1="8" y1="15" x2="8" y2="3"/></svg>
        导入
      </button>
      <button className={`${styles.btn} ${styles.dangerBtn}`} onClick={handleReset}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        重置
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />
    </div>
  );
}
