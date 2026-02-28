import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSectionPersona } from "@/hooks/useSectionPersona";
import { PERSONA_CONTENT } from "@/config/personaContent";

export const CTASection = () => {
  const navigate = useNavigate();
  const persona = useSectionPersona();
  const content = PERSONA_CONTENT[persona].cta;

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/20" />

      <div className="relative container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 transition-all duration-300">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {content.headingAccent}
            </span>
            <br />
            <span className="text-foreground">{content.headingPlain}</span>
          </h2>
          <p className="text-xl mb-10 text-muted-foreground leading-relaxed max-w-2xl mx-auto transition-all duration-300">
            {content.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate(content.primaryCTA.href)}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              {content.primaryCTA.label}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate(content.secondaryCTA.href)}
              className="bg-background/60 backdrop-blur-sm border-primary/30 text-foreground hover:bg-background/80 hover:border-primary/50 px-8 py-4 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              {content.secondaryCTA.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
