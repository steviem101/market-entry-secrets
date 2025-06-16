
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
    
    if (!isVisible || hasStarted || end === start) {
      console.log('Not starting animation:', { isVisible, hasStarted, end, start });
      return;
    }

    console.log('Starting count-up animation from', start, 'to', end);
    setHasStarted(true);
    
    const startTime = Date.now();
    const totalSteps = end - start;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = start + (totalSteps * progress);
      const roundedValue = Math.floor(currentValue);
      
      console.log('Updating count to:', roundedValue, 'progress:', progress);
      setCount(roundedValue);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        console.log('Animation completed, final count:', end);
        setCount(end);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        console.log('Canceling animation frame');
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isVisible, hasStarted, start, end, duration]);

  // Reset when visibility changes back to false (for re-triggering)
  useEffect(() => {
    if (!isVisible && hasStarted) {
      console.log('Resetting count-up state');
      setCount(start);
      setHasStarted(false);
    }
  }, [isVisible, hasStarted, start]);

  return count;
};
