
import { ContentCard } from "@/components/content/ContentCard";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import SectorSection from "./SectorSection";

interface ContentSectionProps {
  contentItems: any[];
}

const ContentSection = ({ contentItems }: ContentSectionProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();

  if (contentItems.length === 0) return null;

  if (!authLoading && hasReachedLimit && !user) {
    return <PaywallModal contentType="content" />;
  }

  return (
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
  );
};

export default ContentSection;
