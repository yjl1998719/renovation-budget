import { useState, useEffect, useCallback } from 'react';
import styles from './ToastContainer.module.css';

interface ToastItem {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
  closing: boolean;
}

let toastId = 0;

export function showToast(text: string, type: 'success' | 'error' | 'info' = 'success') {
  window.dispatchEvent(new CustomEvent('toast', { detail: { text, type, id: `toast-${++toastId}` } }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, closing: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const { text, type, id } = (e as CustomEvent).detail;
      setToasts((prev) => [...prev, { id, text, type, closing: false }]);
      setTimeout(() => removeToast(id), 2500);
    };
    window.addEventListener('toast', handler);
    return () => window.removeEventListener('toast', handler);
  }, [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type]} ${t.closing ? styles.toastClosing : ''}`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
