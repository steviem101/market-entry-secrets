import { ContentCard } from "./ContentCard";
import { ListingPageGate } from "@/components/ListingPageGate";

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
  if (featuredContent.length === 0 || selectedCategory !== null) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Featured Content</h2>
      <ListingPageGate contentType="content">
        <div className={`grid gap-8 ${featuredContent.length === 1 ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {featuredContent.slice(0, 2).map((content) => (
            <ContentCard key={content.id} content={content} featured attachmentCount={attachmentCounts[content.id] || 0} />
          ))}
        </div>
      </ListingPageGate>
    </section>
  );
};
