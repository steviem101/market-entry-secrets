import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import StarToggle from "./StarToggle";
import Rich from "./Rich";

/**
 * §12 case studies & guides: card grid where every card carries a
 * "Relevant because:" footer tying the guide to this report's content.
 * Non-negotiable section (README) — always rendered when guides exist.
 */
const GuidesSection = ({ report }: { report: Report }) => {
  const { guides } = report;
  return (
    <SectionCard label="12 · CASE STUDIES & RESOURCES" className="pb-[60px]">
      <Rich
        text={guides.intro}
        className="mb-7 mt-4 max-w-[920px] text-[13.5px] leading-[1.7] text-report-ink-soft"
      />
      <div className="grid grid-cols-3 gap-[22px]">
        {guides.cards.map((guide, i) => (
          <div
            key={guide.url || guide.title || i}
            className="flex flex-col gap-3 rounded-xl border border-report-border px-8 py-[30px]"
          >
            <div className="text-[15px] font-bold leading-[1.4]">
              {guide.url ? (
                <a href={guide.url} target="_blank" rel="noopener" className="text-inherit hover:underline">
                  {guide.title} ↗
                </a>
              ) : (
                guide.title
              )}
              <StarToggle name={guide.title} url={guide.url} section="Guide" />
            </div>
            <div className="text-[12.5px] leading-[1.7] text-report-ink-soft">{guide.summary}</div>
            {guide.relevantBecause && (
              <div className="border-t border-report-rule pt-3 text-[11.5px] leading-[1.65] text-report-action">
                <b>Relevant because:</b> {guide.relevantBecause}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

export default GuidesSection;
