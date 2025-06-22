
import { ContentCard } from "@/components/content/ContentCard";
import { FreemiumGate } from "@/components/FreemiumGate";
import SectorSection from "./SectorSection";

interface ContentSectionProps {
  contentItems: any[];
}

const ContentSection = ({ contentItems }: ContentSectionProps) => {
  if (contentItems.length === 0) return null;

  return (
    <SectorSection
      title="Industry Insights & Analysis"
      viewAllLink="/content"
      viewAllText="View All Content"
      isEmpty={false}
    >
      {contentItems.slice(0, 6).map((content) => (
        <FreemiumGate
          key={content.id}
          contentType="content"
          itemId={content.id}
          contentTitle={content.title}
          contentDescription={content.subtitle || content.description}
        >
          <ContentCard content={content} />
        </FreemiumGate>
      ))}
    </SectorSection>
  );
};

export default ContentSection;
