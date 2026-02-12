import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Calendar, ArrowRight, ArrowLeft, BarChart3 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useMyReports } from '@/hooks/useReport';
import { format } from 'date-fns';

const tierColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  growth: 'bg-primary/10 text-primary',
  scale: 'bg-accent/10 text-accent',
  enterprise: 'bg-destructive/10 text-destructive',
};

const MyReports = () => {
  const { data: reports, isLoading } = useMyReports();

  return (
    <ProtectedRoute fallbackMessage="Please sign in to view your reports.">
      <>
        <Helmet>
          <title>My Reports | Market Entry Secrets</title>
        </Helmet>

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/member-hub">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Member Hub
              </Link>
            </Button>
          </div>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Your Reports</h1>
            </div>
            <p className="text-muted-foreground">
              {isLoading
                ? 'Loading...'
                : `${reports?.length || 0} market entry report${(reports?.length || 0) !== 1 ? 's' : ''}`}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4 max-w-3xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : !reports || reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first AI-powered market entry report to see it here.
              </p>
              <Button size="lg" asChild>
                <Link to="/report-creator">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Report
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl mx-auto">
              {reports.map((report: any) => (
                <Link key={report.id} to={`/report/${report.id}`} className="block group">
                  <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all group-hover:scale-[1.01]">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {report.user_intake_forms?.company_name || 'Market Entry Report'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(report.created_at), 'MMM d, yyyy')}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${tierColors[report.tier_at_generation] || ''}`}
                            >
                              {report.tier_at_generation}
                            </Badge>
                            <Badge
                              variant={report.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}

              <div className="text-center pt-6">
                <Button asChild>
                  <Link to="/report-creator">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Report
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </>
    </ProtectedRoute>
  );
};

export default MyReports;
