import type { Report } from "@/types/report";
import { formatReportDate } from "@/lib/report-v2/format";
import { extractDomain } from "@/lib/logoUtils";

// B3 (Floats smoke test): the tier headers use a SQUARE marker (▪), NOT the
// round ●/◐/○ evidence-weight chips from the cover legend — same glyph, two
// meanings was the source of the "why are there green then blue/orange/grey
// dots" confusion. One symbol, one meaning.
const TIERS = [
  { key: "regulator", heading: "▪ REGULATOR / STATUTE", headingClass: "text-report-sky-soft" },
  { key: "analyst", heading: "▪ ANALYST / INSTITUTIONAL", headingClass: "text-report-warn-accent" },
  { key: "vendor", heading: "▪ VENDOR / PRESS / END-BUYER", headingClass: "text-report-grey-soft" },
] as const;

/** A single source: hyperlink (new tab) when it is a real URL, plain domain
 *  text otherwise (bare-domain fixtures). Displays the domain either way. */
const Source = ({ value }: { value: string }) => {
  const isUrl = /^https?:\/\//i.test(value);
  const label = extractDomain(value) ?? value;
  if (!isUrl) return <span>{label}</span>;
  return (
    <a href={value} target="_blank" rel="noopener noreferrer" className="text-report-grey-soft underline decoration-report-surface-rule underline-offset-2 transition-colors hover:text-white">
      {label}
    </a>
  );
};

/**
 * Dark closing band: sources grouped by tier (DECISIONS #7 — domains never
 * render raw; the adapter maps them into the three tiers). Each source links to
 * its citation URL when available (B1). Reference: "Sources" screen in
 * reference/*.dc.html.
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
            {sources[key].map((s, i) => (
              <span key={i}>
                {i > 0 && " · "}
                <Source value={s} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SourcesBand;
