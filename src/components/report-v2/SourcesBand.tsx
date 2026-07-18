import type { Report } from "@/types/report";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.toUpperCase();
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

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
    <section className="rounded-[14px] bg-report-surface px-20 pb-14 pt-12 text-report-caption">
      <div className="mb-[18px] flex items-baseline justify-between">
        <span className="text-[10px] font-bold tracking-[0.12em] text-report-border">
          EVIDENCE — {meta.sourceCount} SOURCES, WEIGHTED
        </span>
        <span className="text-[9.5px] font-medium uppercase">
          {meta.customer} · {formatDate(meta.date)} · MARKET ENTRY SECRETS
        </span>
      </div>
      <div className="grid grid-cols-3 gap-7 text-[11px] leading-[1.8]">
        {TIERS.map(({ key, heading, headingClass }) => (
          <div key={key}>
            <b className={`text-[9px] font-bold ${headingClass}`}>{heading}</b>
            <br />
            {sources[key].join(" · ")}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SourcesBand;
