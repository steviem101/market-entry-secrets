import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { sampleReportPath } from "@/config/reportCta";
import { trackFunnelEvent } from "@/lib/analytics/intakeFunnel";

/**
 * "See a real report" trust link (MES-188 charter §5b, design rec #3 — the
 * strongest trust asset MES owns). Renders only when a sample share token is
 * pinned in reportCta config, so it's invisible until an owner deliberately
 * chooses a public sample. Opens the shared report in a new tab so the
 * visitor keeps their place in the funnel.
 */
export const SampleReportLink = ({ className = "" }: { className?: string }) => {
  const path = sampleReportPath();
  if (!path) return null;

  return (
    <Link
      to={path}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackFunnelEvent("hero_cta_clicked", {
          source: "homepage_hero",
          metadata: { cta: "sample_report" },
        })
      }
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline ${className}`}
    >
      <FileText className="h-4 w-4" />
      See a real report
    </Link>
  );
};
