import { Star, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_company: string | null;
  reviewer_country: string | null;
  rating: number;
  title: string | null;
  review_text: string | null;
  is_verified: boolean;
  created_at: string;
}

interface ServiceProviderReviewsProps {
  reviews: Review[];
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-4 h-4 ${
          star <= rating
            ? "text-yellow-500 fill-yellow-500"
            : "text-gray-300"
        }`}
      />
    ))}
  </div>
);

export const ServiceProviderReviews = ({ reviews }: ServiceProviderReviewsProps) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No reviews yet</p>
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
          <StarRating rating={Math.round(avgRating)} />
        </div>
        <span className="text-sm text-muted-foreground">
          Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                {review.is_verified && (
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            {review.title && (
              <h4 className="font-medium mb-1">{review.title}</h4>
            )}
            {review.review_text && (
              <p className="text-sm text-muted-foreground mb-2">{review.review_text}</p>
            )}
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{review.reviewer_name}</span>
              {review.reviewer_company && <span> at {review.reviewer_company}</span>}
              {review.reviewer_country && <span> ({review.reviewer_country})</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
