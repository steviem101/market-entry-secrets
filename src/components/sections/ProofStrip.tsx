import { Link } from "react-router-dom";
import { useHeroStats } from "@/hooks/useHeroStats";

interface ProofStat {
  key: keyof NonNullable<ReturnType<typeof useHeroStats>["data"]>;
  label: string;
  fallback: number;
  href: string;
}

// The single source of truth for homepage counts. Every number shown on the
// homepage comes from get_ecosystem_stats() via useHeroStats — no hardcoded
// inventory claims anywhere else on the page.
const PROOF_STATS: ProofStat[] = [
  { key: "serviceProviders", label: "Service providers", fallback: 100, href: "/service-providers" },
  { key: "communityMembers", label: "Mentors", fallback: 30, href: "/mentors" },
  { key: "investors", label: "Investors", fallback: 50, href: "/investors" },
  { key: "leads", label: "Lead databases", fallback: 20, href: "/leads" },
  { key: "events", label: "Events", fallback: 50, href: "/events" },
];

export const ProofStrip = () => {
  const { data } = useHeroStats();

  return (
    <section className="border-y border-border/50 bg-muted/20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PROOF_STATS.map((stat) => {
            const value = data?.[stat.key] || stat.fallback;
            return (
              <Link
                key={stat.key}
                to={stat.href}
                className="group flex items-baseline gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl font-bold text-foreground tabular-nums">
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
