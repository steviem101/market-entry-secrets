
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

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsVisible(true);
      }, 150); // Brief pause for transition effect
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

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
