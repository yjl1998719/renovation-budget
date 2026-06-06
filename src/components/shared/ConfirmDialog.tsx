import AnimatedModal from './AnimatedModal';
import styles from './ConfirmDialog.module.css';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = '确定',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
  danger = false,
}: Props) {
  return (
    <AnimatedModal onClose={onCancel} maxWidth={360}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      <div className={styles.buttons}>
        <button className={styles.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
        <button
          className={`${styles.confirmBtn} ${danger ? styles.danger : ''}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </AnimatedModal>
  );
}
