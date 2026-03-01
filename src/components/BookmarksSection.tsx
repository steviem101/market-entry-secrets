
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Calendar, Users, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBookmarks } from "@/hooks/useBookmarks";

// Example bookmarks to show when no real bookmarks exist
const exampleBookmarks = [
  {
    id: "example-1",
    content_type: "event" as const,
    content_id: "example-event-1",
    content_title: "Australian Market Entry Workshop",
    content_description: "Learn the essentials of entering the Australian market with expert guidance and networking opportunities.",
    content_metadata: {
      location: "Sydney, NSW",
      date: "2024-07-15",
      organizer: "Market Entry Solutions"
    },
    created_at: "2024-06-14T10:00:00Z"
  },
  {
    id: "example-2",
    content_type: "community_member" as const,
    content_id: "example-member-1",
    content_title: "Sarah Chen",
    content_description: "Experienced business consultant specializing in market entry strategies for international companies.",
    content_metadata: {
      title: "Senior Business Consultant",
      company: "Global Entry Partners",
      location: "Melbourne, VIC"
    },
    created_at: "2024-06-14T09:30:00Z"
  },
  {
    id: "example-3",
    content_type: "content" as const,
    content_id: "example-content-1",
    content_title: "Complete Guide to Australian Business Registration",
    content_description: "Step-by-step guide covering all aspects of registering your business in Australia, including legal requirements and best practices.",
    content_metadata: {
      url: "/content/business-registration-guide",
      author: "Legal Advisory Team"
    },
    created_at: "2024-06-14T08:15:00Z"
  }
];

export const BookmarksSection = () => {
  const { bookmarks, loading, fetchBookmarks } = useBookmarks();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'community_member':
        return <Users className="w-4 h-4" />;
      case 'content':
        return <FileText className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'event':
        return 'default';
      case 'community_member':
        return 'secondary';
      case 'content':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getContentUrl = (bookmark: any) => {
    switch (bookmark.content_type) {
      case 'event':
        return '/events';
      case 'community_member':
        return '/mentors';
      case 'content':
        return bookmark.content_metadata?.url || '/content';
      default:
        return '/';
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading bookmarks...</span>
          </div>
        </div>
      </section>
    );
  }

  // Use real bookmarks if they exist, otherwise show examples
  const displayBookmarks = bookmarks.length > 0 ? bookmarks : exampleBookmarks;
  const isShowingExamples = bookmarks.length === 0;

  if (displayBookmarks.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Your Loved Items</h2>
            </div>
            <p className="text-muted-foreground">Save your favorite events, community members, and content</p>
          </div>
          
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring and bookmark your favorite content to see it here.
            </p>
            <Button asChild>
              <Link to="/events">
                Explore Events
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-primary fill-current" />
            <h2 className="text-3xl font-bold text-foreground">Your Loved Items</h2>
          </div>
          <p className="text-muted-foreground">
            {isShowingExamples ? (
              "Example bookmarked items - start exploring to add your own!"
            ) : (
              `${displayBookmarks.length} saved item${displayBookmarks.length !== 1 ? 's' : ''}`
            )}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayBookmarks.slice(0, 6).map((bookmark) => (
            <Link 
              key={bookmark.id} 
              to={getContentUrl(bookmark)}
              className="block group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(bookmark.content_type)}
                      <Badge variant={getTypeBadgeVariant(bookmark.content_type)} className="text-xs">
                        {bookmark.content_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Heart className="w-4 h-4 text-red-500 fill-current flex-shrink-0" />
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {bookmark.content_title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {bookmark.content_description && (
                    <CardDescription className="line-clamp-3 mb-3">
                      {bookmark.content_description}
                    </CardDescription>
                  )}
                  
                  {bookmark.content_metadata && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {bookmark.content_metadata.location && (
                        <span className="truncate">{bookmark.content_metadata.location}</span>
                      )}
                      {bookmark.content_metadata.date && (
                        <span>{new Date(bookmark.content_metadata.date).toLocaleDateString()}</span>
                      )}
                      {bookmark.content_metadata.company && (
                        <span className="truncate">{bookmark.content_metadata.company}</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {displayBookmarks.length > 6 && (
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/bookmarks">
                View All Bookmarks
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
