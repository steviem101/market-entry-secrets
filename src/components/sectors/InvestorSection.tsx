import InvestorCard from "@/components/investors/InvestorCard";
import { ListingPageGate } from "@/components/ListingPageGate";
import SectorSection from "./SectorSection";

interface InvestorSectionProps {
  investors: any[];
}

const InvestorSection = ({ investors }: InvestorSectionProps) => {
  if (investors.length === 0) return null;

  return (
    <ListingPageGate contentType="investor">
      <SectorSection
        title="Investors"
        viewAllLink="/investors"
        viewAllText="View All Investors"
        isEmpty={false}
      >
        {investors.slice(0, 6).map((investor) => (
          <InvestorCard key={investor.id} investor={investor} />
        ))}
      </SectorSection>
    </ListingPageGate>
  );
};

export default InvestorSection;
