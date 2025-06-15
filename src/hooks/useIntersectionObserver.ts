
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

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    console.log('Setting up intersection observer for element:', element);

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('Intersection observer triggered:', {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          threshold
        });
        
        if (entry.isIntersecting) {
          console.log('Element is visible, triggering animation');
          setIsVisible(true);
          // Once visible, we don't need to observe anymore
          observer.unobserve(element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      console.log('Cleaning up intersection observer');
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { elementRef, isVisible };
};
