import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import Rich from "./Rich";
import { useReportInteractions } from "./ReportInteractionsProvider";

/** A tick-off checkbox for one action-plan step (F3). Durable + advisor-visible
 *  via the interactions store. Print renders a clean empty box (non-interactive). */
const StepCheck = ({ id }: { id: string }) => {
  const { isChecked, toggleCheck } = useReportInteractions();
  const on = isChecked(id);
  return (
    <>
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        aria-label={on ? "Mark step not done" : "Mark step done"}
        onClick={() => toggleCheck(id)}
        className={`mt-[2px] flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[4px] border text-white transition-colors print:hidden ${
          on ? "border-report-action bg-report-action" : "border-report-dash bg-white hover:border-report-action"
        }`}
      >
        {on && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M2.5 6.5l2.2 2.2L9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span aria-hidden className="mt-[1px] hidden h-[14px] w-[14px] shrink-0 rounded-[3px] border border-report-dash print:block" />
    </>
  );
};

/**
 * §10 phased action plan: exactly 3 phase columns with a top border accent
 * (first phase sky, rest ink), a mono-caps period label, title, and a body
 * that is EITHER flat prose OR grouped sub-blocks (never both — contract).
 * Every named resource in the body links to its profile via Rich. Grouped
 * bullets carry a tick-off checkbox (F3) so the customer can work through them
 * and the advisor sees progress.
 */
const ActionPlanSection = ({ report }: { report: Report }) => {
  const { actionPlan } = report;
  const { isChecked } = useReportInteractions();
  return (
    <SectionCard label="PHASED ACTION PLAN" className="pb-10">
      <Rich
        text={actionPlan.intro}
        className="mb-7 mt-4 max-w-[920px] text-[14.5px] leading-[1.7] text-report-ink-soft"
      />
      <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
        {actionPlan.phases.map((phase, i) => (
          <div
            key={i}
            className={`border-t-[3px] pt-[18px] ${i === 0 ? "border-t-report-sky" : "border-t-report-ink"}`}
          >
            {phase.period && (
              <div
                className={`text-[11px] font-bold uppercase tracking-[0.1em] ${
                  i === 0 ? "text-report-action" : "text-report-muted"
                }`}
              >
                {phase.period}
              </div>
            )}
            {phase.title && <div className="my-2 text-[17px] font-bold">{phase.title}</div>}
            {phase.groups && phase.groups.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {phase.groups.map((group, g) => (
                  <div key={g}>
                    <div className="mb-1.5 text-[11px] font-bold text-report-ink">{group.title}</div>
                    <ul className="flex flex-col gap-1.5">
                      {(group.bullets ?? []).map((bullet, b) => {
                        const id = `ap-${i}-${g}-${b}`;
                        return (
                          <li key={b} className="flex gap-2 text-[13.5px] leading-[1.6] text-report-ink-soft">
                            <StepCheck id={id} />
                            <Rich
                              as="span"
                              text={bullet}
                              className={isChecked(id) ? "line-through opacity-55" : undefined}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              phase.body && (
                <Rich text={phase.body} className="text-[13.5px] leading-[1.75] text-report-ink-soft" />
              )
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

export default ActionPlanSection;
