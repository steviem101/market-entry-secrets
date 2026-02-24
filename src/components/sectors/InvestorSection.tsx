import InvestorCard from "@/components/investors/InvestorCard";
import { useAuth } from "@/hooks/useAuth";
import SectorSection from "./SectorSection";

interface InvestorSectionProps {
  investors: any[];
}

const InvestorSection = ({ investors }: InvestorSectionProps) => {
  const { user } = useAuth();

  if (investors.length === 0) return null;

  const displayedEntities = user ? investors.slice(0, 6) : investors.slice(0, 3);

  return (
    <SectorSection
      title="Investors"
      viewAllLink="/investors"
      viewAllText="View All Investors"
      isEmpty={false}
    >
      {displayedEntities.map((investor) => (
        <InvestorCard key={investor.id} investor={investor} />
      ))}
    </SectorSection>
  );
};

export default InvestorSection;
