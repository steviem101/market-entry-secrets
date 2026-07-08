import { Handshake, Database, Phone, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReportCTAButton } from "@/components/cta/ReportCTAButton";
import {
  SECTION_CONFIG,
  SECTION_LABELS,
  TIER_LABELS,
  TIER_REQUIREMENTS,
} from "@/components/report/reportSectionConfig";

// ---------------------------------------------------------------------------
// Two value categories (MES-116 successor: surface the activation layer).
//   A "In your report"   — the intelligence you read (report sections)
//   B "What it unlocks"   — what the platform activates off the back of it
// Cards are illustrative only (never clickable): the section's single funnel
// is the report CTA. Report-tile badges derive from the real TIER_REQUIREMENTS
// so they can never over/under-claim; activation badges mirror where the
// underlying match/asset actually sits.
// ---------------------------------------------------------------------------

// A — three sharpest report sections (Executive Summary + Action Plan dropped;
// they're the lowest-differentiation artefacts and are still generated — see
// the subcopy). Labels/icons/tiers come from reportSectionConfig.
const REPORT_KEYS = ["swot_analysis", "competitor_landscape", "service_providers"];

const reportTier = (key: string) => {
  const tier = TIER_REQUIREMENTS[key] ?? "free";
  return {
    label: TIER_LABELS[tier] ?? tier,
    className:
      tier === "free"
        ? "bg-accent/10 text-accent border-accent/20"
        : "bg-primary/10 text-primary border-primary/20",
  };
};

// B — the activation outcomes. Semantic tokens only (no hardcoded colors).
interface ActivationCard {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: { label: string; className: string };
  accent: string; // top border, design token
  iconWrap: string;
}

const ACTIVATION_CARDS: ActivationCard[] = [
  {
    icon: Handshake,
    title: "Warm introductions",
    description:
      "Request warm intros to the providers, mentors and investors in the MES network, matched to your report.",
    // The intro request itself is free (public submission funnel); deeper
    // report matches unlock with Growth. "Free" is the honest entry badge.
    badge: { label: TIER_LABELS.free, className: "bg-accent/10 text-accent border-accent/20" },
    accent: "border-t-primary",
    iconWrap: "bg-primary/10 text-primary",
  },
  {
    icon: Database,
    title: "Lead lists & TAM maps",
    description:
      "Pre-qualified contact databases and TAM maps to size your market and reach your customer base.",
    badge: { label: TIER_LABELS.scale, className: "bg-primary/10 text-primary border-primary/20" },
    accent: "border-t-accent",
    iconWrap: "bg-accent/10 text-accent",
  },
  {
    icon: Phone,
    title: "Strategy call with an adviser",
    description:
      "Work through your report one-to-one with an MES market-entry adviser who knows the corridor.",
    // Advisory service, not a report tier — a neutral chip, not a fake tier badge.
    badge: { label: "1:1", className: "bg-muted text-muted-foreground border-border" },
    accent: "border-t-primary",
    iconWrap: "bg-primary/10 text-primary",
  },
];

const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
    {children}
  </p>
);

export const WhatsInYourReport = () => {
  const reportCards = REPORT_KEYS.filter(
    (key) => SECTION_CONFIG[key] && SECTION_LABELS[key]
  );

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Your report, and what it unlocks
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every report is generated for your company from live market data.
              It's also the front door to the platform: the intros, lead data,
              and adviser support that turn a plan into traction.
            </p>
          </div>

          {/* A — In your report */}
          <GroupLabel>In your report</GroupLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {reportCards.map((key) => {
              const config = SECTION_CONFIG[key];
              const Icon = config.icon;
              const tier = reportTier(key);
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
                      {key === "swot_analysis"
                        ? "Strengths, weaknesses, opportunities and threats for your specific move into ANZ."
                        : key === "competitor_landscape"
                          ? "Who you're up against locally, how they position, and where the gaps are."
                          : "Vetted legal, accounting and growth partners matched to your industry and target region."}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* B — What it unlocks */}
          <GroupLabel>What it unlocks</GroupLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ACTIVATION_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.title} className={`border-t-4 ${card.accent}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-lg ${card.iconWrap}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="secondary" className={`text-xs font-medium ${card.badge.className}`}>
                        {card.badge.label}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Single funnel: the only CTA in the section stays the report CTA */}
          <ReportCTAButton withMicrocopy className="mt-12" />
        </div>
      </div>
    </section>
  );
};
