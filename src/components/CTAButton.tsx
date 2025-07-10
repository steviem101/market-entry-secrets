import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";

interface CTAButtonProps {
  onClick: () => void;
  className?: string;
}

export const CTAButton = ({ onClick, className = "" }: CTAButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`
        relative overflow-hidden 
        bg-gradient-to-r from-orange-500 to-red-500 
        hover:from-orange-600 hover:to-red-600
        text-white font-semibold 
        px-6 py-2.5 
        border-0 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 
        hover:scale-105 
        hover:-translate-y-0.5
        group
        ${className}
      `}
    >
      <div className="flex items-center gap-2 relative z-10">
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Get Your Market Entry Report</span>
        <span className="sm:hidden">Get Report</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
    </Button>
  );
};