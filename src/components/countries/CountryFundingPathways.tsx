import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountryFlag } from "./CountryFlag";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { CountryFundingInstrument } from "@/lib/countryPageContent";

interface CountryFundingPathwaysProps {
  countryName: string;
  countrySlug: string;
  countryCode: string;
  origin: CountryFundingInstrument[];
  destination: CountryFundingInstrument[];
}

const InstrumentList = ({ items }: { items: CountryFundingInstrument[] }) => (
  <ol className="space-y-4">
    {items.map((it, i) => (
      <li key={it.id} className="grid grid-cols-[auto_1fr] gap-4">
        <div className="text-[12px] text-mes-ink-muted pt-1 tabular-nums">
          {String(i + 1).padStart(2, "0")}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[15px] font-semibold text-mes-ink">{it.title}</h4>
            <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-mes-blue-light bg-mes-blue-light/40 text-mes-teal-dark">
              {it.tag}
            </span>
          </div>
          <p className="mt-1 text-[14px] leading-relaxed text-mes-ink-soft">{it.body}</p>
        </div>
      </li>
    ))}
  </ol>
);

export const CountryFundingPathways = ({
  countryName,
  countrySlug,
  countryCode,
  origin,
  destination,
}: CountryFundingPathwaysProps) => {
  if (!origin?.length && !destination?.length) return null;
  return (
    <section className="border-b border-mes-border bg-mes-card">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-24">
        <SectionHeading
          className="mb-10"
          kicker="06 / Funding pathways"
          title={`Stack ${countryName} grants on top of AU credits`}
          subhead={`Use ${countryName} origin support to fund discovery. Use AU instruments to fund execution.`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-mes-bg border border-mes-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <CountryFlag countryCode={countryCode} />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-mes-ink-muted">
                  Origin &middot; {countryName}
                </div>
                <h3 className="text-[18px] font-semibold text-mes-ink">Where the journey starts</h3>
              </div>
            </div>
            <InstrumentList items={origin} />
          </div>

          <div className="rounded-xl p-6 text-white border border-mes-ink-surface"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--mes-ink-surface)) 0%, hsl(var(--mes-teal-dark)) 100%)",
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <CountryFlag countryCode="AU" className="w-7 h-5 rounded-sm overflow-hidden border border-white/20" />
              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/60">
                  Destination &middot; Australia
                </div>
                <h3 className="text-[18px] font-semibold">Where the cash lands</h3>
              </div>
            </div>
            <ol className="space-y-4">
              {destination.map((it, i) => (
                <li key={it.id} className="grid grid-cols-[auto_1fr] gap-4">
                  <div className="text-[12px] text-white/60 pt-1 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-[15px] font-semibold">{it.title}</h4>
                      <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white">
                        {it.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-[14px] leading-relaxed text-white/80">{it.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-8 bg-mes-ink-surface text-white rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-white/60">
              Worked example
            </div>
            <p className="text-[15px] leading-relaxed mt-1 max-w-3xl">
              A Series A SaaS company stacks EUR 35k Market Discovery Fund, A$ 150k EMDG over year one, and a 43.5% R&amp;D refund to fund their first AU country lead and 12 months of GTM spend.
            </p>
          </div>
          <Button asChild size="lg" className="bg-mes-teal hover:bg-mes-teal-dark text-white shrink-0">
            <Link to={`/report-creator?focus=funding&country=${countrySlug}`}>
              Model my stack
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
