import type { CompetitorRow, Report } from "@/types/report";
import SectionCard from "./SectionCard";
import RequestHook from "./RequestHook";
import StarToggle from "./StarToggle";
import Rich from "./Rich";
import { useReportInteractions } from "./ReportInteractionsProvider";

const GRID = "grid grid-cols-[180px_1fr_1fr_1fr] gap-[18px] px-[22px]";

const PlayerCell = ({ row, tagClass }: { row: CompetitorRow; tagClass: string }) => {
  const isCustomer = row.positionTag.startsWith("YOU");
  return (
    <span>
      {row.url ? (
        <a href={row.url} target="_blank" rel="noopener" className="text-inherit">
          <b>{row.name} ↗</b>
        </a>
      ) : (
        <b className={isCustomer ? "font-extrabold" : "font-bold"}>{row.name}</b>
      )}
      {!isCustomer && <StarToggle name={row.name} url={row.url} section="Competitor" />}
      <br />
      <span className={`text-[9.5px] font-medium ${tagClass}`}>{row.positionTag}</span>
    </span>
  );
};

/**
 * §03 competitor landscape: ruled table with the customer row first (sky
 * tint, 2px sky top rule, caps verdict), gaps + positioning-read callout,
 * and the competitor-scan request hook. n=1 renders a single row + hook,
 * never an empty table (README degradation rules).
 */
const CompetitorSection = ({ report }: { report: Report }) => {
  const { competitors, meta } = report;
  const { recordRequest } = useReportInteractions();
  return (
    <SectionCard label="03 · COMPETITOR LANDSCAPE" className="pb-[60px]">
      <Rich
        text={competitors.intro}
        className="mb-6 mt-4 max-w-[920px] text-[13.5px] leading-[1.7] text-report-ink-soft"
      />

      <div className="overflow-hidden rounded-xl border border-report-border">
        <div className={`${GRID} bg-report-bg py-2.5 text-[9px] font-bold uppercase tracking-[0.08em] text-report-muted`}>
          <span>PLAYER</span>
          <span>MARKET POSITION</span>
          <span>STRENGTHS</span>
          <span>WHERE {meta.customer.toUpperCase()} DIFFERS</span>
        </div>

        <div className={`${GRID} border-t-2 border-t-report-sky bg-report-tint py-[18px] text-[12.5px] leading-[1.6]`}>
          <PlayerCell row={competitors.you} tagClass="text-report-action" />
          <span>{competitors.you.position}</span>
          <span>{competitors.you.strengths}</span>
          <span className="text-[10px] font-bold uppercase text-report-action">{competitors.you.differs}</span>
        </div>

        {competitors.rows.map((row, i) => (
          <div key={i} className={`${GRID} border-t border-report-rule py-[18px] text-[12.5px] leading-[1.6]`}>
            <PlayerCell row={row} tagClass="text-report-caption" />
            <span>{row.position}</span>
            <span>{row.strengths}</span>
            <span>{row.differs}</span>
          </div>
        ))}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-11">
        <div>
          <h3 className="mb-2.5 text-[13px] font-bold">Market gaps the research identifies</h3>
          <Rich text={competitors.gaps} className="text-[12.5px] leading-[1.75] text-report-ink-soft" />
        </div>
        <div className="rounded-xl border border-report-tint-border bg-report-tint px-7 py-[22px]">
          <p className="mb-2.5 text-[10px] font-bold tracking-[0.12em] text-report-action">
            THE REPORT'S POSITIONING READ
          </p>
          <Rich text={competitors.positioningRead} className="text-[12.5px] leading-[1.75] text-report-ink-soft" />
        </div>
      </div>

      {competitors.scanHookCopy && (
        <RequestHook
          className="mt-[22px]"
          copy={
            <>
              <b>Want a deeper competitive scan?</b> {competitors.scanHookCopy}
            </>
          }
          buttonLabel="Request scan"
          confirmation="Scan requested — the expanded competitor set will be added to this section."
          onRequest={() => recordRequest("scan_request")}
        />
      )}
    </SectionCard>
  );
};

export default CompetitorSection;
