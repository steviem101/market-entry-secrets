
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MasterSearch } from "@/components/MasterSearch";
import { AIChatSearch } from "@/components/AIChatSearch";
import { RotatingText } from "@/components/RotatingText";
import { ArrowDown, Sparkles, Star, TrendingUp, Building2 } from "lucide-react";

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

  const rotatingWords = ["Secrets", "Events", "Mentors", "Vendors", "Leads", "Content", "Ecosystems"];

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

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Enhanced Background with soft gradients */}
      <div className="absolute inset-0 gradient-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/5 rounded-full blur-xl animate-pulse delay-1000" />
      
      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto text-center">
          {/* Enhanced Social Proof Banner */}
          <div className="inline-flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-6 py-4 mb-8 soft-shadow backdrop-blur-sm hover:from-primary/15 hover:to-accent/15 transition-all duration-300">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                4.9/5 from 247+ companies
              </span>
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-6 bg-border/30" />

            {/* Success Metric */}
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                89% faster market entry
              </span>
            </div>

            {/* Separator */}
            <div className="hidden md:block w-px h-6 bg-border/30" />

            {/* Trust Indicator */}
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Trusted by Fortune 500 companies
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight">
            Uncover the{" "}
            <RotatingText 
              words={rotatingWords}
              className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              duration={2000}
            />{" "}
            for
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block mt-2">
              Australian Market Entry
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-4xl mx-auto">
            Skip months of research and costly mistakes. Get instant access to vetted service providers, expert mentors, and proven strategies that successful companies use to enter and thrive in Australia.
          </p>

          {/* Enhanced Total Counter */}
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl px-8 py-6 mb-12 soft-shadow backdrop-blur-sm hover:from-primary/15 hover:to-accent/15 transition-all duration-300">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {count.toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground font-medium mt-1">Market Entry Resources Available Now</div>
            </div>
          </div>
          
          {/* Enhanced Search Interface */}
          <div className="max-w-5xl mx-auto mb-12">
            <Tabs value={searchMode} onValueChange={onSearchModeChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-background/60 backdrop-blur-md border border-border/50 soft-shadow max-w-md mx-auto">
                <TabsTrigger value="database" className="text-sm font-medium rounded-xl">🔍 Search Database</TabsTrigger>
                <TabsTrigger value="ai" className="text-sm font-medium rounded-xl">🤖 Ask AI Assistant</TabsTrigger>
              </TabsList>
              
              <TabsContent value="database" className="space-y-3 mt-0">
                {searchMode === 'database' && (
                  <>
                    <MasterSearch placeholder="Search for service providers, mentors, leads, events..." />
                    <p className="text-sm text-muted-foreground/80">
                      Find exactly what you need from our curated database of Australian market entry resources
                    </p>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="ai" className="space-y-3 mt-0">
                {searchMode === 'ai' && (
                  <>
                    <div className="max-w-4xl mx-auto">
                      <AIChatSearch placeholder="Ask me: 'How do I find legal partners for Australian market entry?'" />
                    </div>
                    <p className="text-sm text-muted-foreground/80">
                      Get personalized advice from our AI trained on successful market entry strategies
                    </p>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-background/60 backdrop-blur-sm border-primary/30 text-foreground hover:bg-background/80 hover:border-primary/50 px-8 py-4 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              View Success Stories
            </Button>
          </div>

          {/* Scroll Indicator */}
          <button 
            onClick={scrollToNextSection}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group animate-bounce"
          >
            <span className="text-sm">See how we compare</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
