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
const ProvidersSection = ({ report }: { report: Report }) => {
  const { providers } = report;
  // The ranked "our read" IS the first `ourRead.length` of `providers.all` (the
  // adapter builds ourRead as all.slice(0,3)). Show the remainder below so the
  // grid never repeats the ranked rows — done positionally, not by a name/url
  // key, because two distinct providers can share a key (same name, both
  // link-less) and a key filter would then drop a real match (review finding).
  const gridCards = providers.all.slice(providers.ourRead.length);
  const gridHeader = providers.ourRead.length
    ? "MORE MATCHED PROVIDERS — EXPLORE FREELY"
    : "ALL MATCHED PROVIDERS — EXPLORE FREELY";
  return (
    <SectionCard label="SERVICE PROVIDERS" className="pb-10">
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
