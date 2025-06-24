
import { useState, useEffect } from "react";

interface RotatingTextProps {
  words: string[];
  className?: string;
  duration?: number;
}

export const RotatingText = ({ 
  words, 
  className = "", 
  duration = 2000 
}: RotatingTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    if (isAnimationComplete) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % words.length;
          
          // If we've completed a full cycle (back to index 0)
          if (nextIndex === 0) {
            setCycleCount(prev => {
              const newCycleCount = prev + 1;
              // Stop after 3 complete cycles
              if (newCycleCount >= 3) {
                setIsAnimationComplete(true);
              }
              return newCycleCount;
            });
          }
          
          return nextIndex;
        });
        setIsVisible(true);
      }, 150); // Brief pause for transition effect
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration, isAnimationComplete]);

  return (
    <span 
      className={`inline-block transition-all duration-150 ${
        isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'
      } ${className}`}
    >
      {words[currentWordIndex]}
    </span>
  );
};
