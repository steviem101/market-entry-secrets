import { useRef, useState } from "react";
import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import StarToggle from "./StarToggle";
import Rich from "./Rich";
import { useReportInteractions } from "./ReportInteractionsProvider";

/**
 * §14 lead list & market data. Leads with a best-guess **suggested** bespoke
 * list (from metadata the report already computed) that the customer can
 * approve as-is or refine — MES builds it manually after they confirm. Then any
 * matched pre-built dataset (record-count chip) OR an honest-gap card, plus the
 * custom-build card, and a request box pre-filled with the suggested spec.
 * Approve and Send share one submission seam (`recordRequest("lead_request")`)
 * and one confirmation state.
 */
const LeadsSection = ({ report }: { report: Report }) => {
  const { leads } = report;
  const { recordRequest } = useReportInteractions();
  const [icp, setIcp] = useState(leads.recommended?.spec ?? "");
  const [sent, setSent] = useState(false);
  const boxRef = useRef<HTMLTextAreaElement>(null);

  const submit = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setSent(true);
    recordRequest("lead_request", { icpDescription: t });
  };

  const confirmation = (
    <div className="mt-4 rounded-xl border border-report-confirm-border bg-report-confirm-bg px-[30px] py-5 text-[13.5px] font-medium leading-[1.6] text-report-confirm-text print:hidden">
      Request sent — our advisor will confirm scope within one business day and deliver the list into your report or advisory session.
    </div>
  );

  return (
    <SectionCard label="LEAD LIST & MARKET DATA" className="pb-14">
      {leads.recommended && (
        <div className="mt-6 rounded-xl border border-report-sky bg-report-tint px-[30px] py-7">
          <p className="mb-2.5 text-[11px] font-bold tracking-[0.12em] text-report-action">
            THE LIST WE'D BUILD FOR YOU
          </p>
          <p className="text-[17px] font-bold leading-[1.4] text-report-ink">{leads.recommended.spec}</p>
          {leads.recommended.why && (
            <Rich
              text={leads.recommended.why}
              className="mt-2.5 max-w-[820px] text-[14px] leading-[1.7] text-report-ink-soft"
            />
          )}
          <p className="mt-2.5 text-[12.5px] italic text-report-muted">
            A best guess from your report — approve it and our advisor builds the list for you, or refine it below.
          </p>
          {sent ? (
            confirmation
          ) : (
            <div className="mt-4 flex flex-wrap gap-3 print:hidden">
              <button
                type="button"
                onClick={() => submit(leads.recommended!.spec)}
                className="whitespace-nowrap rounded-lg bg-report-sky px-[22px] py-[11px] text-[13.5px] font-bold text-white transition-colors hover:bg-report-action"
              >
                Approve this list
              </button>
              <button
                type="button"
                onClick={() => {
                  boxRef.current?.focus();
                  boxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="whitespace-nowrap rounded-lg border border-report-sky px-[22px] py-[11px] text-[13.5px] font-bold text-report-action transition-colors hover:bg-white"
              >
                Refine it
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-[22px] grid grid-cols-1 items-stretch gap-[22px] md:grid-cols-2">
        {leads.dataset ? (
          <div className="rounded-xl border border-report-tint-border bg-report-tint px-[30px] py-[26px]">
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="text-[11px] font-bold tracking-[0.12em] text-report-action">
                AVAILABLE NOW · MATCHED DATASET
              </span>
              <span className="whitespace-nowrap text-[9.5px] font-bold text-report-good">
                {leads.dataset.records} RECORDS
              </span>
            </div>
            <div className="my-2 text-[15px] font-bold">
              {leads.dataset.url ? (
                <a href={leads.dataset.url} target="_blank" rel="noopener" className="text-inherit hover:underline">
                  {leads.dataset.name} ↗
                </a>
              ) : (
                leads.dataset.name
              )}
              <StarToggle name={leads.dataset.name} url={leads.dataset.url} section="Leads" />
            </div>
            <Rich text={leads.dataset.description} className="text-[14px] leading-[1.7] text-report-ink-soft" />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-report-dash bg-report-hook-bg px-[30px] py-[26px]">
            <p className="mb-2.5 text-[11px] font-bold tracking-[0.12em] text-report-warn">
              CURRENT DIRECTORY STATUS
            </p>
            <Rich
              text={leads.gapCopy ?? "No matching pre-built lead dataset in the directory today."}
              className="text-[14px] leading-[1.7] text-report-ink-soft"
            />
          </div>
        )}

        <div className="rounded-xl border border-report-tint-border bg-report-tint px-[30px] py-[26px]">
          <p className="mb-2.5 text-[11px] font-bold tracking-[0.12em] text-report-action">
            CUSTOM DATA BUILD — ON REQUEST
          </p>
          <Rich text={leads.customBuildCopy} className="text-[14px] leading-[1.7] text-report-ink-soft" />
        </div>
      </div>

      {/* Request box — pre-filled with the suggested spec so "refine" means edit,
          not write from scratch. Shares the submission seam + confirmation with
          the hero's Approve button. */}
      {sent ? (
        <>
          <p className="mt-[22px] hidden text-[12.5px] italic text-report-muted print:block">
            Reply to this report with your ideal customer profile and we'll build the list.
          </p>
          {/* Always confirm in place: the hero card's confirmation can be scrolled
              out of view when the request was sent from this bottom box. */}
          {confirmation}
        </>
      ) : (
        <div className="mt-[22px] grid grid-cols-1 items-stretch gap-5 md:grid-cols-[1fr_auto] md:items-end md:gap-7 rounded-xl border border-report-border px-[30px] py-[26px]">
          <div>
            <p className="mb-2.5 text-[11px] font-bold tracking-[0.12em] text-report-action">
              {leads.recommended ? "REFINE OR DESCRIBE YOUR OWN LIST" : "TELL US WHAT LEAD LIST YOU NEED"}
            </p>
            <p className="mb-3 text-[12.5px] leading-[1.6] text-report-muted">
              Describe your ideal customer — role, company type, size, region — and we'll pull the list
              together and add it to this report.
            </p>
            <textarea
              ref={boxRef}
              value={icp}
              onChange={(e) => setIcp(e.target.value)}
              placeholder="e.g. Heads of Operations at NSW hospitality groups, 10+ venues, using JobAdder/Lightspeed"
              rows={2}
              className="w-full resize-y rounded-lg border border-report-border bg-report-bg px-4 py-3 text-[13.5px] leading-[1.6] text-report-ink outline-none placeholder:text-report-caption focus:border-report-sky"
            />
            <p className="hidden text-[12.5px] italic text-report-muted print:block">
              Reply to this report with your ideal customer profile and we'll build the list.
            </p>
          </div>
          <button
            type="button"
            disabled={icp.trim() === ""}
            onClick={() => submit(icp)}
            className="whitespace-nowrap rounded-lg bg-report-sky px-[22px] py-[11px] text-[13.5px] font-bold text-white transition-colors hover:bg-report-action disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send request
          </button>
        </div>
      )}
    </SectionCard>
  );
};

export default LeadsSection;
