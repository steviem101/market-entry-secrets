
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasterSearch } from "@/components/MasterSearch";
import { AIChatSearch } from "@/components/AIChatSearch";

interface HeroSectionProps {
  totalResources: number;
  searchMode: 'database' | 'ai';
  onSearchModeChange: (mode: 'database' | 'ai') => void;
}

export const HeroSection = ({
  totalResources,
  searchMode,
  onSearchModeChange
}: HeroSectionProps) => {
  const [count, setCount] = useState(0);
  const animationRef = useRef<ReturnType<typeof setTimeout>>();

  // Count Up Animation Effect - starts immediately on mount
  useEffect(() => {
    if (totalResources === 0) {
      console.log('No resources to count');
      return;
    }
    console.log('Starting count animation to:', totalResources);
    let currentCount = 0;
    const duration = 2500;
    const steps = 60;
    const increment = totalResources / steps;
    const stepDuration = duration / steps;
    const animate = () => {
      currentCount += increment;
      if (currentCount >= totalResources) {
        console.log('Animation completed at:', totalResources);
        setCount(totalResources);
        return;
      }
      setCount(Math.floor(currentCount));
      animationRef.current = setTimeout(animate, stepDuration);
    };
    animationRef.current = setTimeout(animate, stepDuration);
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [totalResources]);

  return (
    <section className="relative overflow-hidden">
      {/* Background with soft gradients */}
      <div className="absolute inset-0 gradient-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
      
      <div className="relative container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Uncover the Secrets for
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block mt-2">
              Australian Market Entry
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 leading-relaxed max-w-4xl mx-auto">
            Discover insider knowledge, vetted providers, and proven strategies for Australian market success.
          </p>

          {/* More compact counter */}
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-primary/8 to-accent/8 border border-primary/15 rounded-xl px-6 py-2 mb-8 soft-shadow backdrop-blur-sm">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {count.toLocaleString()}+
              </div>
              <div className="text-xs text-muted-foreground font-medium">Market Entry Secrets</div>
            </div>
          </div>
          
          {/* Unified Search Interface */}
          <div className="max-w-5xl mx-auto">
            <Tabs value={searchMode} onValueChange={onSearchModeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/60 backdrop-blur-md border border-border/50 soft-shadow max-w-md mx-auto">
                <TabsTrigger value="database" className="text-sm font-medium rounded-xl">🔍 Search Secrets</TabsTrigger>
                <TabsTrigger value="ai" className="text-sm font-medium rounded-xl">🤖 Use AI to Uncover Secrets</TabsTrigger>
              </TabsList>
              
              <TabsContent value="database" className="space-y-2 mt-0">
                {searchMode === 'database' && (
                  <>
                    <MasterSearch placeholder="Search for insider secrets, hidden strategies, proven providers..." />
                    <p className="text-xs text-muted-foreground/80">
                      Discover secret strategies and vetted resources for Australian market success
                    </p>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-2 mt-0">
                {searchMode === 'ai' && (
                  <>
                    <div className="max-w-4xl mx-auto">
                      <AIChatSearch placeholder="Ask our AI about market entry strategies..." />
                    </div>
                    <p className="text-xs text-muted-foreground/80">
                      Get insider knowledge from our AI trained on successful market entry strategies
                    </p>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};
