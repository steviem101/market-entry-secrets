
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
    console.log('useCountUp effect triggered:', { isVisible, hasStarted, start, end });
    
    if (!isVisible || hasStarted) {
      console.log('Not starting animation:', { isVisible, hasStarted });
      return;
    }

    console.log('Starting count-up animation from', start, 'to', end);
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
      
      console.log('Updating count:', { elapsed, progress, current });
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(updateCount);
      } else {
        console.log('Animation completed');
      }
    };

    frameRef.current = requestAnimationFrame(updateCount);

    return () => {
      if (frameRef.current) {
        console.log('Canceling animation frame');
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isVisible, hasStarted, start, end, duration]);

  return count;
};
