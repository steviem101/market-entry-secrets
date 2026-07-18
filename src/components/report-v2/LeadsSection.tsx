import { useState } from "react";
import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import Rich from "./Rich";

/**
 * Custom lead-list request box: ICP textarea + Send request → inline
 * confirmation. onRequest is the ticket-14 persistence/ops-notification seam
 * (lead_request with the ICP description); fires once on submit.
 */
const LeadRequestBox = ({ onRequest }: { onRequest?: (icp: string) => void }) => {
  const [icp, setIcp] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="mt-[22px] rounded-xl border border-report-confirm-border bg-report-confirm-bg px-[30px] py-6 text-[12.5px] font-medium leading-[1.6] text-report-confirm-text">
        Request sent — we'll confirm scope within one business day and the list will appear in this section.
      </div>
    );
  }
  return (
    <div className="mt-[22px] grid grid-cols-[1fr_auto] items-end gap-7 rounded-xl border border-report-border px-[30px] py-[26px]">
      <div>
        <p className="mb-2.5 text-[10px] font-bold tracking-[0.12em] text-report-action">
          TELL US WHAT LEAD LIST YOU NEED
        </p>
        <p className="mb-3 text-[12px] leading-[1.6] text-report-muted">
          Describe your ideal customer — role, company type, size, region — and we'll pull the list
          together and add it to this report.
        </p>
        <textarea
          value={icp}
          onChange={(e) => setIcp(e.target.value)}
          placeholder="e.g. Heads of Operations at NSW hospitality groups, 10+ venues, using JobAdder/Lightspeed"
          rows={2}
          className="w-full resize-y rounded-lg border border-report-border bg-report-bg px-4 py-3 text-[12.5px] leading-[1.6] text-report-ink outline-none placeholder:text-report-caption focus:border-report-sky"
        />
      </div>
      <button
        type="button"
        disabled={icp.trim() === ""}
        onClick={() => {
          setSent(true);
          onRequest?.(icp.trim());
        }}
        className="whitespace-nowrap rounded-lg bg-report-sky px-[22px] py-[11px] text-[12.5px] font-bold text-white transition-colors hover:bg-report-action disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send request
      </button>
    </div>
  );
};

/**
 * §13 lead list: a matched-dataset card (record-count chip) OR an honest-gap
 * card, alongside a custom-build card, then the always-present ICP request
 * box. Degradation: Floats/lemlist (no dataset → gap) vs Nory (360-record
 * dataset). The request box always renders.
 */
const LeadsSection = ({ report }: { report: Report }) => {
  const { leads } = report;
  return (
    <SectionCard label="13 · LEAD LIST & MARKET DATA" className="pb-14">
      <div className="mt-6 grid grid-cols-2 items-stretch gap-[22px]">
        {leads.dataset ? (
          <div className="rounded-xl border border-report-tint-border bg-report-tint px-[30px] py-[26px]">
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="text-[10px] font-bold tracking-[0.12em] text-report-action">
                AVAILABLE NOW · MATCHED DATASET
              </span>
              <span className="whitespace-nowrap text-[8.5px] font-bold text-report-good">
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
            </div>
            <Rich text={leads.dataset.description} className="text-[13px] leading-[1.7] text-report-ink-soft" />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-report-dash bg-report-hook-bg px-[30px] py-[26px]">
            <p className="mb-2.5 text-[10px] font-bold tracking-[0.12em] text-report-warn">
              CURRENT DIRECTORY STATUS
            </p>
            <Rich
              text={leads.gapCopy ?? "No matching pre-built lead dataset in the directory today."}
              className="text-[13px] leading-[1.7] text-report-ink-soft"
            />
          </div>
        )}

        <div className="rounded-xl border border-report-tint-border bg-report-tint px-[30px] py-[26px]">
          <p className="mb-2.5 text-[10px] font-bold tracking-[0.12em] text-report-action">
            CUSTOM DATA BUILD — ON REQUEST
          </p>
          <Rich text={leads.customBuildCopy} className="text-[13px] leading-[1.7] text-report-ink-soft" />
        </div>
      </div>

      <LeadRequestBox />
    </SectionCard>
  );
};

export default LeadsSection;
