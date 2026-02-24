import { useState, useRef, useEffect, useCallback } from "react";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroPersonaToggle } from "@/components/hero/HeroPersonaToggle";
import { HeroJourneyFlow } from "@/components/hero/HeroJourneyFlow";
import { HeroHeadline } from "@/components/hero/HeroHeadline";
import { HeroSubheadline } from "@/components/hero/HeroSubheadline";
import { HeroCTAGroup } from "@/components/hero/HeroCTAGroup";
import { HeroSocialProof } from "@/components/hero/HeroSocialProof";
import { HeroStatsRow } from "@/components/hero/HeroStatsRow";
import { HeroProductMockup } from "@/components/hero/HeroProductMockup";
import { usePersona } from "@/contexts/PersonaContext";
import type { HeroPersona } from "@/components/hero/heroContent";
import type { Persona } from "@/contexts/PersonaContext";

const contextToHero = (p: Persona): HeroPersona =>
  p === "local_startup" ? "startup" : "international";

const heroToContext = (h: HeroPersona): Persona =>
  h === "startup" ? "local_startup" : "international_entrant";

export const HeroSection = () => {
  const { persona, setPersona } = usePersona();
  const [activePersona, setActivePersona] = useState<HeroPersona>(
    contextToHero(persona)
  );

  const handlePersonaChange = useCallback(
    (next: HeroPersona) => {
      setActivePersona(next);
      setPersona(heroToContext(next));
    },
    [setPersona]
  );
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-screen flex items-center"
    >
      <HeroBackground />

      <div className="relative container mx-auto px-4 pt-24 pb-16 lg:pt-28 lg:pb-8 z-10">
        <div className="flex flex-col space-y-8">
          {/* Tier 1: Prominent journey selector */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0ms" }}
          >
            <HeroPersonaToggle
              activePersona={activePersona}
              onChange={handlePersonaChange}
            />
          </div>

          {/* Visual flow connector (desktop only) */}
          <div
            className="animate-fade-in-up hidden lg:block"
            style={{ animationDelay: "100ms" }}
          >
            <HeroJourneyFlow activePersona={activePersona} />
          </div>

          {/* Tier 2: Two-column content grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left column: Copy */}
            <div className="space-y-6">
              <div
                className="animate-fade-in-up"
                style={{ animationDelay: "200ms" }}
              >
                <HeroHeadline persona={activePersona} />
              </div>

              <div
                className="animate-fade-in-up"
                style={{ animationDelay: "300ms" }}
              >
                <HeroSubheadline persona={activePersona} />
              </div>

              <div
                className="animate-fade-in-up"
                style={{ animationDelay: "400ms" }}
              >
                <HeroCTAGroup persona={activePersona} />
              </div>

              <div
                className="animate-fade-in-up"
                style={{ animationDelay: "500ms" }}
              >
                <HeroSocialProof />
              </div>
            </div>

            {/* Right column: Interactive mockup */}
            <div
              className="animate-fade-in-up lg:pl-4"
              style={{ animationDelay: "200ms" }}
            >
              <HeroProductMockup persona={activePersona} />
            </div>
          </div>

          {/* Tier 3: Full-width centered stats */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "600ms" }}
          >
            <div className="border-t border-border/50 pt-6">
              <HeroStatsRow isVisible={isVisible} activePersona={activePersona} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
