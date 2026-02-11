
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Calendar, Users, FileText, MapPin, Building, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useBookmarks } from "@/hooks/useBookmarks";

const Bookmarks = () => {
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
        return '/community';
      case 'content':
        return bookmark.content_metadata?.url || '/content';
      default:
        return '/';
    }
  };

  return (
    <>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-primary fill-current" />
            <h1 className="text-4xl font-bold text-foreground">Your Bookmarks</h1>
          </div>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${bookmarks.length} saved item${bookmarks.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading bookmarks...</span>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring and bookmark your favorite content to see it here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/events">Explore Events</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/community">Browse Community</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark) => (
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
                      <BookmarkButton
                        contentType={bookmark.content_type}
                        contentId={bookmark.content_id}
                        title={bookmark.content_title}
                        description={bookmark.content_description || undefined}
                        metadata={bookmark.content_metadata || undefined}
                        size="sm"
                        variant="ghost"
                      />
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
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{bookmark.content_metadata.location}</span>
                          </div>
                        )}
                        {bookmark.content_metadata.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(bookmark.content_metadata.date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {bookmark.content_metadata.company && (
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            <span className="truncate">{bookmark.content_metadata.company}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground mt-3">
                      Saved {new Date(bookmark.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      
    </>
  );
};

export default Bookmarks;
