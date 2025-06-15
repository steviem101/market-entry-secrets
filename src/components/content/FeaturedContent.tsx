
import { ContentCard } from "./ContentCard";

interface FeaturedContentProps {
  featuredContent: any[];
  selectedCategory: string | null;
}

export const FeaturedContent = ({ featuredContent, selectedCategory }: FeaturedContentProps) => {
  if (featuredContent.length === 0 || selectedCategory !== null) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Featured Success Stories</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {featuredContent.slice(0, 2).map((content) => (
          <ContentCard key={content.id} content={content} featured />
        ))}
      </div>
    </section>
  );
};
