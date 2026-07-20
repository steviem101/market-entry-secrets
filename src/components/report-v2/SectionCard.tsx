import type React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  /** Caps section TITLE, e.g. "SERVICE PROVIDERS". The "NN · " ordinal is
   *  prepended by a CSS counter (see index.css), not baked into this string,
   *  so suppressed sections don't leave gaps in the numbering (DECISIONS #9). */
  label: string;
  id?: string;
  className?: string;
  /** Override label colour, e.g. the close section's muted label. */
  labelClassName?: string;
  /** Numbered sections advance the ordinal counter and show it before the
   *  label. Set false for unnumbered surfaces (e.g. the Sources band). */
  numbered?: boolean;
  children?: React.ReactNode;
}

/**
 * report_v2 section card: white surface, 14px radius, 3px sky top accent,
 * 64/80 padding, caps section label (reference/*.dc.html §01–§14). Per build
 * decision 6, report_v2 uses the app's default sans everywhere — no font-mono.
 */
const SectionCard = ({ label, id, className, labelClassName, numbered = true, children }: SectionCardProps) => (
  <section
    id={id}
    data-report-v2-section
    data-numbered={numbered ? "" : undefined}
    className={cn(
      "rounded-[14px] border-t-[3px] border-t-report-sky bg-white px-5 py-8 text-report-ink lg:px-12 lg:py-10",
      className
    )}
  >
    <p className={cn("report-section-label text-[11px] font-bold uppercase tracking-[0.14em] text-report-action", labelClassName)}>
      {label}
    </p>
    {children}
  </section>
);

export default SectionCard;
