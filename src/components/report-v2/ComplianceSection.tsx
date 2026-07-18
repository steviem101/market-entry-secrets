import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import EvidenceChip from "./EvidenceChip";
import Rich from "./Rich";

const SEVERITY: Record<"red" | "amber" | "grey", { border: string; width: string; tag: string }> = {
  red: { border: "border-t-report-risk", width: "border-t-2", tag: "text-report-risk" },
  amber: { border: "border-t-report-warn", width: "border-t", tag: "text-report-warn" },
  grey: { border: "border-t-report-rule", width: "border-t", tag: "text-report-muted" },
};

const GRID = "grid grid-cols-[230px_1fr_1fr] gap-[18px] px-[22px]";

/**
 * §11 setup & compliance: exposure/requirement table with severity-colored
 * top borders, a left-rail of key cost stats (26/800 + chip), and a 2-col
 * readiness checklist. Archetype-specific rows come from the data.
 */
const ComplianceSection = ({ report }: { report: Report }) => {
  const { compliance } = report;
  return (
    <SectionCard label="11 · SETUP & COMPLIANCE" className="pb-[60px]">
      <Rich
        text={compliance.intro}
        className="mb-7 mt-4 max-w-[920px] text-[13.5px] leading-[1.7] text-report-ink-soft"
      />

      {compliance.table.length > 0 && (
        <div className="mb-11 overflow-hidden rounded-xl border border-report-border">
          <div className={`${GRID} bg-report-bg py-2.5 text-[9px] font-bold uppercase tracking-[0.08em] text-report-muted`}>
            <span>REQUIREMENT</span>
            <span>WHAT THE RESEARCH SAYS</span>
            <span>PRACTICAL NOTE</span>
          </div>
          {compliance.table.map((row, i) => {
            const sev = SEVERITY[row.severity];
            return (
              <div key={i} className={`${GRID} ${sev.width} ${sev.border} py-[18px] text-[12.5px] leading-[1.65]`}>
                <span>
                  <b>{row.requirement}</b>
                  <br />
                  <span className={`text-[9px] font-medium uppercase ${sev.tag}`}>{row.tag}</span>
                </span>
                <span>{row.finding}</span>
                <span>{row.note}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-[360px_1fr] items-start gap-16">
        {compliance.stats.length > 0 && (
          <div className="flex flex-col gap-5 border-l-2 border-l-report-ink pl-[26px]">
            {compliance.stats.map((stat, i) => (
              <div key={i}>
                <div className="text-[26px] font-extrabold">
                  {stat.value} <EvidenceChip chip={stat.chip} className="align-[6px] text-[9px]" />
                </div>
                <div className="text-[11.5px] leading-[1.6] text-report-muted">{stat.caption}</div>
              </div>
            ))}
          </div>
        )}
        {compliance.checklist.length > 0 && (
          <div>
            <h3 className="mb-3.5 text-[17px] font-bold">Readiness checklist</h3>
            <div className="grid grid-cols-2 gap-x-10 text-[12.5px] leading-[1.65] text-report-ink-soft">
              {compliance.checklist.map((item, i) => (
                <div key={i} className="border-t border-report-border py-3">
                  <b>{item.lead}</b> — {item.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default ComplianceSection;
