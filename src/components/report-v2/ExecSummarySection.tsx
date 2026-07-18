import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import EvidenceChip from "./EvidenceChip";
import Rich from "./Rich";

/** "43.5%" renders the % at reduced size, matching the reference hero stat. */
const HeroValue = ({ value }: { value: string }) => {
  const m = value.match(/^(.*?)(%|[A-Za-z]+)$/);
  if (!m || !m[1]) return <>{value}</>;
  return (
    <>
      {m[1]}
      <span className="text-[30px]">{m[2]}</span>
    </>
  );
};

/**
 * §01 Executive summary: 2-col — narrative (16/15px, bold facts, inline
 * chips) + rail (dark hero-stat card, sequence-shape card with its
 * "suggested shape, not a prescription" caveat) — then the sky-tinted
 * "Your key question — answered" callout with linked highlight matches.
 * R2: the verbatim question appears ONLY in the callout label, never
 * re-quoted in body copy. Empty rail cards/callout omit cleanly.
 */
const ExecSummarySection = ({ report }: { report: Report }) => {
  const { exec, meta } = report;
  const showCallout = exec.keyQuestionAnswer.trim() !== "" || exec.highlights.length > 0;
  const showHero = exec.heroStat.value.trim() !== "";
  const showSequence = exec.sequence.rows.length > 0;
  return (
    <SectionCard label="01 · EXECUTIVE SUMMARY" className="pb-[60px]">
      <div className="mt-6 grid grid-cols-[1fr_320px] gap-16">
        <div>
          {exec.narrative.map((para, i) => (
            <Rich
              key={i}
              text={para}
              className={
                i === 0
                  ? "text-[16px] leading-[1.75] text-report-ink-soft [text-wrap:pretty]"
                  : "mt-4 text-[15px] leading-[1.75] text-report-ink-soft [text-wrap:pretty]"
              }
            />
          ))}

          {showCallout && (
            <div className="mt-7 rounded-xl border border-report-tint-border bg-report-tint px-[30px] py-6">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-report-action">
                YOUR KEY QUESTION — ANSWERED · “{meta.keyQuestion}”
              </p>
              {exec.keyQuestionAnswer.trim() !== "" && (
                <Rich text={exec.keyQuestionAnswer} className="text-[13.5px] leading-[1.75] text-report-ink-soft" />
              )}
              {exec.highlights.length > 0 && (
                <p className="mt-2 text-[13.5px] leading-[1.75] text-report-ink-soft">
                  Key highlights from your matches:{" "}
                  {exec.highlights.map((h, i) => (
                    <span key={i}>
                      {i > 0 && " · "}
                      <a
                        href={h.url}
                        target="_blank"
                        rel="noopener"
                        className="font-bold text-report-action hover:underline"
                      >
                        {h.name}
                      </a>
                      {h.why ? ` (${h.why})` : ""}
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[22px]">
          {showHero && (
            <div className="rounded-xl bg-report-surface px-8 py-[30px] text-white">
              <p className="text-[9.5px] font-bold tracking-[0.12em] text-report-sky-soft">
                {exec.heroStat.label}
              </p>
              <div className="mb-2 mt-3 text-[56px] font-extrabold leading-none tracking-[-0.02em]">
                <HeroValue value={exec.heroStat.value} />{" "}
                <EvidenceChip chip={exec.heroStat.chip} className="align-[24px]" />
              </div>
              <Rich text={exec.heroStat.caption} className="text-[12.5px] leading-[1.6] text-report-grey-soft" />
            </div>
          )}
          {showSequence && (
            <div className="rounded-xl border border-report-border px-[30px] py-[26px]">
              <p className="mb-3.5 text-[9.5px] font-bold tracking-[0.12em] text-report-action">
                {exec.sequence.label}
              </p>
              <div className="text-[12.5px] leading-[1.7] text-report-ink-soft">
                {exec.sequence.rows.map((row, i) => (
                  <div key={i} className="border-t border-report-border py-2 last:border-b">
                    <b>{row.period}</b> · <Rich as="span" text={row.text} />
                  </div>
                ))}
              </div>
              {exec.sequence.caveat && (
                <p className="mt-3 text-[10.5px] leading-[1.6] text-report-caption">{exec.sequence.caveat}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default ExecSummarySection;
