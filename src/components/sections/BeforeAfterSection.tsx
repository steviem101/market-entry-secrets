
import { BeforeSection } from "./before-after/BeforeSection";
import { AfterSection } from "./before-after/AfterSection";

export const BeforeAfterSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Before vs. After Market Entry
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              See the dramatic difference between struggling alone and having the right resources at your fingertips
            </p>
          </div>

          {/* Before vs After Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <BeforeSection />
            <AfterSection />
          </div>
        </div>
      </div>
    </section>
  );
};
