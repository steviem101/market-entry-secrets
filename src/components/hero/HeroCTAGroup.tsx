import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_PERSONAS } from "./heroContent";
import type { HeroPersona } from "./heroContent";

interface HeroCTAGroupProps {
  persona: HeroPersona;
}

export const HeroCTAGroup = ({ persona }: HeroCTAGroupProps) => {
  const [displayPersona, setDisplayPersona] = useState(persona);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (persona !== displayPersona) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayPersona(persona);
        setIsTransitioning(false);
      }, 300); // Slightly more delay for stagger after subheadline
      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(false);
    }
  }, [persona, displayPersona]);

  const content = HERO_PERSONAS[displayPersona];

  return (
    <div
      className={`flex flex-col sm:flex-row items-center sm:items-start lg:items-start justify-center lg:justify-start gap-3 transition-all duration-200 ${
        isTransitioning
          ? "opacity-0 -translate-y-2"
          : "opacity-100 translate-y-0"
      }`}
    >
      <Link to={content.primaryCTA.href}>
        <Button
          size="lg"
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-6 text-base rounded-xl soft-shadow hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
          <span className="relative flex items-center gap-2">
            {content.primaryCTA.label}
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </Button>
      </Link>

      <Link to={content.secondaryCTA.href}>
        <Button
          size="lg"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm border-primary/20 text-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground px-8 py-6 text-base rounded-xl transition-all duration-300"
        >
          {content.secondaryCTA.label}
        </Button>
      </Link>
    </div>
  );
};
