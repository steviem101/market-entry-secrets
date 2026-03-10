interface CardGridSkeletonProps {
  count?: number;
  cardHeight?: string;
}

export const CardGridSkeleton = ({ count = 6, cardHeight = "h-64" }: CardGridSkeletonProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${cardHeight} bg-muted rounded-lg animate-pulse`} />
    ))}
  </div>
);
