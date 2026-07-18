import { ClipboardList, FileText, Handshake } from "lucide-react";
import { ReportCTAButton } from "@/components/cta/ReportCTAButton";
import { ManifestoStrip } from "@/components/sections/ManifestoStrip";

interface Step {
  icon: typeof ClipboardList;
  iconColor: string;
  title: string;
  description: string;
}

// MES-194 (T3 increment 2): the 3-step narrative ends on the paid product —
// the advisor — per the epic charter §5b ("Tell us your goal → get your free
// report → work it with your advisor").
const STEPS: Step[] = [
  {
    icon: ClipboardList,
    iconColor: "from-primary/15 to-primary/5 text-primary",
    title: "Tell us your goal",
    description:
      "Answer a few quick questions about your company, market and goals. No credit card, no sales call.",
  },
  {
    icon: FileText,
    iconColor: "from-primary/15 to-accent/5 text-primary",
    title: "Get your free report",
    description:
      "Live market intelligence, competitor landscape, SWOT and an action plan — matched to real providers, mentors and investors from our directories, in minutes.",
  },
  {
    icon: Handshake,
    iconColor: "from-accent/15 to-accent/5 text-accent",
    title: "Work it with your advisor",
    description:
      "Upgrade when you're ready: a walkthrough call or strategy session with an MES advisor, warm mentor introductions, and your lead list delivered to your hub.",
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
              Tell us your goal, get your free report, then work it with your advisor
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

          {/* X-not-Y manifesto strip */}
          <ManifestoStrip className="mt-16 border-t border-border/50 pt-10" />

          {/* Single CTA */}
          <ReportCTAButton className="mt-12" />
        </div>
      </div>
    </section>
  );
};
