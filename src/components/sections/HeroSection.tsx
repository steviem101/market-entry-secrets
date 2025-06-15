
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasterSearch } from "@/components/MasterSearch";
import { AIChatSearch } from "@/components/AIChatSearch";
import { useCountUp } from "@/hooks/useCountUp";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

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
  const { elementRef, isVisible } = useIntersectionObserver({ 
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  });
  
  const animatedCount = useCountUp({ 
    end: totalResources, 
    duration: 2500, 
    isVisible 
  });

  // Debug logging
  useEffect(() => {
    console.log('HeroSection render:', { totalResources, isVisible, animatedCount });
  }, [totalResources, isVisible, animatedCount]);

  return (
    <section className="relative overflow-hidden">
      {/* Background with soft gradients */}
      <div className="absolute inset-0 gradient-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
      
      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
            Your Gateway to the
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block mt-2">
              Australian Market
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6 leading-relaxed max-w-3xl mx-auto">
            Connect with vetted service providers, learn from success stories, and accelerate your market entry with expert guidance.
          </p>

          {/* Total Counter with animated counting */}
          <div 
            ref={elementRef}
            className="inline-flex items-center justify-center bg-gradient-to-r from-primary/8 to-accent/8 border border-primary/15 rounded-2xl px-8 py-4 mb-12 soft-shadow backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {animatedCount.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground font-medium mt-1">Total Secrets Available</div>
            </div>
          </div>
          
          {/* Unified Search Interface */}
          <div className="max-w-3xl mx-auto">
            <Tabs value={searchMode} onValueChange={onSearchModeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-background/60 backdrop-blur-md border border-border/50 soft-shadow">
                <TabsTrigger value="database" className="text-sm font-medium rounded-xl">🔍 Search Secrets</TabsTrigger>
                <TabsTrigger value="ai" className="text-sm font-medium rounded-xl">
                  🤖 Ask AI Assistant
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="database" className="space-y-3">
                <MasterSearch placeholder="Search for legal, accounting, marketing services..." />
                <p className="text-sm text-muted-foreground/80">
                  Search through our curated database of service providers and resources
                </p>
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-3">
                <AIChatSearch placeholder="Ask me anything about entering the Australian market..." />
                <p className="text-sm text-muted-foreground/80">
                  Get personalized guidance from our AI assistant trained on market entry expertise
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};
