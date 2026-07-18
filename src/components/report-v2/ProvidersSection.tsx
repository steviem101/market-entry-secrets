import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import { MatchGrid, RankedRows } from "./TwoTier";
import Rich from "./Rich";

/**
 * §05 service providers — the two-tier pattern (DECISIONS #3): ranked
 * "our read" top-3 with why-lines, then the FULL match grid below.
 */
const ProvidersSection = ({ report }: { report: Report }) => {
  const { providers } = report;
  return (
    <SectionCard label="05 · SERVICE PROVIDERS" className="pb-[60px]">
      <Rich
        text={providers.intro}
        className="mb-6 mt-4 max-w-[920px] text-[13.5px] leading-[1.7] text-report-ink-soft"
      />
      <RankedRows items={providers.ourRead} />
      <MatchGrid header="ALL MATCHED PROVIDERS — EXPLORE FREELY" cards={providers.all} columns={3} />
    </SectionCard>
  );
};

export default ProvidersSection;
