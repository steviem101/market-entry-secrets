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

  const rawJson = (report.report_json ?? {}) as Record<string, unknown>;
  const companyName =
    (typeof rawJson.company_name === "string" && rawJson.company_name) ||
    report.user_intake_forms?.company_name ||
    "Market Entry Report";

  // Sections are usually nested (report_json.sections.{key}), but older/flat
  // reports store them at the root. Support both, and detect the empty/failed
  // case (a `failed` report, or one where get_report_admin returned null → {})
  // so the viewer surfaces the reason instead of a blank shell.
  const nestedRaw = rawJson.sections;
  const nested =
    nestedRaw && typeof nestedRaw === "object"
      ? (nestedRaw as Record<string, ReportSection>)
      : null;
  const flat: Record<string, ReportSection> = {};
  if (!nested) {
    for (const [key, value] of Object.entries(rawJson)) {
      if (value && typeof value === "object" && ("content" in value || "title" in value)) {
        flat[key] = value as ReportSection;
      }
    }
  }
  const rawSections = nested ?? flat;
  const hasContent = Object.keys(rawSections).length > 0;
  const reportError = typeof rawJson.error === "string" ? rawJson.error : null;

  // The v2 renderer expects the nested pipeline shape; only use it when nested
  // sections exist (adaptPipelineReport tolerates missing data by emptying it,
  // so a flat/empty report would otherwise render a blank shell).
  let reportV2: ReportV2Contract | null = null;
  if (nested && Object.keys(nested).length > 0) {
    try {
      const { report: adapted } = adaptPipelineReport(
        report.report_json as PipelineReportJson,
        { date: report.created_at, tier: report.tier_at_generation }
      );
      reportV2 = adapted;
    } catch {
      reportV2 = null;
    }
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
        // storageKey (not reportId) → star/request interactions are local scratch
        // only. The admin reviews a report they don't own, and report_interactions
        // INSERTs are owner-scoped by RLS, so wiring reportId here would surface
        // controls that silently fail and load the OWNER's shortlist as the admin's.
        <ReportV2Renderer report={reportV2} storageKey={`admin-${report.id}`} />
      ) : hasContent ? (
        // Flat/legacy shape the v2 renderer can't take — dump raw sections.
        <main className="min-h-screen py-8 px-4">
          <div className="container mx-auto max-w-4xl space-y-8">
            <p className="text-sm text-muted-foreground">
              Showing raw section content (this report isn't in the standard renderer shape).
            </p>
            {Object.entries(rawSections).map(([key, section]) => (
              <section key={key} className="space-y-2">
                <h2 className="text-xl font-bold text-foreground">{section?.title || key}</h2>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {section?.content || "(no content)"}
                </p>
              </section>
            ))}
          </div>
        </main>
      ) : (
        // No sections at all — a failed/empty report. Surface the reason so the
        // reviewer isn't staring at a blank shell.
        <main className="min-h-screen py-8 px-4">
          <div className="container mx-auto max-w-2xl text-center py-16 space-y-3">
            <h2 className="text-xl font-bold text-foreground">No report content</h2>
            <p className="text-muted-foreground">
              This {report.status} report has no generated sections
              {report.status === "processing" ? " yet" : ""}.
            </p>
            {reportError && (
              <p className="text-sm text-destructive whitespace-pre-wrap">{reportError}</p>
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
