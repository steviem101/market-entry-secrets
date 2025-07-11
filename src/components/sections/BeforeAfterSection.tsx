
import { BeforeMESFlowchart } from "./before-after/BeforeMESFlowchart";
import { WithMESSection } from "./before-after/WithMESSection";

interface BeforeAfterSectionProps {
  onGetReport: () => void;
}

export const BeforeAfterSection = ({ onGetReport }: BeforeAfterSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Before vs. After Market Entry Secrets
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              See the dramatic transformation from chaos to clarity with our proven market entry system
            </p>
          </div>

          {/* Before vs After Comparison */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <BeforeMESFlowchart />
            <WithMESSection onGetReport={onGetReport} />
          </div>
        </div>
      </div>
    </section>
  );
};
