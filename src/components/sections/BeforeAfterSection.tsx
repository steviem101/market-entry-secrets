
import { BeforeSection } from "./before-after/BeforeSection";
import { AfterSection } from "./before-after/AfterSection";
import { TransformationConnector } from "./before-after/TransformationConnector";
import { BeforeAfterCTA } from "./before-after/BeforeAfterCTA";

export const BeforeAfterSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-accent/5" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Stop Struggling with{" "}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Traditional Market Entry
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            See the dramatic transformation from months of uncertainty to weeks of structured success
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Before Section */}
            <BeforeSection />

            {/* After Section */}
            <AfterSection />
          </div>

          {/* Transformation Connector - Only visible on larger screens */}
          <div className="hidden lg:block">
            <TransformationConnector />
          </div>

          {/* CTA Section */}
          <BeforeAfterCTA />
        </div>
      </div>
    </section>
  );
};
