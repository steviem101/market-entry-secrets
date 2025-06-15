
import { useState, useEffect, useRef } from 'react';

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

  useEffect(() => {
    const element = elementRef.current;
    if (!element || isVisible) return;

    console.log('Setting up intersection observer for element:', element);

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      console.log('Intersection observer triggered:', {
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
        threshold
      });
      
      if (entry.isIntersecting) {
        console.log('Element is visible, triggering animation');
        setIsVisible(true);
      }
    };

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
  }, [threshold, rootMargin, isVisible]);

  return { elementRef, isVisible };
};
