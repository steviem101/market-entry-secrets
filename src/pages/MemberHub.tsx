
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useMarketEntryReports } from '@/hooks/useMarketEntryReports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookmarkButton } from '@/components/BookmarkButton';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Heart, 
  FileText, 
  Download, 
  Calendar,
  Building,
  MapPin,
  ExternalLink,
  Users,
  TrendingUp
} from 'lucide-react';

export const MemberHub = () => {
  const { user, profile } = useAuth();
  const { bookmarks, loading: bookmarksLoading, fetchBookmarks } = useBookmarks();
  const { reports, loading: reportsLoading, fetchReports, getReportTypeLabel, getStatusColor } = useMarketEntryReports();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchBookmarks();
      fetchReports();
    }
  }, [user, fetchBookmarks, fetchReports]);

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Please log in to access your member hub.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDisplayName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return profile.username || user.email;
  };

  const getInitials = () => {
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url} alt={getDisplayName()} />
            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile.first_name || 'Member'}!</h1>
            <p className="text-muted-foreground">Manage your market entry journey from your personal hub</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="loved-items" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Loved Items ({bookmarks.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reports ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loved Items</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookmarks.length}</div>
                <p className="text-xs text-muted-foreground">Resources you've bookmarked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">Custom reports created for you</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports.filter(r => r.status === 'completed' || r.status === 'delivered').length}
                </div>
                <p className="text-xs text-muted-foreground">Completed reports</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Loved Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Recent Loved Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookmarksLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : bookmarks.length === 0 ? (
                  <p className="text-muted-foreground">No loved items yet. Start exploring!</p>
                ) : (
                  <div className="space-y-3">
                    {bookmarks.slice(0, 3).map((bookmark) => (
                      <div key={bookmark.id} className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{bookmark.content_title}</h4>
                          <p className="text-xs text-muted-foreground capitalize">
                            {bookmark.content_type.replace('_', ' ')}
                          </p>
                        </div>
                        <BookmarkButton
                          contentType={bookmark.content_type as any}
                          contentId={bookmark.content_id}
                          title={bookmark.content_title}
                          description={bookmark.content_description}
                          size="sm"
                        />
                      </div>
                    ))}
                    {bookmarks.length > 3 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('loved-items')}
                        className="w-full"
                      >
                        View All ({bookmarks.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : reports.length === 0 ? (
                  <p className="text-muted-foreground">No reports yet. Our team will create custom reports for your market entry journey.</p>
                ) : (
                  <div className="space-y-3">
                    {reports.slice(0, 3).map((report) => (
                      <div key={report.id} className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{report.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={`text-xs ${getStatusColor(report.status)}`}>
                              {report.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {getReportTypeLabel(report.report_type)}
                            </span>
                          </div>
                        </div>
                        {report.file_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                    {reports.length > 3 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('reports')}
                        className="w-full"
                      >
                        View All ({reports.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Loved Items Tab */}
        <TabsContent value="loved-items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Your Loved Items
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                All the resources, companies, and content you've bookmarked for easy access.
              </p>
            </CardHeader>
            <CardContent>
              {bookmarksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading your loved items...</p>
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No loved items yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring our resources and bookmark items you want to revisit.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/service-providers">Browse Service Providers</a>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookmarks.map((bookmark) => (
                    <Card key={bookmark.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{bookmark.content_title}</h3>
                            <Badge variant="secondary" className="text-xs capitalize">
                              {bookmark.content_type.replace('_', ' ')}
                            </Badge>
                          </div>
                          {bookmark.content_description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {bookmark.content_description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Saved on {new Date(bookmark.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <BookmarkButton
                          contentType={bookmark.content_type as any}
                          contentId={bookmark.content_id}
                          title={bookmark.content_title}
                          description={bookmark.content_description}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Market Entry Reports
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Custom reports and analyses created by our expert team to support your market entry journey.
              </p>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Loading your reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reports yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Our team will create custom market entry reports based on your specific needs and goals.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/contact">Contact Our Team</a>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{report.title}</h3>
                            <Badge className={`text-xs ${getStatusColor(report.status)}`}>
                              {report.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {report.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {report.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {getReportTypeLabel(report.report_type)}
                            </span>
                            {report.created_by_team_member && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Created by {report.created_by_team_member}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.file_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url} alt={getDisplayName()} />
                  <AvatarFallback className="text-xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{getDisplayName()}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
                </div>
              </div>
              
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p>{user.email}</p>
                    {profile.location && (
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.location}
                      </p>
                    )}
                    {profile.website && (
                      <p className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {profile.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Account Details</h4>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Member since {new Date(profile.created_at).toLocaleDateString()}</p>
                    <p>Last updated {new Date(profile.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
