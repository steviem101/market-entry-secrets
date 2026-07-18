import type { Report, SwotItem } from "@/types/report";
import SectionCard from "./SectionCard";
import EvidenceChip from "./EvidenceChip";
import Rich from "./Rich";

const QUADRANTS: {
  key: keyof Report["swot"];
  heading: string;
  border: string;
  headingColor: string;
}[] = [
  { key: "strengths", heading: "STRENGTHS", border: "border-l-report-good", headingColor: "text-report-good" },
  { key: "weaknesses", heading: "WEAKNESSES", border: "border-l-report-warn", headingColor: "text-report-warn" },
  { key: "opportunities", heading: "OPPORTUNITIES", border: "border-l-report-sky", headingColor: "text-report-action" },
  { key: "threats", heading: "THREATS", border: "border-l-report-risk", headingColor: "text-report-risk" },
];

const SwotQuadrant = ({ heading, border, headingColor, items }: {
  heading: string;
  border: string;
  headingColor: string;
  items: SwotItem[];
}) => (
  <div className={`rounded-xl border border-report-border border-l-[3px] ${border} px-7 py-6`}>
    <p className={`mb-3 text-[10px] font-bold tracking-[0.12em] ${headingColor}`}>{heading}</p>
    <div className="text-[12.5px] leading-[1.7] text-report-ink-soft">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && " · "}
          <b>{item.lead}</b> — <Rich as="span" text={item.text} />
        </span>
      ))}
    </div>
  </div>
);

/**
 * §02: 3×N metric tile grid (32/800 value + full-size chip + caption) with
 * optional EST footnote, then the SWOT quad with 3px left accents.
 * Degradation: <6 tiles reflow in the same grid; an empty quadrant is
 * omitted entirely (ticket 5).
 */
const MetricsSwotSection = ({ report }: { report: Report }) => {
  const { metrics, swot, meta } = report;
  const quads = QUADRANTS.filter(({ key }) => swot[key].length > 0);
  return (
    <SectionCard label="02 · KEY MARKET METRICS & STRATEGIC POSITION" className="pb-[60px]">
      {metrics.tiles.length > 0 && (
        <div className="mb-5 mt-6 grid grid-cols-1 gap-[22px] sm:grid-cols-2 md:grid-cols-3">
          {metrics.tiles.map((tile, i) => (
            <div key={i} className="rounded-xl border border-report-border px-7 py-6 text-center">
              <div className="text-[32px] font-extrabold leading-tight text-report-action">
                {tile.value}{" "}
                <EvidenceChip chip={tile.chip} className="align-[10px] text-[9px]" />
              </div>
              <div className="mt-1.5 text-[12px] leading-[1.6] text-report-muted">{tile.caption}</div>
            </div>
          ))}
        </div>
      )}
      {metrics.footnote && (
        <p className="mb-10 text-[11px] leading-[1.6] text-report-caption">{metrics.footnote}</p>
      )}
      {quads.length > 0 && (
        <>
          <h2 className="mb-5 text-[18px] font-bold">SWOT — where {meta.customer} stands</h2>
          <div className="grid grid-cols-1 gap-[22px] md:grid-cols-2">
            {quads.map(({ key, ...rest }) => (
              <SwotQuadrant key={key} items={swot[key]} {...rest} />
            ))}
          </div>
        </>
      )}
    </SectionCard>
  );
};

export default MetricsSwotSection;
