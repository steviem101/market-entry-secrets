import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroHeadline } from "@/components/hero/HeroHeadline";
import { HeroSubheadline } from "@/components/hero/HeroSubheadline";
import { HeroCTAGroup } from "@/components/hero/HeroCTAGroup";
import { HeroIntentCapture } from "@/components/hero/HeroIntentCapture";
import { HeroProductMockup } from "@/components/hero/HeroProductMockup";
import { isFeatureEnabled } from "@/lib/featureFlags";

export const HeroSection = () => {
  // MES-158: intent-first hero (flag `intent_hero`, default off). When on, the
  // free-text/chip capture replaces the classic two-button CTA group.
  const intentHero = isFeatureEnabled("intent_hero");
  return (
    <section id="hero" className="relative overflow-hidden">
      <HeroBackground />

      <div className="relative container mx-auto px-4 pt-16 pb-12 lg:pt-24 lg:pb-16 z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left column: Copy */}
          <div className="space-y-6">
            <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
              <HeroHeadline />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <HeroSubheadline />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              {intentHero ? <HeroIntentCapture /> : <HeroCTAGroup />}
            </div>
          </div>

          {/* Right column: Report mockup */}
          <div className="animate-fade-in-up lg:pl-4" style={{ animationDelay: "100ms" }}>
            <HeroProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
};
