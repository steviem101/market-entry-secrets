import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import { MatchGrid, NumberedProse } from "./TwoTier";
import Rich from "./Rich";
import CoverageNote from "./CoverageNote";

/**
 * §08 investors: numbered approach order (framed as ONE possible order —
 * tone rule) + full match grid with stage tags; cheque sizes render only
 * when known (R12).
 */
const InvestorsSection = ({ report }: { report: Report }) => {
  const { investors } = report;
  return (
    <SectionCard label="08 · INVESTOR RECOMMENDATIONS" className="pb-10">
      <Rich
        text={investors.intro}
        className="mb-6 mt-4 max-w-[920px] text-[14.5px] leading-[1.7] text-report-ink-soft"
      />
      <CoverageNote text={investors.coverageNote} />
      <NumberedProse items={investors.approachOrder} />
      <MatchGrid
        header="ALL MATCHED INVESTORS, GRANTS & AWARDS"
        section="Investor"
        columns={4}
        cards={investors.all.map(({ stageTag, checkSize, ...card }) => ({
          ...card,
          tag: stageTag || card.tag,
          extraLine: checkSize ? `CHEQUES ${checkSize}` : undefined,
        }))}
      />
      {investors.alsoNamed && (
        <Rich text={investors.alsoNamed} className="mt-4 text-[12px] leading-[1.6] text-report-caption" />
      )}
    </SectionCard>
  );
};

export default InvestorsSection;
