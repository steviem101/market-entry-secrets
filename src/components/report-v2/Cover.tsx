import { useState } from "react";
import type { Report } from "@/types/report";
import { getLogoDevUrl } from "@/lib/logoUtils";
import { formatReportDate } from "@/lib/report-v2/format";
import Rich from "./Rich";

/**
 * Customer cover mark: logo.dev from meta.domain when present, monogram
 * fallback otherwise or on load failure (DECISIONS #6, build decision 4).
 * Fixed 46px slot — the image never drives layout.
 */
const CoverMark = ({ customer, domain }: { customer: string; domain?: string }) => {
  const [failed, setFailed] = useState(false);
  if (domain && !failed) {
    return (
      <img
        src={getLogoDevUrl(domain, 46)}
        alt={`${customer} logo`}
        width={46}
        height={46}
        className="h-[46px] w-[46px] rounded-[11px] bg-white object-contain"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      aria-hidden
      className="flex h-[46px] w-[46px] items-center justify-center rounded-[11px] bg-report-sky text-[21px] font-extrabold text-white"
    >
      {customer.charAt(0).toUpperCase()}
    </div>
  );
};

/** Dark cover: identity row, thesis headline, scope, evidence legend strip. */
const Cover = ({ report }: { report: Report }) => {
  const { meta, cover } = report;
  return (
    <section className="overflow-hidden rounded-[14px] bg-report-surface px-5 pb-10 pt-12 lg:px-20 lg:pb-14 lg:pt-[72px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <CoverMark customer={meta.customer} domain={meta.domain} />
          <div>
            <div className="text-[16px] font-extrabold text-white">{meta.customer}</div>
            <div className="text-[10px] font-medium uppercase text-report-caption">{meta.descriptor}</div>
          </div>
        </div>
        <div className="text-right text-[10px] font-medium uppercase leading-[1.7] text-report-caption">
          MARKET ENTRY SECRETS
          <br />
          {formatReportDate(meta.date, "long")} · {meta.plan.toUpperCase()} PLAN
        </div>
      </div>

      <div className="mt-[60px] max-w-[860px]">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-report-sky-soft">
          {cover.kicker}
        </p>
        <h1 className="text-[30px] font-extrabold leading-[1.15] tracking-[-0.015em] text-white [text-wrap:pretty] lg:text-[42px]">
          {cover.headline}
        </h1>
        <Rich
          text={cover.scope}
          className="mt-5 max-w-[720px] text-[16px] leading-[1.7] text-report-grey-soft"
        />
      </div>

      <div className="mt-[52px] flex flex-wrap items-baseline gap-7 border-t border-report-surface-rule pt-[22px] text-[10px] font-medium text-report-caption">
        <span>
          <b className="text-white">{meta.sourceCount}</b> SOURCES
        </span>
        <span>
          <b className="text-report-sky-soft">●</b> SOURCED
        </span>
        <span>
          <b className="text-report-warn-accent">◐</b> ESTIMATED
        </span>
        <span>
          <b className="text-report-grey-soft">○</b> INFERRED
        </span>
        {meta.keyQuestion && (
          <span className="ml-auto uppercase">YOUR QUESTION: “{meta.keyQuestion}”</span>
        )}
      </div>
    </section>
  );
};

export default Cover;
