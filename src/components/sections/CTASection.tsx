import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/15" />

      <div className="relative container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-primary">Ready to enter</span>
            <br />
            <span className="text-foreground">the Australian market?</span>
          </h2>
          <p className="text-xl mb-10 text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Tell us about your company and get a tailored market entry report in
            minutes — built from live market intelligence, vetted providers, and
            mentors who have done it before.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link to="/report-creator">
              <Button size="lg" className="px-8 py-6 text-lg rounded-xl group">
                Generate my free report
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Free · No credit card · Ready in about 3 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
