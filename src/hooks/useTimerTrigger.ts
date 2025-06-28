
import { useState, useEffect } from 'react';

interface UseTimerTriggerProps {
  delay?: number; // Delay in milliseconds
  enabled?: boolean;
}

export const useTimerTrigger = ({ 
  delay = 15000, // 15 seconds default
  enabled = true 
}: UseTimerTriggerProps = {}) => {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!enabled || triggered) return;

    const timer = setTimeout(() => {
      setTriggered(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, enabled, triggered]);

  return { triggered, setTriggered };
};
