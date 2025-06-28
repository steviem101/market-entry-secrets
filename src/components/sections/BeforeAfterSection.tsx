
import { BeforeSection } from "./before-after/BeforeSection";
import { AfterSection } from "./before-after/AfterSection";
import { BeforeAfterCTA } from "./before-after/BeforeAfterCTA";

export const BeforeAfterSection = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="absolute inset-0 gradient-overlay" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Stop Wasting Time on{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Manual Market Entry
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how Market Entry Secrets transforms the complex, risky process of entering the Australian market into a streamlined, data-driven success story.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Before Section */}
          <BeforeSection />

          {/* After Section */}
          <AfterSection />
        </div>

        {/* CTA Section */}
        <BeforeAfterCTA />
      </div>
    </section>
  );
};
