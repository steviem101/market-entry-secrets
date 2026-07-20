import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import EvidenceChip from "./EvidenceChip";
import Rich from "./Rich";

const SEVERITY: Record<"red" | "amber" | "grey", { border: string; width: string; tag: string }> = {
  red: { border: "border-t-report-risk", width: "border-t-2", tag: "text-report-risk" },
  amber: { border: "border-t-report-warn", width: "border-t", tag: "text-report-warn" },
  grey: { border: "border-t-report-rule", width: "border-t", tag: "text-report-muted" },
};

// Below md the table stacks (README: tables → cards, never horizontal scroll).
const GRID = "grid grid-cols-1 gap-1.5 px-[22px] md:grid-cols-[230px_1fr_1fr] md:gap-[18px]";
const MLABEL = "mb-0.5 block text-[8px] font-bold uppercase tracking-[0.08em] text-report-muted md:hidden";

/**
 * §11 setup & compliance: exposure/requirement table with severity-colored
 * top borders, a left-rail of key cost stats (26/800 + chip), and a 2-col
 * readiness checklist. Archetype-specific rows come from the data.
 */
const ComplianceSection = ({ report }: { report: Report }) => {
  const { compliance } = report;
  return (
    <SectionCard label="11 · SETUP & COMPLIANCE" className="pb-10">
      <Rich
        text={compliance.intro}
        className="mb-7 mt-4 max-w-[920px] text-[14.5px] leading-[1.7] text-report-ink-soft"
      />

      {compliance.table.length > 0 && (
        <div className="mb-11 overflow-hidden rounded-xl border border-report-border">
          <div className={`hidden bg-report-bg py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-report-muted md:grid md:grid-cols-[230px_1fr_1fr] md:gap-[18px] md:px-[22px]`}>
            <span>REQUIREMENT</span>
            <span>WHAT THE RESEARCH SAYS</span>
            <span>PRACTICAL NOTE</span>
          </div>
          {compliance.table.map((row, i) => {
            // Fail-safe: an unexpected severity (real-report adapter path) must
            // not throw and take the whole report down — default to grey.
            const sev = SEVERITY[row.severity] ?? SEVERITY.grey;
            return (
              <div key={i} className={`${GRID} ${sev.width} ${sev.border} py-[18px] text-[13.5px] leading-[1.65]`}>
                <span>
                  <b>{row.requirement}</b>
                  <br />
                  <span className={`text-[10px] font-medium uppercase ${sev.tag}`}>{row.tag}</span>
                </span>
                <span><span className={MLABEL}>What the research says</span>{row.finding}</span>
                <span><span className={MLABEL}>Practical note</span>{row.note}</span>
              </div>
            );
          })}
        </div>
      )}

      {(compliance.stats.length > 0 || compliance.checklist.length > 0) && (
        // With a stats rail present the block is a [360px | content] split; with
        // no stats it MUST collapse to a single full-width column — otherwise the
        // checklist auto-places into the 360px track and the right ~870px is dead
        // white space (real-data audit: the stats rail is frequently empty).
        <div
          className={
            compliance.stats.length > 0
              ? "grid grid-cols-1 items-start gap-10 lg:grid-cols-[360px_1fr] lg:gap-16"
              : ""
          }
        >
          {compliance.stats.length > 0 && (
            <div className="flex flex-col gap-5 border-l-2 border-l-report-ink pl-[26px]">
              {compliance.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-[26px] font-extrabold">
                    {stat.value} <EvidenceChip chip={stat.chip} className="align-[6px] text-[10px]" />
                  </div>
                  <div className="text-[12px] leading-[1.6] text-report-muted">{stat.caption}</div>
                </div>
              ))}
            </div>
          )}
          {compliance.checklist.length > 0 && (
            <div>
              <h3 className="mb-3.5 text-[17px] font-bold">Readiness checklist</h3>
              {/* Full-width → 3 columns to fill the row; beside the stats rail the
                  1fr track is narrower, so 2 columns there. */}
              <div
                className={`grid grid-cols-1 gap-x-10 text-[13.5px] leading-[1.65] text-report-ink-soft ${
                  compliance.stats.length > 0 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {compliance.checklist.map((item, i) => (
                  <div key={i} className="border-t border-report-border py-3">
                    <b>{item.lead}</b> — <Rich as="span" text={item.text} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
};

export default ComplianceSection;
