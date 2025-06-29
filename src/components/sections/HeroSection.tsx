import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MasterSearch } from "@/components/MasterSearch";
import { AIChatSearch } from "@/components/AIChatSearch";
import { RotatingText } from "@/components/RotatingText";
import { Sparkles, Star, TrendingUp } from "lucide-react";

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

  const rotatingWords = [
    "Uncover the leads",
    "Discover opportunities", 
    "Find your partners",
    "Access expert mentors",
    "Navigate regulations",
    "Scale your business"
  ];

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Enhanced Background with soft gradients */}
      <div className="absolute inset-0 gradient-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/5 rounded-full blur-xl animate-pulse delay-1000" />
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Enhanced Social Proof Header with remaining metrics */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-6 py-3 mb-8">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">4.9/5 from 247+ companies</span>
            </div>
            
            <div className="hidden sm:block w-px h-4 bg-border/30" />
            
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">89% faster market entry</span>
            </div>
            
            <div className="hidden sm:block w-px h-4 bg-border/30" />
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">1,200+ successful companies</span>
            </div>
          </div>

          {/* Dynamic Headline with Rotating Text */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            <RotatingText 
              words={rotatingWords}
              className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              duration={3000}
            />
            {" "}to{" "}
            <span className="text-foreground">dominate the Australian market</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-4xl mx-auto">
            Skip months of research and costly mistakes. Access vetted service providers, expert mentors, and proven strategies in one comprehensive platform.
          </p>

          {/* Streamlined Resource Counter */}
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl px-6 py-4 mb-10 soft-shadow backdrop-blur-sm">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {count.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground font-medium">Resources Available</div>
            </div>
          </div>
          
          {/* Streamlined Search Interface */}
          <div className="max-w-4xl mx-auto mb-10">
            <Tabs value={searchMode} onValueChange={onSearchModeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/60 backdrop-blur-md border border-border/50 soft-shadow max-w-md mx-auto">
                <TabsTrigger value="database" className="text-sm font-medium">🔍 Search Database</TabsTrigger>
                <TabsTrigger value="ai" className="text-sm font-medium">🤖 Ask AI Assistant</TabsTrigger>
              </TabsList>
              
              <TabsContent value="database" className="space-y-2 mt-0">
                {searchMode === 'database' && (
                  <MasterSearch placeholder="Search for service providers, mentors, leads, events..." />
                )}
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-2 mt-0">
                {searchMode === 'ai' && (
                  <div className="max-w-3xl mx-auto">
                    <AIChatSearch placeholder="Ask me: 'How do I find legal partners for Australian market entry?'" />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Single, Focused CTA */}
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300"
          >
            Start Your Market Entry Journey
          </Button>
        </div>
      </div>
    </section>
  );
};
