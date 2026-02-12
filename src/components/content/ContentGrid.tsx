
import { BookOpen } from "lucide-react";
import { ContentCard } from "./ContentCard";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";

interface ContentGridProps {
  filteredContent: any[];
  selectedCategory: string | null;
  categories: any[];
  totalContent: number;
  excludeFeatured?: boolean;
}

export const ContentGrid = ({
  filteredContent,
  selectedCategory,
  categories,
  totalContent,
  excludeFeatured = false
}: ContentGridProps) => {
  const { user, loading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();
  const categoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name || 'Content'
    : 'All Guides';

  if (filteredContent.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6">{categoryName}</h2>
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Content Found</h3>
          <p className="text-muted-foreground mb-6">
            {totalContent === 0
              ? "No content has been added to the database yet."
              : "No content found matching your criteria."
            }
          </p>
          {totalContent === 0 && (
            <p className="text-sm text-muted-foreground">
              Content items need to be added to the database to display here.
            </p>
          )}
        </div>
      </section>
    );
  }

  const displayContent = excludeFeatured
    ? filteredContent.filter(item => !item.featured)
    : filteredContent;

  if (!loading && hasReachedLimit && !user) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6">{categoryName}</h2>
        {/* Show blurred preview cards behind the paywall */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 blur-sm pointer-events-none select-none" aria-hidden="true">
            {displayContent.slice(0, 6).map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <PaywallModal contentType="content" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">{categoryName}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayContent.map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>
    </section>
  );
};
