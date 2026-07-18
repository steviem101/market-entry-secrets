import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import Rich from "./Rich";

/**
 * §10 phased action plan: exactly 3 phase columns with a top border accent
 * (first phase sky, rest ink), a mono-caps period label, title, and a body
 * that is EITHER flat prose OR grouped sub-blocks (never both — contract).
 * Every named resource in the body links to its profile via Rich.
 */
const ActionPlanSection = ({ report }: { report: Report }) => {
  const { actionPlan } = report;
  return (
    <SectionCard label="10 · PHASED ACTION PLAN" className="pb-[60px]">
      <Rich
        text={actionPlan.intro}
        className="mb-7 mt-4 max-w-[920px] text-[13.5px] leading-[1.7] text-report-ink-soft"
      />
      <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
        {actionPlan.phases.map((phase, i) => (
          <div
            key={i}
            className={`border-t-[3px] pt-[18px] ${i === 0 ? "border-t-report-sky" : "border-t-report-ink"}`}
          >
            {phase.period && (
              <div
                className={`text-[10px] font-bold uppercase tracking-[0.1em] ${
                  i === 0 ? "text-report-action" : "text-report-muted"
                }`}
              >
                {phase.period}
              </div>
            )}
            {phase.title && <div className="my-2 text-[17px] font-bold">{phase.title}</div>}
            {phase.groups ? (
              <div className="flex flex-col gap-3.5">
                {phase.groups.map((group, g) => (
                  <div key={g}>
                    <div className="mb-1 text-[11px] font-bold text-report-ink">{group.title}</div>
                    <Rich text={group.body} className="text-[12.5px] leading-[1.75] text-report-ink-soft" />
                  </div>
                ))}
              </div>
            ) : (
              phase.body && (
                <Rich text={phase.body} className="text-[12.5px] leading-[1.75] text-report-ink-soft" />
              )
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

export default ActionPlanSection;
