import { ClipboardList, Cpu, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Step {
  icon: typeof ClipboardList;
  iconColor: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: ClipboardList,
    iconColor: "from-primary/15 to-primary/5 text-primary",
    title: "Tell us about your company",
    description:
      "Answer a few questions about your industry, target region, and goals. Takes under 5 minutes — no credit card required.",
  },
  {
    icon: Cpu,
    iconColor: "from-primary/15 to-accent/5 text-primary",
    title: "AI builds your market entry plan",
    description:
      "Our engine scrapes live data, analyses competitors, maps the market, and matches you with vetted providers — in minutes, not months.",
  },
  {
    icon: Users,
    iconColor: "from-accent/15 to-accent/5 text-accent",
    title: "Get matched with the right people",
    description:
      "Receive a custom report with SWOT analysis, provider and mentor matches, and a step-by-step action plan.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From first question to a ready-to-act plan in under 10 minutes
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-primary/30 to-accent/30" />

            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative text-center">
                  {/* Step number + icon */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.iconColor} border border-border/50 shadow-sm`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-md">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Single CTA */}
          <div className="text-center mt-14">
            <Link to="/report-creator">
              <Button size="lg" className="px-8 py-6 text-base rounded-xl group">
                Generate my free report
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
