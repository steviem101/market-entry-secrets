import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Plus, Calendar, ArrowRight } from 'lucide-react';
import { useMyReports } from '@/hooks/useReport';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const tierColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  growth: 'bg-primary/10 text-primary',
  scale: 'bg-accent/10 text-accent',
  enterprise: 'bg-destructive/10 text-destructive',
};

const MyReports = () => {
  const { user } = useAuth();
  const { data: reports, isLoading } = useMyReports();

  return (
    <>
      <Helmet>
        <title>My Reports | Market Entry Secrets</title>
      </Helmet>

      <Navigation />

      <main className="min-h-screen bg-gradient-to-b from-muted/30 to-background pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Reports</h1>
              <p className="text-muted-foreground mt-1">Your generated market entry reports</p>
            </div>
            <Link to="/report-creator">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Report
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : !reports || reports.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No reports yet</h2>
                <p className="text-muted-foreground mb-6">Create your first AI-powered market entry report</p>
                <Link to="/report-creator">
                  <Button size="lg" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.map((report: any) => (
                <Link key={report.id} to={`/report/${report.id}`}>
                  <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {report.user_intake_forms?.company_name || 'Market Entry Report'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(report.created_at), 'MMM d, yyyy')}
                            </span>
                            <Badge variant="outline" className={`text-xs ${tierColors[report.tier_at_generation] || ''}`}>
                              {report.tier_at_generation}
                            </Badge>
                            <Badge variant={report.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default MyReports;
