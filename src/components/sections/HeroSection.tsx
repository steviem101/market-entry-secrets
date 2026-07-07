import { HeroBackground } from "@/components/hero/HeroBackground";
import { HeroHeadline } from "@/components/hero/HeroHeadline";
import { HeroSubheadline } from "@/components/hero/HeroSubheadline";
import { HeroCTAGroup } from "@/components/hero/HeroCTAGroup";
import { HeroProductMockup } from "@/components/hero/HeroProductMockup";

export const HeroSection = () => {
  return (
    <section id="hero" className="relative overflow-hidden">
      <HeroBackground />

      <div className="relative container mx-auto px-4 pt-16 pb-12 lg:pt-24 lg:pb-16 z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left column: Copy */}
          <div className="space-y-6">
            <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
              <HeroHeadline persona="default" />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <HeroSubheadline persona="default" />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <HeroCTAGroup persona="default" />
            </div>
          </div>

          {/* Right column: Report mockup */}
          <div className="animate-fade-in-up lg:pl-4" style={{ animationDelay: "100ms" }}>
            <HeroProductMockup persona="default" />
          </div>
        </div>
      </div>
    </section>
  );
};
