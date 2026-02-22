import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden min-h-[80vh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/60 via-sky-25/40 to-background" />
      <div className="absolute inset-0 gradient-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/5 rounded-full blur-xl animate-pulse delay-1000" />

      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Build your Australian market entry plan in minutes.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
            Answer a few questions about your company, sector, and goals. MES combines 500+ vetted
            providers, real case studies, and AI-powered intelligence to generate a tailored action
            plan for entering or scaling in the ANZ market.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/planner">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-10 py-6 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300 group"
              >
                Start my plan
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Secondary link */}
          <Link
            to="/service-providers"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            Or explore the ecosystem first
          </Link>
        </div>
      </div>
    </section>
  );
};
