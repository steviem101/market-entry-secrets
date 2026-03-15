import { ContentCard } from "./ContentCard";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";

interface FeaturedContentProps {
  featuredContent: any[];
  selectedCategory: string | null;
  attachmentCounts?: Record<string, number>;
}

export const FeaturedContent = ({
  featuredContent,
  selectedCategory,
  attachmentCounts = {}
}: FeaturedContentProps) => {
  const { user, loading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();

  if (featuredContent.length === 0 || selectedCategory !== null) {
    return null;
  }

  // Hide featured section when paywall is active (ContentGrid shows it)
  if (!loading && hasReachedLimit && !user) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Featured Content</h2>
      <div className={`grid gap-8 ${featuredContent.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {featuredContent.slice(0, 2).map((content) => (
          <ContentCard key={content.id} content={content} featured attachmentCount={attachmentCounts[content.id] || 0} />
        ))}
      </div>
    </section>
  );
};
