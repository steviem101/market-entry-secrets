import type { Report } from "@/types/report";
import { REPORT_V2_SECTIONS } from "./sectionRegistry";
import ReportShell from "./ReportShell";
import ReportNav from "./ReportNav";
import { ReportInteractionsProvider } from "./ReportInteractionsProvider";
import { formatReportDate } from "@/lib/report-v2/format";

interface ReportV2RendererProps {
  report: Report;
  /** Real report id → interactions persist to Supabase report_interactions. */
  reportId?: string;
  /** localStorage persistence key when there is no owned report row. */
  storageKey?: string;
}

/**
 * The assembled report_v2 surface: interactions provider + shell + the full
 * ordered section walk (sectionRegistry). Shared by ReportView (real reports,
 * Supabase-persisted interactions) and any fixture/preview caller
 * (localStorage-persisted via storageKey).
 */
const ReportV2Renderer = ({ report, reportId, storageKey }: ReportV2RendererProps) => (
  <ReportInteractionsProvider reportId={reportId} storageKey={storageKey}>
    <ReportNav />
    <ReportShell
      printFooter={`${report.meta.customer} · ${formatReportDate(report.meta.date, "short")} · marketentrysecrets.com`}
    >
      {REPORT_V2_SECTIONS.map(({ id, Component }) =>
        Component ? <Component key={id} report={report} /> : null
      )}
    </ReportShell>
  </ReportInteractionsProvider>
);

export default ReportV2Renderer;
