import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/20" />

      <div className="relative container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ready to Enter
            </span>
            <br />
            <span className="text-foreground">the Australian Market?</span>
          </h2>
          <p className="text-xl mb-10 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Generate a tailored market entry or growth plan in minutes, backed by 500+ vetted providers and real market intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/planner')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              Start My Plan
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/contact')}
              className="bg-background/60 backdrop-blur-sm border-primary/30 text-foreground hover:bg-background/80 hover:border-primary/50 px-8 py-4 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
