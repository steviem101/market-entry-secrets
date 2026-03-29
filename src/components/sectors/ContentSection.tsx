
import { ContentCard } from "@/components/content/ContentCard";
import { ListingPageGate } from "@/components/ListingPageGate";
import SectorSection from "./SectorSection";

interface ContentSectionProps {
  contentItems: any[];
}

const ContentSection = ({ contentItems }: ContentSectionProps) => {
  if (contentItems.length === 0) return null;

  return (
    <ListingPageGate contentType="content">
      <SectorSection
        title="Industry Insights & Analysis"
        viewAllLink="/content"
        viewAllText="View All Content"
        isEmpty={false}
      >
        {contentItems.slice(0, 6).map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </SectorSection>
    </ListingPageGate>
  );
};

export default ContentSection;
