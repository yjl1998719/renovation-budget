import { useState, useEffect, useCallback } from 'react';

interface AnimatedPresenceOptions {
  onClose: () => void;
  animationDuration?: number;
}

export function useAnimatedPresence({ onClose, animationDuration = 200 }: AnimatedPresenceOptions) {
  const [closing, setClosing] = useState(false);

  const initiateClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, animationDuration);
  }, [onClose, animationDuration]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') initiateClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [initiateClose]);

  return { closing, initiateClose };
}
