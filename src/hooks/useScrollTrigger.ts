
import { useState, useEffect } from 'react';

interface UseScrollTriggerProps {
  threshold?: number; // Percentage of page scrolled (0-100)
  enabled?: boolean;
}

export const useScrollTrigger = ({ 
  threshold = 50, 
  enabled = true 
}: UseScrollTriggerProps = {}) => {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!enabled || triggered) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;

      if (scrollPercent >= threshold) {
        setTriggered(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, enabled, triggered]);

  return { triggered, setTriggered };
};
