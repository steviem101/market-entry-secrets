import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SECTION_CONFIG,
  SECTION_LABELS,
  TIER_REQUIREMENTS,
} from "@/components/report/reportSectionConfig";

// The report sections showcased on the homepage, in report order. Labels,
// icons and tier gating come from the real report config so the homepage
// can never drift from what the product actually generates.
const SHOWCASED_SECTIONS: { key: string; description: string }[] = [
  {
    key: "executive_summary",
    description:
      "Your market opportunity, sized and summarised — built from live research on your company and sector.",
  },
  {
    key: "swot_analysis",
    description:
      "Strengths, weaknesses, opportunities and threats for your specific entry into ANZ.",
  },
  {
    key: "competitor_landscape",
    description:
      "Who you're up against locally, how they position, and where the gaps are.",
  },
  {
    key: "service_providers",
    description:
      "Vetted legal, accounting and growth partners matched to your industry and target region.",
  },
  {
    key: "mentor_recommendations",
    description:
      "Operators who have entered or scaled in ANZ, matched to your situation.",
  },
  {
    key: "action_plan",
    description:
      "A step-by-step plan with timelines — what to do first, next, and after landing.",
  },
];

const tierLabel = (key: string) => {
  const tier = TIER_REQUIREMENTS[key];
  if (!tier) return { label: "Free", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
  return {
    label: tier.charAt(0).toUpperCase() + tier.slice(1),
    className: "bg-primary/10 text-primary",
  };
};

export const WhatsInYourReport = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What's in your report
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every report is generated for your company from live market data.
              Start free — upgrade any time to unlock the deeper sections.
            </p>
          </div>

          {/* Report section cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHOWCASED_SECTIONS.map(({ key, description }) => {
              const config = SECTION_CONFIG[key];
              const Icon = config.icon;
              const tier = tierLabel(key);
              return (
                <Card key={key} className={`border-t-4 ${config.accentColor}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-lg ${config.accentBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="secondary" className={`text-xs font-medium ${tier.className}`}>
                        {tier.label}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {SECTION_LABELS[key]}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Single CTA */}
          <div className="text-center mt-12">
            <Link to="/report-creator">
              <Button size="lg" className="px-8 py-6 text-base rounded-xl group">
                Generate my free report
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">
              Free · No credit card · Ready in about 3 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
