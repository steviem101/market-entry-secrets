import { ContentCard } from "./ContentCard";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";

interface FeaturedContentProps {
  featuredContent: any[];
  selectedCategory: string | null;
}

export const FeaturedContent = ({
  featuredContent,
  selectedCategory
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {featuredContent.slice(0, 2).map((content) => (
          <ContentCard key={content.id} content={content} featured />
        ))}
      </div>
    </section>
  );
};
