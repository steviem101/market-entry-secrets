
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
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="keyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0f9ff" />
          </linearGradient>
        </defs>
        
        {/* Main background */}
        <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
        
        {/* Key symbol representing "secrets" */}
        <g transform="translate(12, 10)">
          {/* Key head (circular part) */}
          <circle cx="4" cy="6" r="3.5" stroke="url(#keyGradient)" strokeWidth="1.5" fill="none" />
          <circle cx="4" cy="6" r="1.5" fill="url(#keyGradient)" />
          
          {/* Key shaft */}
          <rect x="7" y="5.2" width="8" height="1.6" fill="url(#keyGradient)" rx="0.8" />
          
          {/* Key teeth */}
          <rect x="13" y="6.8" width="2" height="2" fill="url(#keyGradient)" />
          <rect x="11" y="6.8" width="1.5" height="1.5" fill="url(#keyGradient)" />
        </g>
        
        {/* Arrow pointing upward/forward representing growth and entry */}
        <g transform="translate(22, 22)">
          <path 
            d="M8 6 L4 2 L0 6 M4 2 L4 14" 
            stroke="url(#keyGradient)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill="none"
          />
        </g>
        
        {/* Small dots representing market opportunities */}
        <circle cx="10" cy="25" r="1" fill="rgba(255,255,255,0.6)" />
        <circle cx="14" cy="28" r="0.8" fill="rgba(255,255,255,0.4)" />
        <circle cx="26" cy="12" r="0.8" fill="rgba(255,255,255,0.4)" />
      </svg>
    </div>
  );
};

export default MarketEntryLogo;
