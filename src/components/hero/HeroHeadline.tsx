import { useState, useEffect } from "react";
import { HERO_PERSONAS } from "./heroContent";
import type { HeroPersona } from "./heroContent";

interface HeroHeadlineProps {
  persona: HeroPersona;
}

export const HeroHeadline = ({ persona }: HeroHeadlineProps) => {
  const [displayPersona, setDisplayPersona] = useState(persona);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (persona !== displayPersona) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayPersona(persona);
        setIsTransitioning(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [persona, displayPersona]);

  const content = HERO_PERSONAS[displayPersona].headline;

  return (
    <h1
      className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight transition-all duration-200 ${
        isTransitioning
          ? "opacity-0 -translate-y-2"
          : "opacity-100 translate-y-0"
      }`}
    >
      <span className="text-white">{content.line1}</span>
      <br />
      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {content.line2}
      </span>
    </h1>
  );
};
