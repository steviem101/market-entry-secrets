import { BeforeSection } from "./before-after/BeforeSection";
import { AfterSection } from "./before-after/AfterSection";
import { useSectionPersona } from "@/hooks/useSectionPersona";
import { PERSONA_CONTENT } from "@/config/personaContent";

export const BeforeAfterSection = () => {
  const persona = useSectionPersona();
  const content = PERSONA_CONTENT[persona].beforeAfter;

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 transition-all duration-300">
              {content.sectionTitle}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed transition-all duration-300">
              {content.sectionSubtitle}
            </p>
          </div>

          {/* Before vs After Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <BeforeSection
              heading={content.beforeHeading}
              subheading={content.beforeSubheading}
              items={content.beforeItems}
            />
            <AfterSection
              heading={content.afterHeading}
              subheading={content.afterSubheading}
              items={content.afterItems}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
