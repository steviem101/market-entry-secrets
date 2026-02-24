import { useState, useRef, useEffect } from "react";
import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroTrustBadge } from "@/components/hero/HeroTrustBadge";
import { HeroPersonaToggle } from "@/components/hero/HeroPersonaToggle";
import { HeroHeadline } from "@/components/hero/HeroHeadline";
import { HeroSubheadline } from "@/components/hero/HeroSubheadline";
import { HeroCTAGroup } from "@/components/hero/HeroCTAGroup";
import { HeroSocialProof } from "@/components/hero/HeroSocialProof";
import { HeroStatsRow } from "@/components/hero/HeroStatsRow";
import { HeroProductMockup } from "@/components/hero/HeroProductMockup";
import type { HeroPersona } from "@/components/hero/heroContent";

export const HeroSection = () => {
  const [activePersona, setActivePersona] = useState<HeroPersona>("international");
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

      <div className="relative container mx-auto px-4 py-16 lg:py-0 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column: Copy */}
          <div className="space-y-6">
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0ms" }}
            >
              <HeroTrustBadge />
            </div>

            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <HeroPersonaToggle
                activePersona={activePersona}
                onChange={setActivePersona}
              />
            </div>

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

            <div
              className="animate-fade-in-up pt-2"
              style={{ animationDelay: "600ms" }}
            >
              <HeroStatsRow isVisible={isVisible} />
            </div>
          </div>

          {/* Right column: Interactive mockup */}
          <div
            className="animate-fade-in-up lg:pl-4"
            style={{ animationDelay: "300ms" }}
          >
            <HeroProductMockup persona={activePersona} />
          </div>
        </div>
      </div>
    </section>
  );
};
