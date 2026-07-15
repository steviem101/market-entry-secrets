import { Link } from "react-router-dom";
import { useHeroStats } from "@/hooks/useHeroStats";
import { displayCount } from "@/lib/heroStatsDisplay";

interface ProofStat {
  key: keyof NonNullable<ReturnType<typeof useHeroStats>["data"]>;
  label: string;
  fallback: number;
  href: string;
}

// The single source of truth for homepage counts. Every number shown on the
// homepage comes from get_ecosystem_stats() via useHeroStats — no hardcoded
// inventory claims anywhere else on the page. Fallbacks render only if the
// RPC fails and must stay at-or-below the real counts (checked 2026-07-15:
// 113 providers, 132 active mentors, 499 investors, 65 lead lists, 340 events,
// 217 innovation-ecosystem orgs, 44 published guides, 146 case studies,
// 148 active government/trade agencies).
//
// Labels are deliberately abbreviated ("Providers", "Gov agencies") so all
// nine counters fit a single row on desktop — each link's destination
// directory carries the full name.
const PROOF_STATS: ProofStat[] = [
  { key: "serviceProviders", label: "Providers", fallback: 110, href: "/service-providers" },
  { key: "communityMembers", label: "Mentors", fallback: 130, href: "/mentors" },
  { key: "investors", label: "Investors", fallback: 490, href: "/investors" },
  { key: "leads", label: "Lead lists", fallback: 60, href: "/leads" },
  { key: "events", label: "Events", fallback: 140, href: "/events" },
  { key: "innovationEcosystem", label: "Ecosystem orgs", fallback: 200, href: "/innovation-ecosystem" },
  { key: "guides", label: "Guides", fallback: 40, href: "/content?type=guide" },
  { key: "caseStudies", label: "Case studies", fallback: 140, href: "/case-studies" },
  { key: "governmentAgencies", label: "Gov agencies", fallback: 140, href: "/government-support" },
];

export const ProofStrip = () => {
  const { data } = useHeroStats();

  return (
    <section className="border-y border-border/50 bg-muted/20">
      <div className="container mx-auto px-4 py-6">
        {/* Three tiers, one list. Mobile: a 3×3 grid of stacked stat tiles —
            all nine visible at once in roughly a third of the height the old
            inline wrap needed. md→1400px: an inline baseline row clamped to
            max-w-3xl so the nine counters break as a deliberate, balanced
            5 + 4 instead of an 8 + 1 orphan. ≥1400px: unclamped — the
            abbreviated labels + text-xl numbers + tight gaps land all nine
            on ONE row (measured 1323px vs the 1336px container). */}
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 md:mx-auto md:flex md:max-w-3xl md:flex-wrap md:items-center md:justify-center md:gap-x-4 md:gap-y-3 min-[1400px]:max-w-none">
          {PROOF_STATS.map((stat) => {
            const value = displayCount(data?.[stat.key] ?? stat.fallback);
            return (
              <Link
                key={stat.key}
                to={stat.href}
                className="group flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity md:flex-row md:items-baseline md:gap-1.5"
              >
                <span className="text-lg font-bold text-foreground tabular-nums md:text-xl">
                  {value}
                  <span className="text-primary">+</span>
                </span>
                <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors md:text-sm">
                  {stat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
