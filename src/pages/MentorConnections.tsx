import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  Handshake,
  ExternalLink,
  Clock,
  CheckCircle2,
  Send,
  FileText,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useMyReports } from "@/hooks/useReport";

interface MentorMatch {
  name: string;
  subtitle?: string;
  tags?: string[];
  link?: string;
  linkLabel?: string;
  website?: string;
  source?: string;
  blurred?: boolean;
  reportId: string;
  reportName: string;
}

type ConnectionStatus = "pending" | "requested" | "connected";

const statusConfig: Record<ConnectionStatus, { label: string; icon: typeof Clock; variant: "secondary" | "default" | "outline"; color: string }> = {
  pending: {
    label: "Awaiting Introduction",
    icon: Clock,
    variant: "secondary",
    color: "text-amber-600",
  },
  requested: {
    label: "Introduction Requested",
    icon: Send,
    variant: "default",
    color: "text-blue-600",
  },
  connected: {
    label: "Connected",
    icon: CheckCircle2,
    variant: "outline",
    color: "text-green-600",
  },
};

const MentorConnections = () => {
  const { data: reports, isLoading } = useMyReports();

  // Extract unique mentor recommendations from all completed reports
  const mentors: MentorMatch[] = (reports || [])
    .filter((r: any) => r.status === "completed")
    .reduce((acc: MentorMatch[], report: any) => {
      const mentorMatches = report.report_json?.matches?.mentor_recommendations;
      if (Array.isArray(mentorMatches)) {
        mentorMatches.forEach((mentor: any) => {
          if (!acc.find((m) => m.name === mentor.name)) {
            acc.push({
              ...mentor,
              reportId: report.id,
              reportName: report.user_intake_forms?.company_name || "Market Entry Report",
            });
          }
        });
      }
      return acc;
    }, []);

  // Default status for all mentors is "pending" since we don't persist this yet
  const getStatus = (_mentor: MentorMatch): ConnectionStatus => "pending";

  return (
    <ProtectedRoute fallbackMessage="Please sign in to view your mentor connections.">
      <>
        <Helmet>
          <title>Mentor Connections | Market Entry Secrets</title>
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
              <Handshake className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Mentor Connections</h1>
            </div>
            <p className="text-muted-foreground">
              {isLoading
                ? "Loading..."
                : `${mentors.length} mentor${mentors.length !== 1 ? "s" : ""} matched from your reports`}
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
              Mentors are matched based on your market entry reports. We facilitate introductions
              and track connection status on your behalf.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No mentor matches yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create a market entry report to get AI-matched mentor recommendations
                tailored to your target market.
              </p>
              <Button size="lg" asChild>
                <Link to="/report-creator">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Report
                </Link>
              </Button>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              {/* Status overview */}
              <div className="grid gap-4 grid-cols-3 mb-8">
                {(["pending", "requested", "connected"] as ConnectionStatus[]).map((status) => {
                  const config = statusConfig[status];
                  const Icon = config.icon;
                  const count = mentors.filter((m) => getStatus(m) === status).length;
                  return (
                    <Card key={status}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${config.color}`} />
                        <div>
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-xs text-muted-foreground">{config.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Mentor cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mentors.map((mentor, idx) => {
                  const status = getStatus(mentor);
                  const config = statusConfig[status];
                  const StatusIcon = config.icon;

                  return (
                    <Card key={`${mentor.name}-${idx}`} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-1">{mentor.name}</CardTitle>
                            {mentor.subtitle && (
                              <CardDescription className="line-clamp-1 mt-1">
                                {mentor.subtitle}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant={config.variant} className="text-xs shrink-0 ml-2">
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {mentor.tags && mentor.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {mentor.tags.slice(0, 4).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="w-3 h-3" />
                          <span className="truncate">From: {mentor.reportName}</span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          {mentor.website && (
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <a
                                href={mentor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Website
                              </a>
                            </Button>
                          )}
                          {mentor.link && (
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <a
                                href={mentor.link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {mentor.linkLabel || "Profile"}
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs ml-auto"
                            asChild
                          >
                            <Link to={`/report/${mentor.reportId}`}>View Report</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </>
    </ProtectedRoute>
  );
};

export default MentorConnections;
