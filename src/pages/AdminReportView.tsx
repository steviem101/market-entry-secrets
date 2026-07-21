import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAdminReport } from "@/hooks/useReport";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReportV2Renderer from "@/components/report-v2/ReportV2Renderer";
import { adaptPipelineReport, type PipelineReportJson } from "@/lib/report-v2/adapter";
import type { Report as ReportV2Contract } from "@/types/report";

type ReportSection = { title?: string; content?: string };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Admin quality-review viewer. Reads the FULL, ungated report_json via the
 * admin-only path (get_report_admin) — every section is present, so unlike the
 * customer ReportView there is no tier gating, paywall, or upgrade UI. We reuse
 * the redesigned v2 renderer for a faithful view; if the adapter can't handle a
 * report shape it falls back to a raw section dump so a reviewer is never blocked.
 */
const AdminReportViewInner = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { data: report, isLoading, error } = useAdminReport(reportId);

  if (isLoading) {
    return (
      <main className="min-h-screen pt-8 pb-16 px-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen pt-8 pb-16 px-4">
        <div className="container mx-auto text-center py-20">
          <h1 className="text-2xl font-bold text-foreground mb-2">Report Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This report doesn't exist, or the admin content function isn't deployed yet.
          </p>
          <Button asChild variant="outline">
            <Link to="/admin/reports">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to all reports
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const reportJson = report.report_json as PipelineReportJson & {
    company_name?: string;
  };
  const sections = (reportJson?.sections as Record<string, ReportSection>) || {};
  const companyName =
    reportJson?.company_name || report.user_intake_forms?.company_name || "Market Entry Report";

  let reportV2: ReportV2Contract | null = null;
  try {
    const { report: adapted } = adaptPipelineReport(reportJson, {
      date: report.created_at,
      tier: report.tier_at_generation,
    });
    reportV2 = adapted;
  } catch {
    reportV2 = null;
  }

  return (
    <>
      <Helmet>
        <title>Admin - {companyName} report | Market Entry Secrets</title>
      </Helmet>

      {/* Admin context strip — not part of the customer report */}
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Button asChild variant="ghost" size="sm" className="mr-1">
              <Link to="/admin/reports">
                <ArrowLeft className="w-4 h-4 mr-1" /> All reports
              </Link>
            </Button>
            <span className="font-semibold text-foreground">{companyName}</span>
            <Badge variant="secondary" className="capitalize">
              {report.tier_at_generation}
            </Badge>
            <Badge
              variant={report.status === "failed" ? "destructive" : "default"}
              className="capitalize"
            >
              {report.status}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Generated {formatDate(report.created_at)}
            {report.feedback_score != null && (
              <> · customer rating {report.feedback_score}/5</>
            )}
          </div>
        </div>
      </div>

      {reportV2 ? (
        <ReportV2Renderer report={reportV2} reportId={report.id} />
      ) : (
        // Fallback: raw section dump if the v2 adapter can't render this shape.
        <main className="min-h-screen py-8 px-4">
          <div className="container mx-auto max-w-4xl space-y-8">
            <p className="text-sm text-muted-foreground">
              Rich renderer unavailable for this report shape — showing raw section content.
            </p>
            {Object.entries(sections).map(([key, section]) => (
              <section key={key} className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">
                  {section?.title || key}
                </h2>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {section?.content || "(no content)"}
                </p>
              </section>
            ))}
            {Object.keys(sections).length === 0 && (
              <p className="text-muted-foreground">This report has no section content.</p>
            )}
          </div>
        </main>
      )}
    </>
  );
};

const AdminReportView = () => (
  <ProtectedRoute requireAdmin>
    <AdminReportViewInner />
  </ProtectedRoute>
);

export default AdminReportView;
