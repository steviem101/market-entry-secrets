import { Building2, FileText } from "lucide-react";
import { useEcosystemStats } from "@/hooks/useEcosystemStats";
import { displayCount } from "@/lib/heroStatsDisplay";

/**
 * Floating hero badges backed by live data (MES-162). Replaces the old
 * unsubstantiated "97% match" / "4.9/5" / "Report in 3 min" badges: every
 * number here comes from get_ecosystem_stats() and matches the directory
 * pages, and nothing renders until the counts are verified (> 0) — the hero
 * must never float a fabricated stat.
 */
export const HeroCredibilityBadges = () => {
  const { stats, isReady } = useEcosystemStats();
  if (!isReady || !stats) return null;

  return (
    <>
      <div
        className="absolute -top-3 right-4 lg:-right-3 bg-background/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-md animate-float z-20"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs font-semibold text-foreground">
            {displayCount(stats.serviceProviders)}+ vetted providers
          </span>
        </div>
      </div>

      {stats.reportsGenerated > 0 && (
        <div
          className="absolute -bottom-2 left-4 lg:-left-3 bg-background/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-md animate-float z-20"
          style={{ animationDelay: "2s" }}
        >
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              {displayCount(stats.reportsGenerated)}+ reports generated
            </span>
          </div>
        </div>
      )}
      {/* Two badges max — the ProofStrip below the hero owns the full count
          set, so the hero doesn't restate it (de-dup, 18 Jul). */}
    </>
  );
};
