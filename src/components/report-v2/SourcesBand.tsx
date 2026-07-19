import type { Report } from "@/types/report";
import { formatReportDate } from "@/lib/report-v2/format";

const TIERS = [
  { key: "regulator", heading: "● REGULATOR / STATUTE", headingClass: "text-report-sky-soft" },
  { key: "analyst", heading: "● ANALYST / INSTITUTIONAL", headingClass: "text-report-warn-accent" },
  { key: "vendor", heading: "● VENDOR / PRESS / END-BUYER", headingClass: "text-report-grey-soft" },
] as const;

/**
 * Dark closing band: sources grouped by tier (DECISIONS #7 — domains never
 * render raw; the adapter maps them into the three tiers). Reference:
 * "Sources" screen in reference/*.dc.html.
 */
const SourcesBand = ({ report }: { report: Report }) => {
  const { sources, meta } = report;
  return (
    <section
      data-report-v2-section
      className="rounded-[14px] bg-report-surface px-5 pb-10 pt-10 text-report-caption lg:px-20 lg:pb-14 lg:pt-12"
    >
      <div className="mb-[18px] flex items-baseline justify-between">
        <span className="text-[11px] font-bold tracking-[0.12em] text-report-border">
          EVIDENCE — {meta.sourceCount} SOURCES, WEIGHTED
        </span>
        <span className="text-[10.5px] font-medium uppercase">
          {meta.customer} · {formatReportDate(meta.date, "short")} · MARKET ENTRY SECRETS
        </span>
      </div>
      <div className="grid grid-cols-1 gap-7 text-[11px] leading-[1.8] md:grid-cols-3">
        {TIERS.map(({ key, heading, headingClass }) => (
          <div key={key}>
            <b className={`text-[10px] font-bold ${headingClass}`}>{heading}</b>
            <br />
            {sources[key].join(" · ")}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SourcesBand;
