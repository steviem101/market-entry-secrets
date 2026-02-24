import { useState, useEffect } from "react";
import { HERO_PERSONAS } from "./heroContent";
import type { HeroPersona } from "./heroContent";

interface HeroSubheadlineProps {
  persona: HeroPersona;
}

export const HeroSubheadline = ({ persona }: HeroSubheadlineProps) => {
  const [displayPersona, setDisplayPersona] = useState(persona);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (persona !== displayPersona) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayPersona(persona);
        setIsTransitioning(false);
      }, 250); // Slightly delayed vs headline for stagger
      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(false);
    }
  }, [persona, displayPersona]);

  const content = HERO_PERSONAS[displayPersona].subheadline;

  return (
    <p
      className={`text-lg text-muted-foreground max-w-xl leading-relaxed text-center lg:text-left mx-auto lg:mx-0 transition-all duration-200 ${
        isTransitioning
          ? "opacity-0 -translate-y-2"
          : "opacity-100 translate-y-0"
      }`}
    >
      {content}
    </p>
  );
};
