import { Link } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_CONTENT } from "./heroContent";
import { trackFunnelEvent } from "@/lib/analytics/intakeFunnel";
import { SampleReportLink } from "@/components/hero/SampleReportLink";
import {
  REPORT_CREATOR_STARTUP_PATH,
  REPORT_CTA_MICROCOPY,
} from "@/config/reportCta";

const HERO_CTA_SOURCE = "homepage_hero";

// Click-through attribution for the classic (non-intent) hero CTAs (MES-162).
// The intent hero tracks its own MES-158 events; report-start attribution
// stays with the report creator's existing funnel events — this only counts
// the hero click itself.
const trackHeroCta = (cta: "primary" | "secondary" | "startup_deeplink") =>
  trackFunnelEvent("hero_cta_clicked", { source: HERO_CTA_SOURCE, metadata: { cta } });

export const HeroCTAGroup = () => {
  const { primaryCTA, secondaryCTA } = HERO_CONTENT;

  return (
    <div className="flex flex-col items-center lg:items-start gap-3">
      {/* Button row — just the two buttons */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
        <Link to={primaryCTA.href} onClick={() => trackHeroCta("primary")}>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-6 text-base rounded-xl soft-shadow hover:shadow-lg transition-all duration-300 group"
          >
            <span className="flex items-center gap-2">
              {primaryCTA.label}
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Button>
        </Link>

        <Link to={secondaryCTA.href} onClick={() => trackHeroCta("secondary")}>
          <Button
            size="lg"
            variant="outline"
            className="bg-background/80 border-primary/20 text-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-foreground px-8 py-6 text-base rounded-xl transition-all duration-300"
          >
            {secondaryCTA.label}
          </Button>
        </Link>
      </div>

      {/* Trust micro-label — directly beneath buttons */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>{REPORT_CTA_MICROCOPY}</span>
        </div>
        <SampleReportLink />
      </div>

      {/* Persona deep-link for the local-founder journey */}
      <Link
        to={REPORT_CREATOR_STARTUP_PATH}
        onClick={() => trackHeroCta("startup_deeplink")}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
      >
        Growing an Australian startup? Start here
      </Link>
    </div>
  );
};
