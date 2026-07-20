import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import IdentitySlot from "./IdentitySlot";
import StarToggle from "./StarToggle";

/**
 * §07 innovation hubs & accelerators: the competitive-to-join ecosystem
 * entities, split out from §06 so each entity type reads as its own section.
 * Cards use flex-wrap-grow so 1 fills the row (a lone hub reads as a full
 * card, never a sparse third), 2 split it, 3+ lay out as thirds. Rendered
 * whenever ≥1 hub matched; a zero-hub report skips it like any empty section
 * (the section numbers are fixed, so suppressing on a higher threshold would
 * leave a visible 06→08 gap for the common low-hub case).
 */
const HubsSection = ({ report }: { report: Report }) => {
  const { govAndHubs } = report;
  if (govAndHubs.hubs.length === 0) return null;
  return (
    <SectionCard label="INNOVATION HUBS & ACCELERATORS" className="pb-10">
      <p className="mb-6 mt-4 max-w-[920px] text-[14.5px] leading-[1.7] text-report-ink-soft">
        Competitive to join, but a fast route into local networks, credibility and early customers.
      </p>
      <div className="flex flex-col gap-[22px] md:flex-row md:flex-wrap">
        {govAndHubs.hubs.map((hub, i) => (
          <div
            key={hub.url || hub.name || i}
            className="rounded-xl border border-report-border px-[30px] py-7 md:grow md:basis-[300px]"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0 grow break-words text-[15px] font-bold">
                <IdentitySlot name={hub.name} kind="company" src={hub.logoUrl} />
                {hub.url ? (
                  <a href={hub.url} target="_blank" rel="noopener" className="text-inherit hover:underline">
                    {hub.name} ↗
                  </a>
                ) : (
                  hub.name
                )}
                <StarToggle name={hub.name} url={hub.url} section="Accelerator" />
              </span>
              {hub.focusTag && (
                <span className="max-w-[40%] shrink-0 break-words text-right text-[9.5px] font-bold uppercase leading-[1.35] text-report-action">
                  {hub.focusTag}
                </span>
              )}
            </div>
            <div className="mt-1.5 break-words text-[13px] leading-[1.65] text-report-ink-soft">
              {hub.description}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
};

export default HubsSection;
