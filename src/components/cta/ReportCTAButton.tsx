import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  REPORT_CREATOR_PATH,
  REPORT_CTA_LABEL,
  REPORT_CTA_MICROCOPY,
} from "@/config/reportCta";

interface ReportCTAButtonProps {
  /** Show the trust microcopy line under the button. */
  withMicrocopy?: boolean;
  className?: string;
}

/**
 * The one primary conversion button. Homepage sections render this instead
 * of hand-rolling their own Link+Button so the label, destination, and
 * microcopy stay identical everywhere.
 */
export const ReportCTAButton = ({ withMicrocopy = false, className = "" }: ReportCTAButtonProps) => {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <Link to={REPORT_CREATOR_PATH}>
        <Button size="lg" className="px-8 py-6 text-base rounded-xl group">
          {REPORT_CTA_LABEL}
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </Link>
      {withMicrocopy && (
        <p className="text-xs text-muted-foreground">{REPORT_CTA_MICROCOPY}</p>
      )}
    </div>
  );
};
