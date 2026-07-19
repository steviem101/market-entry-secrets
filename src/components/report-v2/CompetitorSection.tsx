import type { CompetitorRow, Report } from "@/types/report";
import SectionCard from "./SectionCard";
import RequestHook from "./RequestHook";
import StarToggle from "./StarToggle";
import Rich from "./Rich";
import { useReportInteractions } from "./ReportInteractionsProvider";

// Below md the table stacks (README: tables → cards, never horizontal scroll).
// The verdict columns (Strengths, Where-differs) render independently, so the
// grid has 0, 1, or 2 verdict columns on top of player+position. Tailwind's JIT
// only compiles class strings it can see literally, so the three md templates are
// enumerated statically here — a runtime-interpolated `md:grid-cols-[…]` would
// silently never be generated.
const MD_TEMPLATE = [
  "md:grid-cols-[180px_1fr]",
  "md:grid-cols-[180px_1fr_1fr]",
  "md:grid-cols-[180px_1fr_1fr_1fr]",
] as const;
const MLABEL = "mb-0.5 block text-[8px] font-bold uppercase tracking-[0.08em] text-report-muted md:hidden";

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
      <span className={`text-[10.5px] font-medium ${tagClass}`}>{row.positionTag}</span>
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
  // Verdict columns are populated per-column: Strengths (site-derived, Phase 3b)
  // and Where-differs (comparative, Phase B) render independently, so the table
  // shows exactly the columns that have data — never an empty cell per row.
  const hasStrengths = Boolean(
    competitors.you.strengths || competitors.rows.some((r) => r.strengths)
  );
  const hasDiffers = Boolean(
    competitors.you.differs || competitors.rows.some((r) => r.differs)
  );
  const verdictCols = (hasStrengths ? 1 : 0) + (hasDiffers ? 1 : 0);
  const mdTemplate = MD_TEMPLATE[verdictCols];
  const grid = `grid grid-cols-1 gap-2 px-[22px] ${mdTemplate} md:gap-[18px]`;
  return (
    <SectionCard label="03 · COMPETITOR LANDSCAPE" className="pb-10">
      <Rich
        text={competitors.intro}
        className="mb-6 mt-4 max-w-[920px] text-[14.5px] leading-[1.7] text-report-ink-soft"
      />

      <div className="overflow-hidden rounded-xl border border-report-border">
        <div className={`hidden bg-report-bg py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-report-muted md:grid ${mdTemplate} md:gap-[18px] md:px-[22px]`}>
          <span>PLAYER</span>
          <span>MARKET POSITION</span>
          {hasStrengths && <span>STRENGTHS</span>}
          {hasDiffers && <span>WHERE {meta.customer.toUpperCase()} DIFFERS</span>}
        </div>

        <div className={`${grid} border-t-2 border-t-report-sky bg-report-tint py-[18px] text-[13.5px] leading-[1.6]`}>
          <PlayerCell row={competitors.you} tagClass="text-report-action" />
          <span><span className={MLABEL}>Market position</span>{competitors.you.position}</span>
          {hasStrengths && <span><span className={MLABEL}>Strengths</span>{competitors.you.strengths}</span>}
          {hasDiffers && (
            <span className="text-[11px] font-bold uppercase text-report-action">
              <span className={MLABEL}>Where {meta.customer} differs</span>
              {competitors.you.differs}
            </span>
          )}
        </div>

        {competitors.rows.map((row, i) => (
          <div key={i} className={`${grid} border-t border-report-rule py-[18px] text-[13.5px] leading-[1.6]`}>
            <PlayerCell row={row} tagClass="text-report-caption" />
            <span><span className={MLABEL}>Market position</span>{row.position}</span>
            {hasStrengths && <span><span className={MLABEL}>Strengths</span>{row.strengths}</span>}
            {hasDiffers && <span><span className={MLABEL}>Where {meta.customer} differs</span>{row.differs}</span>}
          </div>
        ))}
      </div>

      {(competitors.gaps || competitors.positioningRead) && (
        <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-11">
          {competitors.gaps && (
            <div>
              <h3 className="mb-2.5 text-[14px] font-bold">Market gaps the research identifies</h3>
              <Rich text={competitors.gaps} className="text-[13.5px] leading-[1.75] text-report-ink-soft" />
            </div>
          )}
          {competitors.positioningRead && (
            <div className="rounded-xl border border-report-tint-border bg-report-tint px-7 py-[22px]">
              <p className="mb-2.5 text-[11px] font-bold tracking-[0.12em] text-report-action">
                THE REPORT'S POSITIONING READ
              </p>
              <Rich text={competitors.positioningRead} className="text-[13.5px] leading-[1.75] text-report-ink-soft" />
            </div>
          )}
        </div>
      )}

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
