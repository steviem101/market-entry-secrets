import React from 'react';
import logoImage from '@/assets/market-entry-secrets-logo.png';

interface MarketEntryLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const MarketEntryLogo = ({ className = "", size = "md" }: MarketEntryLogoProps) => {
  const sizeClasses = {
    sm: "h-10 w-auto",
    md: "h-14 w-auto", 
    lg: "h-20 w-auto"
  };

  return (
    <img
      src={logoImage}
      alt="Market Entry Secrets Logo"
      className={`${sizeClasses[size]} ${className} object-contain`}
    />
  );
};

export default MarketEntryLogo;
