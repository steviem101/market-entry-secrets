/**
 * Single source of truth for how a case-study outcome is presented (2026-07-14
 * filter bar consistency sweep). Both the directory list page and the detail
 * page render through this so a positive outcome (successful/scaling/ipo/
 * acquired) can never show as "Failure" on one surface and "Success" on
 * another. Tone → semantic-token classes live here; the outcome vocabulary
 * (labels, tone) lives in the pure caseStudyFilters module.
 */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { outcomeTone, OUTCOME_LABELS } from "@/lib/caseStudyFilters";

const TONE_CLASS: Record<string, string> = {
  positive: "border-mes-success/30 bg-mes-success/10 text-mes-success",
  negative: "border-destructive/30 bg-destructive/10 text-destructive",
};

export interface OutcomeBadgeProps {
  outcome: string | null | undefined;
  /** Append " Story" to the label (detail-page hero variant). */
  story?: boolean;
  className?: string;
}

/**
 * Renders the outcome badge, or nothing when the outcome has no tone (NULL /
 * unknown values get no badge — never a default "Failure").
 */
export const OutcomeBadge = ({ outcome, story = false, className }: OutcomeBadgeProps) => {
  const tone = outcomeTone(outcome);
  if (!tone) return null;
  const label = OUTCOME_LABELS[outcome as string];
  if (!label) return null;
  return (
    <Badge variant="outline" className={cn(TONE_CLASS[tone], className)}>
      {story ? `${label} Story` : label}
    </Badge>
  );
};
