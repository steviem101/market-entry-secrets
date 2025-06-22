
import React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className }: PageTransitionProps) => {
  return (
    <div 
      className={cn(
        "page-content",
        className
      )}
    >
      {children}
    </div>
  );
};
