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
const PROOF_STATS: ProofStat[] = [
  { key: "serviceProviders", label: "Service providers", fallback: 110, href: "/service-providers" },
  { key: "communityMembers", label: "Mentors", fallback: 130, href: "/mentors" },
  { key: "investors", label: "Investors", fallback: 490, href: "/investors" },
  { key: "leads", label: "Lead databases", fallback: 60, href: "/leads" },
  { key: "events", label: "Events", fallback: 140, href: "/events" },
  { key: "innovationEcosystem", label: "Innovation ecosystem", fallback: 200, href: "/innovation-ecosystem" },
  { key: "guides", label: "Guides", fallback: 40, href: "/content?type=guide" },
  { key: "caseStudies", label: "Case studies", fallback: 140, href: "/case-studies" },
  { key: "governmentAgencies", label: "Government agencies", fallback: 140, href: "/government-support" },
];

export const ProofStrip = () => {
  const { data } = useHeroStats();

  return (
    <section className="border-y border-border/50 bg-muted/20">
      <div className="container mx-auto px-4 py-6">
        {/* Nine counters wrap onto as few rows as the viewport allows. Tighter
            gaps + a smaller number on mobile keep the strip's height in line
            with the MES-116 reductions even with the fuller directory set. */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-10 md:gap-y-4">
          {PROOF_STATS.map((stat) => {
            const value = displayCount(data?.[stat.key] ?? stat.fallback);
            return (
              <Link
                key={stat.key}
                to={stat.href}
                className="group flex items-baseline gap-1.5 hover:opacity-80 transition-opacity"
              >
                <span className="text-xl md:text-2xl font-bold text-foreground tabular-nums">
                  {value}
                  <span className="text-primary">+</span>
                </span>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
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
