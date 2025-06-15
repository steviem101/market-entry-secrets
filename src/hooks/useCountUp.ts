
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
  const startTimeRef = useRef<number>();

  useEffect(() => {
    console.log('useCountUp effect triggered:', { isVisible, hasStarted, start, end });
    
    if (!isVisible || hasStarted || end === start) {
      console.log('Not starting animation:', { isVisible, hasStarted, end, start });
      return;
    }

    console.log('Starting count-up animation from', start, 'to', end);
    setHasStarted(true);
    
    // Use a more stable animation approach
    let currentCount = start;
    const increment = (end - start) / (duration / 16); // 60fps = ~16ms per frame
    
    const animate = () => {
      currentCount += increment;
      
      if (currentCount >= end) {
        currentCount = end;
        console.log('Animation completed, final count:', currentCount);
        setCount(Math.floor(currentCount));
        return;
      }
      
      console.log('Updating count to:', Math.floor(currentCount));
      setCount(Math.floor(currentCount));
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        console.log('Canceling animation frame');
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isVisible, hasStarted, start, end, duration]);

  // Reset when visibility changes back to false
  useEffect(() => {
    if (!isVisible && hasStarted) {
      console.log('Resetting count-up state');
      setCount(start);
      setHasStarted(false);
    }
  }, [isVisible, hasStarted, start]);

  return count;
};
