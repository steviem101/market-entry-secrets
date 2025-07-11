import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";

interface FloatingCTAButtonProps {
  onClick: () => void;
}

export const FloatingCTAButton = ({ onClick }: FloatingCTAButtonProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Hide when near footer (within 200px)
      const nearFooter = scrollTop + windowHeight > documentHeight - 200;
      setIsNearFooter(nearFooter);
      
      // Show after scrolling 100px from top
      setIsVisible(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || isNearFooter) return null;

  return (
    <Button
      onClick={onClick}
      className="
        fixed bottom-6 right-6 z-40
        h-14 px-6
        bg-gradient-to-r from-orange-500 to-red-500 
        hover:from-orange-600 hover:to-red-600
        text-white font-semibold 
        shadow-lg hover:shadow-xl
        transition-all duration-300 
        hover:scale-105 
        group
        animate-fade-in
      "
      size="lg"
    >
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        <span className="hidden sm:inline">Get Free Report</span>
        <span className="sm:hidden">Report</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
    </Button>
  );
};