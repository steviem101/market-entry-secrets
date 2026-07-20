import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import IdentitySlot from "./IdentitySlot";
import StarToggle from "./StarToggle";
import Rich from "./Rich";

const EntityName = ({ name, url, section }: { name: string; url: string; section: string }) => (
  <span>
    <IdentitySlot name={name} kind="company" />
    {url ? (
      <a href={url} target="_blank" rel="noopener" className="text-inherit">
        <b>{name} ↗</b>
      </a>
    ) : (
      <b>{name}</b>
    )}
    <StarToggle name={name} url={url} section={section} />
  </span>
);

/**
 * §06 government & trade support: free-to-engage government/trade bodies as
 * ruled rows across two columns (fills the width — the innovation hubs column
 * moved to its own §07, so each entity type reads as its own section;
 * DECISIONS #9).
 */
const GovHubsSection = ({ report }: { report: Report }) => {
  const { govAndHubs } = report;
  return (
    <SectionCard label="06 · GOVERNMENT & TRADE SUPPORT" className="pb-10">
      <h3 className="mb-3.5 mt-6 text-[16px] font-bold text-report-good">
        Government &amp; trade bodies — free to engage
      </h3>
      <div className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
        {govAndHubs.gov.map((g, i) => (
          <div
            key={i}
            className="grid grid-cols-[150px_1fr] items-baseline gap-3 border-t border-report-border py-3 text-[13.5px] leading-[1.65] text-report-ink-soft"
          >
            <EntityName name={g.name} url={g.url} section="Gov & Trade" />
            <span>{g.why}</span>
          </div>
        ))}
      </div>

      {govAndHubs.alsoNamed && (
        <Rich text={govAndHubs.alsoNamed} className="mt-4 text-[12px] leading-[1.6] text-report-caption" />
      )}
    </SectionCard>
  );
};

export default GovHubsSection;
