import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { CountryFlag } from "./CountryFlag";
import { Button } from "@/components/ui/button";
import type { CountryPageContent } from "@/lib/countryPageContent";

interface CountryHeroProps {
  countryName: string;
  countryCode: string;
  countrySlug: string;
  content: CountryPageContent | null;
  fallbackHeadline?: string | null;
  fallbackSubhead?: string | null;
}

export const CountryHero = ({
  countryName,
  countryCode,
  countrySlug,
  content,
  fallbackHeadline,
  fallbackSubhead,
}: CountryHeroProps) => {
  const headline = content?.hero_headline || fallbackHeadline || `${countryName} to Australia`;
  const subhead =
    content?.hero_subhead ||
    fallbackSubhead ||
    `Resources for ${countryName} companies entering the Australian market.`;
  const badge = content?.hero_badge;
  const trust = content?.hero_trust_companies ?? [];
  const trustExtra = content?.hero_trust_extra ?? 0;
  const snapshot = content?.live_snapshot ?? [];
  const hasSnapshot = snapshot.length > 0;

  return (
    <section className="border-b border-mes-border bg-mes-card">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-20 grid md:grid-cols-12 gap-10 items-start">
        <div className={hasSnapshot ? "md:col-span-7" : "md:col-span-12"}>
          <div className="flex items-center gap-3 mb-6">
            <CountryFlag countryCode={countryCode} />
            <span className="text-[11px] uppercase tracking-[0.18em] text-mes-teal-dark">
              {countryName}
            </span>
          </div>

          <h1
            className="text-3xl md:text-5xl leading-[1.05] tracking-tight font-bold text-mes-ink"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {headline}
          </h1>

          <p className="mt-5 text-[16px] md:text-[18px] leading-relaxed text-mes-ink-soft max-w-2xl">
            {subhead}
          </p>

          {badge && (
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mes-border bg-mes-bg">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-mes-success/60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mes-success" />
              </span>
              <span className="text-[12px] font-medium tracking-wide uppercase text-mes-ink-soft">
                {badge}
              </span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-mes-teal hover:bg-mes-teal-dark text-white">
              <Link to={`/report-creator?source=country-${countrySlug}`}>
                Generate my {countryName} report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-mes-border text-mes-ink hover:border-mes-ink">
              <Link to={`/contact?topic=${countrySlug}-call`}>
                <Phone className="mr-2 h-4 w-4" />
                Book a strategy call
              </Link>
            </Button>
          </div>

          {trust.length > 0 && (
            <div className="mt-10 flex items-center flex-wrap gap-x-6 gap-y-2 text-[12px] text-mes-ink-muted">
              <span className="uppercase tracking-wider">Trusted by</span>
              {trust.map((c) => (
                <span key={c} className="font-medium text-mes-ink-soft">
                  {c}
                </span>
              ))}
              {trustExtra > 0 && (
                <span className="text-mes-ink-muted">+ {trustExtra} more</span>
              )}
            </div>
          )}
        </div>

        {hasSnapshot && (
        <aside className="md:col-span-5">
          <div className="bg-mes-bg border border-mes-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-[0.18em] text-mes-teal-dark">
                Quick snapshot
              </span>
              <span className="text-[11px] text-mes-ink-muted">Indicative figures</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {snapshot.map((entry) => (
                <div
                  key={entry.label}
                  className="bg-mes-card border border-mes-border rounded-lg p-3"
                >
                  <div className="text-[11px] uppercase tracking-wider text-mes-ink-muted">
                    {entry.label}
                  </div>
                  <div className="text-xl font-semibold text-mes-ink tabular-nums mt-1">
                    {entry.value}
                  </div>
                  {entry.caption && (
                    <div className="text-[10.5px] text-mes-ink-muted mt-1">{entry.caption}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
        )}
      </div>
    </section>
  );
};
