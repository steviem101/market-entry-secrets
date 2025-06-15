
import { useState, useEffect, useRef } from 'react';

interface UseCountUpProps {
  end: number;
  duration?: number;
  start?: number;
  isVisible?: boolean;
}

export const useCountUp = ({ end, duration = 2000, start = 0, isVisible = false }: UseCountUpProps) => {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!isVisible || hasStarted) return;

    setHasStarted(true);
    const startTime = Date.now();
    const startValue = start;
    const endValue = end;

    const updateCount = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startValue + (endValue - startValue) * easeOutQuart);
      
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(updateCount);
      }
    };

    frameRef.current = requestAnimationFrame(updateCount);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isVisible, hasStarted, start, end, duration]);

  return count;
};
