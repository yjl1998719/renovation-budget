import type { ReactNode } from 'react';
import { useAnimatedPresence } from '../../hooks/useAnimatedPresence';
import styles from './AnimatedModal.module.css';

interface Props {
  children: ReactNode;
  onClose: () => void;
  /** Override the default max-width (380px) */
  maxWidth?: number;
}

export default function AnimatedModal({ children, onClose, maxWidth }: Props) {
  const { closing, initiateClose } = useAnimatedPresence({ onClose });

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.overlayClosing : ''}`}
      onClick={initiateClose}
    >
      <div
        className={`${styles.modal} ${closing ? styles.modalClosing : ''}`}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
