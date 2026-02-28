import { useState, useEffect } from "react";
import { Search, Sparkles, Users, Building2, Calendar, MapPin } from "lucide-react";
import { MasterSearch } from "@/components/MasterSearch";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useSectionPersona } from "@/hooks/useSectionPersona";
import { PERSONA_CONTENT } from "@/config/personaContent";
import type { SearchCategory } from "@/hooks/useSearchState";

interface SearchSectionProps {
  totalResources?: number;
}

export const SearchSection = ({ totalResources = 2075 }: SearchSectionProps) => {
  const [activeTab, setActiveTab] = useState<SearchCategory>("all");
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.2 });
  const [animationComplete, setAnimationComplete] = useState(false);
  const persona = useSectionPersona();
  const content = PERSONA_CONTENT[persona].search;

  useEffect(() => {
    if (isVisible && !animationComplete) {
      const timer = setTimeout(() => setAnimationComplete(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isVisible, animationComplete]);

  const searchTabs: { id: SearchCategory; label: string; icon: typeof Search; count: number }[] = [
    { id: "all", label: "All Resources", icon: Search, count: totalResources },
    { id: "companies", label: "Companies", icon: Building2, count: 850 },
    { id: "people", label: "People", icon: Users, count: 620 },
    { id: "events", label: "Events", icon: Calendar, count: 340 },
    { id: "locations", label: "Locations", icon: MapPin, count: 265 }
  ];

  return (
    <section
      ref={elementRef}
      className="relative py-24 bg-gradient-to-br from-background via-primary/3 to-accent/5"
      style={{ overflow: 'visible' }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-20 left-[10%] w-32 h-32 bg-primary/8 rounded-full blur-2xl transition-all duration-1000 ${isVisible ? 'animate-pulse opacity-100' : 'opacity-0'}`} />
        <div className={`absolute bottom-32 right-[15%] w-24 h-24 bg-accent/10 rounded-full blur-xl transition-all duration-1000 delay-300 ${isVisible ? 'animate-pulse opacity-100' : 'opacity-0'}`} />
        <div className={`absolute top-1/2 left-[80%] w-20 h-20 bg-primary/6 rounded-full blur-lg transition-all duration-1000 delay-500 ${isVisible ? 'animate-pulse opacity-100' : 'opacity-0'}`} />

        <div className={`absolute top-16 right-[20%] w-2 h-2 bg-primary rounded-full transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 animate-ping' : 'opacity-0'}`} />
        <div className={`absolute bottom-20 left-[25%] w-1 h-1 bg-accent rounded-full transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 animate-ping' : 'opacity-0'}`} />

        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-accent/[0.03]" />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className={`text-center mb-16 transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {content.badge}
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-foreground">{content.headingLine1}</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                {content.headingLine2}
              </span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {content.subtitle}
            </p>
          </div>

          {/* Enhanced Search Tabs */}
          <div className={`mb-12 transition-all duration-800 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {searchTabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative px-6 py-4 rounded-2xl border transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-primary/90 text-white border-primary shadow-lg shadow-primary/25'
                        : 'bg-background/80 backdrop-blur-sm border-border/30 text-foreground hover:bg-background/90 hover:border-primary/30'
                    } ${animationComplete ? `animate-fade-in` : ''}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-primary group-hover:text-primary'}`} />
                      <div className="text-left">
                        <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-foreground'}`}>
                          {tab.label}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {tab.count.toLocaleString()} resources
                        </div>
                      </div>
                    </div>

                    {!isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enhanced Search Interface */}
          <div className={`transition-all duration-800 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative max-w-4xl mx-auto">
              <div className="relative bg-card/60 backdrop-blur-xl border border-border/30 rounded-3xl p-8 shadow-2xl shadow-primary/10">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-accent/20 p-[2px]">
                  <div className="w-full h-full bg-card/60 backdrop-blur-xl rounded-3xl" />
                </div>

                <div className="relative z-10">
                  <MasterSearch activeCategory={activeTab} />
                </div>

                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
                  <Search className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
    </section>
  );
};
