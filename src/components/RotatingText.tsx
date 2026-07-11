
import { useState, useEffect } from "react";

interface RotatingTextProps {
  words: string[];
  className?: string;
  duration?: number;
  loop?: boolean;
}

export const RotatingText = ({ 
  words, 
  className = "", 
  duration = 2000,
  loop = false,
}: RotatingTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [showFinalWord, setShowFinalWord] = useState(false);

  useEffect(() => {
    if (!loop && isAnimationComplete && showFinalWord) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % words.length;
          
          // If we've completed a full cycle (back to index 0), and not looping forever
          if (!loop && nextIndex === 0) {
            setCycleCount(prev => {
              const newCycleCount = prev + 1;
              // After 2 complete cycles, show "Secrets"
              if (newCycleCount >= 2) {
                setIsAnimationComplete(true);
                // Small delay before showing final word
                setTimeout(() => {
                  setShowFinalWord(true);
                }, 300);
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
  }, [words.length, duration, isAnimationComplete, showFinalWord, loop]);

  // Show "Secrets" as the final word after cycling
  const displayWord = !loop && showFinalWord ? "Secrets" : words[currentWordIndex];

  return (
    <span 
      className={`inline-block transition-all duration-150 ${
        isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'
      } ${className}`}
    >
      {displayWord}
    </span>
  );
};
