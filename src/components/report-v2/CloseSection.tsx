import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import Rich from "./Rich";

/**
 * §14 advisory-session close: headline + deferral body (tone rule — strategy
 * decided together), "worth arriving with a view on" rail, and the shortlist
 * strip region. Plan-specific session copy arrives in the contract data
 * (close.body / cover.scope); the renderer stays data-driven. The strip shows
 * its static empty state here — star chips + persistence land in ticket 13.
 */
const CloseSection = ({ report }: { report: Report }) => {
  const { close } = report;
  return (
    <SectionCard
      label="14 · NEXT: YOUR ADVISORY SESSION"
      className="border-t-report-warn-accent"
      labelClassName="text-report-muted"
    >
      <div className="mt-5 grid grid-cols-[1fr_380px] items-start gap-16">
        <div>
          <h2 className="mb-3.5 text-[22px] font-bold leading-[1.35] [text-wrap:pretty]">
            {close.headline}
          </h2>
          <Rich
            text={close.body}
            className="max-w-[720px] text-[14px] leading-[1.8] text-report-ink-soft"
          />
        </div>
        <div className="rounded-xl border border-report-border px-[30px] py-[26px]">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-report-action">
            WORTH ARRIVING WITH A VIEW ON
          </p>
          <div className="text-[12.5px] leading-[1.75] text-report-ink-soft">
            {close.arriveWith.map((item, i) => (
              <div key={i} className="border-t border-report-border py-2 last:border-b">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-report-border pt-[26px]">
        <p className="mb-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-report-action">
          YOUR SHORTLIST — STARRED FROM THIS REPORT
        </p>
        <p className="text-[12.5px] leading-[1.65] text-report-caption">
          Tap the ☆ next to any provider, hub, mentor, investor or event above to build your own
          shortlist — it collects here and sets the agenda for the advisory session.
        </p>
      </div>
    </SectionCard>
  );
};

export default CloseSection;
