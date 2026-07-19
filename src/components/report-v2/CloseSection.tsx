import { Heart } from "lucide-react";
import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import Rich from "./Rich";
import { useReportInteractions } from "./ReportInteractionsProvider";

/**
 * §14 advisory-session close: headline + deferral body (tone rule — strategy
 * decided together), "worth arriving with a view on" rail, and the shortlist
 * strip — starred entities collect here as linked chips (ticket 13); the empty
 * state explains the heart mechanic. Plan-specific session copy arrives in the
 * contract data (close.body / cover.scope); the renderer stays data-driven.
 */
const CloseSection = ({ report }: { report: Report }) => {
  const { close } = report;
  const { starred } = useReportInteractions();
  return (
    <SectionCard
      label="14 · NEXT: YOUR ADVISORY SESSION"
      className="border-t-report-warn-accent"
      labelClassName="text-report-muted"
    >
      <div className={`mt-5 grid grid-cols-1 items-start gap-10 ${close.arriveWith.length > 0 ? "lg:grid-cols-[1fr_380px] lg:gap-16" : ""}`}>
        <div>
          <h2 className="mb-3.5 text-[22px] font-bold leading-[1.35] [text-wrap:pretty]">
            {close.headline}
          </h2>
          {close.body && (
            <Rich
              text={close.body}
              className="max-w-[720px] text-[14px] leading-[1.8] text-report-ink-soft"
            />
          )}
        </div>
        {close.arriveWith.length > 0 && (
          <div className="rounded-xl border border-report-border px-[30px] py-[26px]">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-report-action">
              WORTH ARRIVING WITH A VIEW ON
            </p>
            <div className="text-[13.5px] leading-[1.75] text-report-ink-soft">
              {close.arriveWith.map((item, i) => (
                <div key={i} className="border-t border-report-border py-2 last:border-b">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 border-t border-report-border pt-[26px]">
        <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-report-action">
          YOUR SHORTLIST — STARRED FROM THIS REPORT
        </p>
        {starred.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2.5">
              {starred.map((item) => {
                const inner = (
                  <>
                    <Heart className="h-3 w-3 fill-current text-red-500" />
                    {item.name} · {item.section}
                  </>
                );
                const cls =
                  "inline-flex items-center gap-1.5 rounded-full border border-report-tint-border bg-report-tint px-4 py-2 text-[12.5px] font-semibold text-report-action";
                // Key by entity identity (url, else name) — the shortlist is a
                // mutable add/remove list, so index keys would misreconcile.
                const key = item.url || item.name;
                return item.url ? (
                  <a key={key} href={item.url} target="_blank" rel="noopener" className={`${cls} hover:underline`}>
                    {inner}
                  </a>
                ) : (
                  <span key={key} className={cls}>
                    {inner}
                  </span>
                );
              })}
            </div>
            <p className="mt-3 text-[12px] leading-[1.6] text-report-caption">
              This set pre-frames your advisory session — we'll arrive prepared on exactly these.
            </p>
          </>
        ) : (
          <>
            <p className="text-[13.5px] leading-[1.65] text-report-caption print:hidden">
              Tap the ♥ next to any provider, hub, mentor, investor or event above to build your own
              shortlist — it collects here and sets the agenda for the advisory session.
            </p>
            {/* Print has no interactive hearts — state the mechanic without "tap". */}
            <p className="hidden text-[13.5px] leading-[1.65] text-report-caption print:block">
              Saved providers, hubs, mentors, investors and events collect here in your online report
              and set the agenda for the advisory session.
            </p>
          </>
        )}
      </div>
    </SectionCard>
  );
};

export default CloseSection;
