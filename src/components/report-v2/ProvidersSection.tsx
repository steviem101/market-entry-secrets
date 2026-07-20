import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import { MatchGrid, RankedRows } from "./TwoTier";
import Rich from "./Rich";
import CoverageNote from "./CoverageNote";

/**
 * §05 service providers — the two-tier pattern (DECISIONS #3): ranked
 * "our read" top-3 with why-lines, then the REMAINING matched providers
 * below (the ranked set is filtered out of the grid so it isn't repeated;
 * `providers.all` itself stays the full set).
 */
const entityKey = (x: { url?: string; name?: string }) => (x.url || x.name || "").trim().toLowerCase();

const ProvidersSection = ({ report }: { report: Report }) => {
  const { providers } = report;
  // The ranked "our read" top-N is a subset of `providers.all` (adapter builds
  // both from the same provider cards). Rendering `all` verbatim below repeats
  // those same rows as the first grid cards — redundant content that pads the
  // section. Show only the providers NOT already ranked above; the data
  // contract (`all` = full set) stays intact, this is a presentation choice.
  const rankedKeys = new Set(providers.ourRead.map(entityKey).filter(Boolean));
  const gridCards = rankedKeys.size
    ? providers.all.filter((c) => !rankedKeys.has(entityKey(c)))
    : providers.all;
  const gridHeader = rankedKeys.size
    ? "MORE MATCHED PROVIDERS — EXPLORE FREELY"
    : "ALL MATCHED PROVIDERS — EXPLORE FREELY";
  return (
    <SectionCard label="05 · SERVICE PROVIDERS" className="pb-10">
      <Rich
        text={providers.intro}
        className="mb-6 mt-4 max-w-[920px] text-[14.5px] leading-[1.7] text-report-ink-soft"
      />
      <CoverageNote text={providers.coverageNote} />
      <RankedRows items={providers.ourRead} section="Provider" />
      {gridCards.length > 0 && (
        <MatchGrid header={gridHeader} cards={gridCards} section="Provider" columns={3} />
      )}
    </SectionCard>
  );
};

export default ProvidersSection;
