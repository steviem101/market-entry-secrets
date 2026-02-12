
import { useState, useEffect, useRef } from 'react';

interface UseScrollSpyProps {
  sectionIds: string[];
  rootMargin?: string;
  threshold?: number;
}

export const useScrollSpy = ({ 
  sectionIds, 
  rootMargin = '-20% 0px -60% 0px',
  threshold = 0.1 
}: UseScrollSpyProps) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold
    });

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sectionIds, rootMargin, threshold]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return { activeSection, scrollToSection };
};
