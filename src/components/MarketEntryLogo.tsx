
import React from 'react';

interface MarketEntryLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const MarketEntryLogo = ({ className = "", size = "md" }: MarketEntryLogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-16 h-16"
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <img
        src="/lovable-uploads/7ba5cb67-948a-4a2f-a3a6-24290072be1d.png"
        alt="Market Entry Secrets Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default MarketEntryLogo;
