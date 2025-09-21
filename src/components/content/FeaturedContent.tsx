import { ContentCard } from "./ContentCard";
import { FreemiumGate } from "@/components/FreemiumGate";
interface FeaturedContentProps {
  featuredContent: any[];
  selectedCategory: string | null;
}
export const FeaturedContent = ({
  featuredContent,
  selectedCategory
}: FeaturedContentProps) => {
  if (featuredContent.length === 0 || selectedCategory !== null) {
    return null;
  }
  return <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Featured Content</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {featuredContent.slice(0, 2).map(content => <FreemiumGate key={content.id} contentType="content" itemId={content.id} contentTitle={content.title} contentDescription={content.subtitle || content.description}>
            <ContentCard content={content} featured />
          </FreemiumGate>)}
      </div>
    </section>;
};