import { ClipboardList, Cpu, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSectionPersona } from "@/hooks/useSectionPersona";
import type { SectionPersona } from "@/config/personaContent";

interface Step {
  icon: typeof ClipboardList;
  iconColor: string;
  title: string;
  description: string;
  link: string;
}

const STEPS: Record<SectionPersona, Step[]> = {
  international: [
    {
      icon: ClipboardList,
      iconColor: "from-violet-500/20 to-violet-400/10 text-violet-500",
      title: "Tell us about your company",
      description:
        "Answer a few questions about your industry, target region, and goals. Takes under 5 minutes — no credit card required.",
      link: "/report-creator?persona=international",
    },
    {
      icon: Cpu,
      iconColor: "from-primary/20 to-accent/10 text-primary",
      title: "AI builds your market entry plan",
      description:
        "Our engine scrapes live data, analyses competitors, maps regulations, and matches you with vetted providers — in minutes, not months.",
      link: "/report-creator?persona=international",
    },
    {
      icon: Users,
      iconColor: "from-emerald-500/20 to-emerald-400/10 text-emerald-500",
      title: "Get matched with the right people",
      description:
        "Receive a custom report with SWOT analysis, provider matches, mentor recommendations, and a step-by-step action plan.",
      link: "/service-providers",
    },
  ],
  startup: [
    {
      icon: ClipboardList,
      iconColor: "from-violet-500/20 to-violet-400/10 text-violet-500",
      title: "Tell us about your startup",
      description:
        "Share your stage, sector, and growth goals. Takes under 5 minutes — no credit card required.",
      link: "/report-creator?persona=startup",
    },
    {
      icon: Cpu,
      iconColor: "from-primary/20 to-accent/10 text-primary",
      title: "AI builds your growth plan",
      description:
        "Our engine analyses your market, identifies funding sources, maps competitors, and curates the right advisors — in minutes.",
      link: "/report-creator?persona=startup",
    },
    {
      icon: Users,
      iconColor: "from-emerald-500/20 to-emerald-400/10 text-emerald-500",
      title: "Connect with mentors and investors",
      description:
        "Receive a tailored growth report with SWOT, investor matches, mentor recommendations, and a go-to-market action plan.",
      link: "/mentors",
    },
  ],
};

export const HowItWorksSection = () => {
  const persona = useSectionPersona();
  const steps = STEPS[persona];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-primary bg-primary/10 border border-primary/15 rounded-full px-4 py-1.5 mb-4">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 transition-all duration-300">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-300">
              {persona === "international"
                ? "From first question to market-ready plan in under 10 minutes"
                : "From first question to growth-ready plan in under 10 minutes"}
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-primary/30 via-accent/30 to-emerald-500/30" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative text-center group">
                  {/* Step number + icon */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.iconColor} border border-border/50 shadow-sm group-hover:scale-110 transition-transform duration-300`}
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
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs mx-auto">
                    {step.description}
                  </p>

                  {/* Link */}
                  <Link
                    to={step.link}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {index === 0
                      ? "Start now"
                      : index === 1
                        ? "See how it works"
                        : "View providers"}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
