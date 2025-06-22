
import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  showHeader?: boolean;
  showCards?: boolean;
  cardCount?: number;
}

export const PageSkeleton = ({ 
  showHeader = true, 
  showCards = true, 
  cardCount = 6 
}: PageSkeletonProps) => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {showHeader && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 max-w-md" />
          <Skeleton className="h-6 w-full max-w-2xl" />
          <Skeleton className="h-6 w-2/3 max-w-xl" />
        </div>
      )}
      
      {showCards && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: cardCount }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
