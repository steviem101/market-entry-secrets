import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  FileText,
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Handshake,
  Target,
  Activity,
  Plus,
  Mail,
  Globe,
  Shield,
  UserCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileDialog } from "@/components/auth/ProfileDialog";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useMyReports } from "@/hooks/useReport";
import { getInitials, getDisplayName } from "@/lib/profileUtils";
import { format } from "date-fns";

const MemberHub = () => {
  const { user, profile, isAdmin, isModerator } = useAuth();
  const { bookmarks, loading: bookmarksLoading, fetchBookmarks } = useBookmarks();
  const { data: reports, isLoading: reportsLoading } = useMyReports();
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const completedReports = reports?.filter((r: any) => r.status === 'completed') || [];
  const reportsCount = reports?.length || 0;

  // Extract mentor recommendations from completed reports
  const mentorConnections = completedReports.reduce((acc: any[], report: any) => {
    const mentors = report.report_json?.matches?.mentor_recommendations;
    if (Array.isArray(mentors)) {
      mentors.forEach((mentor: any) => {
        if (!acc.find((m) => m.name === mentor.name)) {
          acc.push({ ...mentor, reportId: report.id, reportName: report.user_intake_forms?.company_name });
        }
      });
    }
    return acc;
  }, []);

  const hubSections = [
    {
      title: "Your Bookmarks",
      description: "Saved events, community members, and content",
      icon: Heart,
      count: bookmarks.length,
      loading: bookmarksLoading,
      href: "/bookmarks",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: "Market Entry Reports",
      description: "Your AI-powered market entry reports",
      icon: BarChart3,
      count: reportsCount,
      loading: reportsLoading,
      href: "/my-reports",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Mentor Connections",
      description: "Introduction status and mentor relationships",
      icon: Handshake,
      count: mentorConnections.length,
      loading: reportsLoading,
      href: "/mentor-connections",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Lead Management",
      description: "Track and manage your market leads",
      icon: Target,
      count: 0,
      loading: false,
      href: "/leads",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "TAM Maps",
      description: "Total Addressable Market visualizations",
      icon: MapPin,
      count: 0,
      loading: false,
      href: "#",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      status: "Coming Soon",
    },
    {
      title: "Activity Feed",
      description: "Your recent platform interactions",
      icon: Activity,
      count: 0,
      loading: false,
      href: "#",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
      status: "Coming Soon",
    },
  ];

  const recentBookmarks = bookmarks.slice(0, 3);
  const recentReports = (reports || []).slice(0, 3);

  const tierColors: Record<string, string> = {
    free: "bg-muted text-muted-foreground",
    growth: "bg-primary/10 text-primary",
    scale: "bg-accent/10 text-accent",
    enterprise: "bg-destructive/10 text-destructive",
  };

  return (
    <ProtectedRoute fallbackMessage="Please sign in to access your Member Hub.">
      <>
        <div className="container mx-auto px-4 py-8">
          {/* Header with Profile Summary */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-lg">{getInitials(profile)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-foreground truncate">
                        Welcome back, {getDisplayName(profile, user)}!
                      </h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isAdmin() && (
                        <Badge variant="destructive">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {isModerator() && !isAdmin() && (
                        <Badge variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          Moderator
                        </Badge>
                      )}
                      {profile?.location && (
                        <Badge variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          {profile.location}
                        </Badge>
                      )}
                      {profile?.website && (
                        <Badge variant="outline">
                          <Globe className="w-3 h-3 mr-1" />
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Website
                          </a>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setShowProfile(true)}>
                      <UserCircle className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button size="sm" asChild>
                      <Link to="/report-creator">
                        <Plus className="w-4 h-4 mr-2" />
                        New Report
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hub Sections Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {hubSections.map((section) => {
              const Icon = section.icon;
              const isComingSoon = section.status === "Coming Soon";

              const cardContent = (
                <Card
                  key={section.title}
                  className={`hover:shadow-lg transition-all duration-300 ${
                    isComingSoon ? "opacity-60 cursor-default" : "hover:scale-[1.02] cursor-pointer"
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
                        {section.loading ? (
                          <div className="h-8 w-8 rounded bg-muted animate-pulse" />
                        ) : (
                          <span className="text-2xl font-bold text-foreground">{section.count}</span>
                        )}
                        <span className="text-sm text-muted-foreground">items</span>
                      </div>
                      {!isComingSoon && (
                        <span className="text-sm text-primary flex items-center gap-1">
                          View All
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );

              if (isComingSoon) return <div key={section.title}>{cardContent}</div>;

              return (
                <Link key={section.title} to={section.href} className="block">
                  {cardContent}
                </Link>
              );
            })}
          </div>

          {/* Recent Reports Section */}
          {recentReports.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Recent Reports</h2>
                <Button variant="outline" asChild>
                  <Link to="/my-reports">
                    View All Reports
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentReports.map((report: any) => (
                  <Link key={report.id} to={`/report/${report.id}`} className="block group">
                    <Card className="hover:shadow-md transition-all group-hover:scale-[1.01]">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <Badge
                            variant="outline"
                            className={`text-xs ${tierColors[report.tier_at_generation] || ""}`}
                          >
                            {report.tier_at_generation}
                          </Badge>
                          <Badge
                            variant={report.status === "completed" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                          {report.user_intake_forms?.company_name || "Market Entry Report"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(report.created_at), "MMM d, yyyy")}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Create Report CTA when no reports */}
          {!reportsLoading && recentReports.length === 0 && (
            <Card className="mb-8 border-dashed">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Create Your First Market Entry Report</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Get AI-powered market analysis, mentor recommendations, and an actionable entry plan tailored to your business.
                </p>
                <Button size="lg" asChild>
                  <Link to="/report-creator">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Report
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

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
                        {bookmark.content_type === "event" && <Calendar className="w-4 h-4" />}
                        {bookmark.content_type === "community_member" && <Users className="w-4 h-4" />}
                        {bookmark.content_type === "content" && <FileText className="w-4 h-4" />}
                        <Badge variant="outline" className="text-xs">
                          {bookmark.content_type.replace("_", " ")}
                        </Badge>
                      </div>
                      <CardTitle className="text-base line-clamp-2">{bookmark.content_title}</CardTitle>
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
                <Link to="/report-creator">Create Market Entry Report</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/service-providers">Find Service Providers</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/events">Browse Events</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/mentors">Explore Mentors</Link>
              </Button>
            </div>
          </div>
        </div>

        <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />
      </>
    </ProtectedRoute>
  );
};

export default MemberHub;
