import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import type { CountryTradeMetric } from "@/lib/countryPageContent";

interface CountryTradeSnapshotProps {
  metrics: CountryTradeMetric[];
  countryName: string;
}

export const CountryTradeSnapshot = ({ metrics, countryName }: CountryTradeSnapshotProps) => {
  if (!metrics?.length) return null;

  return (
    <section className="bg-mes-ink-surface text-white border-b border-mes-ink">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-20">
        <SectionHeading
          className="mb-10"
          tone="inverse"
          kicker="01 / Trade snapshot"
          title={`The numbers behind ${countryName} to Australia`}
          subhead={`Six tiles. Pulled from the official sources ${countryName} founders use to underwrite an Australia decision.`}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map((m, i) => {
            const idx = String(i + 1).padStart(2, "0");
            const Trend = m.positive ? ArrowUpRight : ArrowDownRight;
            const deltaTone = m.positive ? "text-mes-success" : "text-mes-warning";
            return (
              <div
                key={m.id}
                className="bg-white/[0.04] border border-white/10 rounded-xl p-4 flex flex-col"
              >
                <div className="text-[11px] uppercase tracking-wider text-white/50 mb-2">
                  {idx}
                </div>
                <div className="text-[22px] md:text-[26px] font-semibold tabular-nums leading-tight">
                  {m.value}
                </div>
                <div className="text-[13px] text-white/70 mt-1 leading-snug">{m.label}</div>
                {m.delta && (
                  <div className={`mt-3 inline-flex items-center gap-1 text-[12px] font-medium ${deltaTone}`}>
                    <Trend className="h-3.5 w-3.5" />
                    <span className="tabular-nums">{m.delta}</span>
                  </div>
                )}
                <div className="mt-3 text-[10.5px] uppercase tracking-wider text-white/40">
                  src &middot; {m.source}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
