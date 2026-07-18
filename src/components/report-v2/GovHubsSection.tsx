import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import CompanyMark from "./CompanyMark";
import Rich from "./Rich";

const EntityName = ({ name, url }: { name: string; url: string }) => (
  <span>
    <CompanyMark name={name} />
    {url ? (
      <a href={url} target="_blank" rel="noopener" className="text-inherit">
        <b>{name} ↗</b>
      </a>
    ) : (
      <b>{name}</b>
    )}
  </span>
);

/**
 * §06 gov & hubs: 2-col split — free-to-engage government/trade bodies as
 * ruled rows vs competitive hubs/accelerators as bordered rows with focus
 * tags (DECISIONS #9: separate from providers). Corridor bodies appear only
 * when the data includes them (foreign_entrant reports, per meta.origin —
 * the module gating lives in the data/adapter, not the renderer).
 */
const GovHubsSection = ({ report }: { report: Report }) => {
  const { govAndHubs } = report;
  return (
    <SectionCard label="06 · GOVERNMENT, TRADE SUPPORT & ACCELERATORS" className="pb-[60px]">
      <div className="mt-6 grid grid-cols-2 gap-16">
        <div>
          <h3 className="mb-3.5 text-[16px] font-bold text-report-good">
            Government &amp; trade bodies — free to engage
          </h3>
          <div className="text-[12.5px] leading-[1.65] text-report-ink-soft">
            {govAndHubs.gov.map((g, i) => (
              <div
                key={i}
                className="grid grid-cols-[190px_1fr] items-center gap-3 border-t border-report-border py-3 last:border-b"
              >
                <EntityName name={g.name} url={g.url} />
                <span>{g.why}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3.5 text-[16px] font-bold text-report-action">
            Innovation hubs &amp; accelerators — competitive
          </h3>
          <div className="flex flex-col gap-3">
            {govAndHubs.hubs.map((hub, i) => (
              <div
                key={i}
                className={`grid grid-cols-[1fr_auto] items-center gap-2.5 rounded-[10px] border px-5 py-4 ${
                  i === 0 ? "border-report-tint-border" : "border-report-border"
                }`}
              >
                <span className="text-[12.5px] leading-[1.6]">
                  <EntityName name={hub.name} url={hub.url} /> — {hub.description}
                </span>
                {hub.focusTag && (
                  <span className="text-right text-[9px] font-bold uppercase text-report-action">
                    {hub.focusTag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {govAndHubs.alsoNamed && (
        <Rich text={govAndHubs.alsoNamed} className="mt-4 text-[11.5px] leading-[1.6] text-report-caption" />
      )}
    </SectionCard>
  );
};

export default GovHubsSection;
