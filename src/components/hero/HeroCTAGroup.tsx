import { Link } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_CONTENT } from "./heroContent";
import {
  REPORT_CREATOR_STARTUP_PATH,
  REPORT_CTA_MICROCOPY,
} from "@/config/reportCta";

export const HeroCTAGroup = () => {
  const { primaryCTA, secondaryCTA } = HERO_CONTENT;

  return (
    <div className="flex flex-col items-center lg:items-start gap-3">
      {/* Button row — just the two buttons */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
        <Link to={primaryCTA.href}>
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

        <Link to={secondaryCTA.href}>
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
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5 text-accent" />
        <span>{REPORT_CTA_MICROCOPY}</span>
      </div>

      {/* Persona deep-link for the local-founder journey */}
      <Link
        to={REPORT_CREATOR_STARTUP_PATH}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
      >
        Growing an Australian startup instead? Start here
      </Link>
    </div>
  );
};
