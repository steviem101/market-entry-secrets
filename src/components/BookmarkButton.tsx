
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  contentType: 'event' | 'community_member' | 'content' | 'lead' | 'service_provider';
  contentId: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  size?: "sm" | "default" | "lg";
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export const BookmarkButton = ({
  contentType,
  contentId,
  title,
  description,
  metadata,
  size = "sm",
  variant = "ghost",
  className
}: BookmarkButtonProps) => {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const bookmarked = isBookmarked(contentType, contentId);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (bookmarked) {
      await removeBookmark(contentType, contentId);
    } else {
      await addBookmark(contentType, contentId, title, description, metadata);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBookmark}
      className={cn(
        "transition-colors",
        bookmarked && "text-red-500 hover:text-red-600",
        className
      )}
    >
      <Heart 
        className={cn(
          "w-4 h-4",
          bookmarked && "fill-current"
        )} 
      />
    </Button>
  );
};
