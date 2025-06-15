
import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
}

export const useIntersectionObserver = ({ 
  threshold = 0.1, 
  rootMargin = '0px' 
}: UseIntersectionObserverProps = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  const handleIntersection = useCallback(([entry]: IntersectionObserverEntry[]) => {
    console.log('Intersection observer triggered:', {
      isIntersecting: entry.isIntersecting,
      intersectionRatio: entry.intersectionRatio,
      threshold
    });
    
    if (entry.isIntersecting && !isVisible) {
      console.log('Element is visible, triggering animation');
      setIsVisible(true);
    }
  }, [threshold, isVisible]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || isVisible) return;

    console.log('Setting up intersection observer for element:', element);

    observerRef.current = new IntersectionObserver(handleIntersection, { 
      threshold, 
      rootMargin 
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        console.log('Cleaning up intersection observer');
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, handleIntersection, isVisible]);

  return { elementRef, isVisible };
};
