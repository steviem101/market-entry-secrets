
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className }: PageTransitionProps) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      
      // Start exit transition
      const exitTimer = setTimeout(() => {
        setDisplayLocation(location);
        
        // Start enter transition
        const enterTimer = setTimeout(() => {
          setIsTransitioning(false);
        }, 50);

        return () => clearTimeout(enterTimer);
      }, 150);

      return () => clearTimeout(exitTimer);
    }
  }, [location, displayLocation]);

  return (
    <div 
      className={cn(
        "page-content transition-all duration-200 ease-out",
        isTransitioning && "opacity-90 translate-y-1",
        className
      )}
      key={displayLocation.pathname}
    >
      {children}
    </div>
  );
};
