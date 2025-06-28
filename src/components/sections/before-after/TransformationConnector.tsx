
import { ArrowDown, Zap } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export const TransformationConnector = () => {
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.5 });

  return (
    <div ref={elementRef} className="flex justify-center my-12 relative">
      {/* Connecting Line */}
      <div className="absolute inset-0 flex justify-center">
        <div className="w-px bg-gradient-to-b from-red-300 via-primary to-accent h-full opacity-30" />
      </div>
      
      {/* Transformation Arrow */}
      <div className={`
        relative z-10 flex flex-col items-center gap-4 p-6 
        bg-gradient-to-br from-background via-primary/5 to-accent/5 
        rounded-2xl border border-primary/20 shadow-lg
        ${isVisible ? 'animate-scale-in' : 'opacity-0'}
      `}>
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
          <Zap className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <ArrowDown className="w-6 h-6 text-primary animate-bounce" />
        <div className="text-center">
          <p className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TRANSFORM YOUR APPROACH
          </p>
          <p className="text-sm text-muted-foreground">From months to weeks</p>
        </div>
      </div>
    </div>
  );
};
