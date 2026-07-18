import { FileText, CheckCircle2, Lock } from "lucide-react";
import {
  SECTION_ORDER,
  SECTION_LABELS,
  SECTION_CONFIG,
  TIER_REQUIREMENTS,
  TIER_LABELS,
} from "@/components/report/reportSectionConfig";
import { HeroCredibilityBadges } from "./HeroCredibilityBadges";

// How many section rows the static frame shows before the "+ N more" line.
const VISIBLE_SECTIONS = 6;

/**
 * Static real report-output hero graphic (MES-162, flag `hero_journey`,
 * placement Option B). Replaces the auto-cycling mockup: no fake company, no
 * invented metrics — the frame is the real report anatomy (section names, tier
 * gating and match sources all come from reportSectionConfig, the same source
 * of truth ReportView renders from) plus live directory counts. Static first
 * frame by design so the hero's LCP content renders immediately.
 */
export const HeroReportShowcase = () => {
  const visibleSections = SECTION_ORDER.slice(0, VISIBLE_SECTIONS);
  const remaining = SECTION_ORDER.length - VISIBLE_SECTIONS;

  return (
    <div className="relative">
      {/* Glow effect behind the frame */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl rounded-3xl animate-glow" />

      {/* Browser frame */}
      <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-border shadow-xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
          <div className="w-3 h-3 rounded-full bg-red-400/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
          <div className="w-3 h-3 rounded-full bg-green-400/60" />
          <div className="flex-1 mx-4">
            <div className="bg-background border border-border rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-xs mx-auto">
              market-entry-secrets.com/report
            </div>
          </div>
        </div>

        {/* Report output */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Your Australian Market Entry Report
              </div>
              <div className="text-xs text-muted-foreground">
                {SECTION_ORDER.length} sections &middot; personalised to your company
              </div>
            </div>
          </div>

          <ul className="space-y-1.5" aria-label="Report sections">
            {visibleSections.map((sectionId) => {
              const config = SECTION_CONFIG[sectionId];
              const Icon = config?.icon ?? FileText;
              const requiredTier = TIER_REQUIREMENTS[sectionId];
              return (
                <li
                  key={sectionId}
                  className="flex items-center gap-2.5 bg-muted/30 rounded-lg px-3 py-2 border border-border"
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center ${config?.accentBg ?? "bg-muted"}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="flex-1 text-sm text-foreground truncate">
                    {SECTION_LABELS[sectionId] ?? sectionId}
                  </span>
                  {requiredTier ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      {TIER_LABELS[requiredTier] ?? requiredTier}
                    </span>
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-label="Included free" />
                  )}
                </li>
              );
            })}
          </ul>

          {remaining > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              + {remaining} more sections in the full report
            </div>
          )}
          {/* Numbers deliberately absent here — the ProofStrip directly below
              the hero is the page's single source of counts (de-dup, 18 Jul). */}
        </div>
      </div>

      {/* Floating badges — live, verifiable stats only */}
      <HeroCredibilityBadges />
    </div>
  );
};
