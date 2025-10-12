
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { 
  Heart, 
  FileText, 
  Users, 
  TrendingUp, 
  MapPin, 
  Calendar,
  ArrowRight,
  BarChart3,
  Handshake,
  Target,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";

const MemberHub = () => {
  const { user, profile } = useAuth();
  const { bookmarks, loading, fetchBookmarks } = useBookmarks();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile?.username || user?.email?.split('@')[0] || 'Member';
  };

  const hubSections = [
    {
      title: "Your Bookmarks",
      description: "Saved events, community members, and content",
      icon: Heart,
      count: bookmarks.length,
      href: "/bookmarks",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20"
    },
    {
      title: "Reports & Analytics",
      description: "Custom market reports and analysis",
      icon: BarChart3,
      count: 0,
      href: "#",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      status: "Coming Soon"
    },
    {
      title: "Mentor Connections",
      description: "Introduction status and mentor relationships",
      icon: Handshake,
      count: 0,
      href: "#",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      status: "Coming Soon"
    },
    {
      title: "Lead Management",
      description: "Track and manage your market leads",
      icon: Target,
      count: 0,
      href: "/leads",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "TAM Maps",
      description: "Total Addressable Market visualizations",
      icon: MapPin,
      count: 0,
      href: "#",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      status: "Coming Soon"
    },
    {
      title: "Activity Feed",
      description: "Your recent platform interactions",
      icon: Activity,
      count: 0,
      href: "#",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      status: "Coming Soon"
    }
  ];

  const recentBookmarks = bookmarks.slice(0, 3);

  return (
    <ProtectedRoute fallbackMessage="Please sign in to access your Member Hub.">
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                  Back to Home
                </Link>
              </Button>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Welcome back, {getDisplayName()}!
              </h1>
              <p className="text-muted-foreground text-lg">
                Your personalized Market Entry Secrets dashboard
              </p>
            </div>
          </div>

          {/* Hub Sections Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {hubSections.map((section) => {
              const Icon = section.icon;
              const isComingSoon = section.status === "Coming Soon";
              
              return (
                <Card 
                  key={section.title}
                  className={`hover:shadow-lg transition-all duration-300 ${
                    isComingSoon ? 'opacity-75' : 'hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${section.bgColor}`}>
                        <Icon className={`w-6 h-6 ${section.color}`} />
                      </div>
                      {section.status && (
                        <Badge variant="secondary" className="text-xs">
                          {section.status}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          {section.count}
                        </span>
                        <span className="text-sm text-muted-foreground">items</span>
                      </div>
                      {!isComingSoon && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={section.href}>
                            View All
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Bookmarks Section */}
          {recentBookmarks.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Recent Bookmarks</h2>
                <Button variant="outline" asChild>
                  <Link to="/bookmarks">
                    View All Bookmarks
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentBookmarks.map((bookmark) => (
                  <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        {bookmark.content_type === 'event' && <Calendar className="w-4 h-4" />}
                        {bookmark.content_type === 'community_member' && <Users className="w-4 h-4" />}
                        {bookmark.content_type === 'content' && <FileText className="w-4 h-4" />}
                        <Badge variant="outline" className="text-xs">
                          {bookmark.content_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <CardTitle className="text-base line-clamp-2">
                        {bookmark.content_title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      {bookmark.content_description && (
                        <CardDescription className="line-clamp-2 mb-3">
                          {bookmark.content_description}
                        </CardDescription>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Saved {new Date(bookmark.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button asChild>
                <Link to="/service-providers">
                  Find Service Providers
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/events">
                  Browse Events
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/community">
                  Explore Community
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </ProtectedRoute>
  );
};

export default MemberHub;
