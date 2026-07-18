import type { Report } from "@/types/report";
import SectionCard from "./SectionCard";
import { MatchGrid, NumberedProse } from "./TwoTier";
import Rich from "./Rich";

/**
 * §08 investors: numbered approach order (framed as ONE possible order —
 * tone rule) + full match grid with stage tags; cheque sizes render only
 * when known (R12).
 */
const InvestorsSection = ({ report }: { report: Report }) => {
  const { investors } = report;
  return (
    <SectionCard label="08 · INVESTOR RECOMMENDATIONS" className="pb-[60px]">
      <Rich
        text={investors.intro}
        className="mb-6 mt-4 max-w-[920px] text-[13.5px] leading-[1.7] text-report-ink-soft"
      />
      <NumberedProse items={investors.approachOrder} />
      <MatchGrid
        header="ALL MATCHED INVESTORS, GRANTS & AWARDS"
        columns={4}
        cards={investors.all.map(({ stageTag, checkSize, ...card }) => ({
          ...card,
          tag: stageTag || card.tag,
          extraLine: checkSize ? `CHEQUES ${checkSize}` : undefined,
        }))}
      />
      {investors.alsoNamed && (
        <Rich text={investors.alsoNamed} className="mt-4 text-[11.5px] leading-[1.6] text-report-caption" />
      )}
    </SectionCard>
  );
};

export default InvestorsSection;
