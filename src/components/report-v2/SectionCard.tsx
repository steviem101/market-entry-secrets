import type React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  /** Caps section label, e.g. "05 · SERVICE PROVIDERS" (DECISIONS #9). */
  label: string;
  id?: string;
  className?: string;
  /** Override label colour, e.g. the close section's muted label. */
  labelClassName?: string;
  children?: React.ReactNode;
}

/**
 * report_v2 section card: white surface, 14px radius, 3px sky top accent,
 * 64/80 padding, caps section label (reference/*.dc.html §01–§14). Per build
 * decision 6, report_v2 uses the app's default sans everywhere — no font-mono.
 */
const SectionCard = ({ label, id, className, labelClassName, children }: SectionCardProps) => (
  <section
    id={id}
    className={cn(
      "rounded-[14px] border-t-[3px] border-t-report-sky bg-white px-20 py-16 text-report-ink",
      className
    )}
  >
    <p className={cn("text-[11px] font-bold uppercase tracking-[0.14em] text-report-action", labelClassName)}>
      {label}
    </p>
    {children}
  </section>
);

export default SectionCard;
