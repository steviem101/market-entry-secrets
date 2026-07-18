import type { Chip } from "@/types/report";
import { cn } from "@/lib/utils";

interface EvidenceChipProps {
  chip: Chip;
  className?: string;
}

/**
 * Evidence-confidence chip (DECISIONS #7): ● sourced renders as an inline
 * green glyph; ◐ est ALWAYS renders as the full-size amber EST pill next to
 * its number — never a bare glyph; ○ inferred renders as the grey pill.
 */
const EvidenceChip = ({ chip, className }: EvidenceChipProps) => {
  if (chip === "sourced") {
    return (
      <span aria-label="sourced" className={cn("font-mono text-[8.5px] font-bold text-report-good", className)}>
        ●
      </span>
    );
  }
  if (chip === "est") {
    return (
      <span
        aria-label="estimated"
        className={cn(
          "rounded [vertical-align:1px] bg-report-warn-tint px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-report-warn",
          className
        )}
      >
        ◐ EST
      </span>
    );
  }
  return (
    <span
      aria-label="inferred"
      className={cn(
        "rounded [vertical-align:1px] bg-report-inferred-bg px-1.5 py-0.5 font-mono text-[8.5px] font-semibold text-report-inferred-text",
        className
      )}
    >
      ○ INFERRED
    </span>
  );
};

export default EvidenceChip;
