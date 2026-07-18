import type React from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  /** Mono-caps section label, e.g. "05 · SERVICE PROVIDERS" (DECISIONS #9). */
  label: string;
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * report_v2 section card: white surface, 14px radius, 3px sky top accent,
 * 64/80 padding, mono section label (reference/*.dc.html §01–§14).
 */
const SectionCard = ({ label, id, className, children }: SectionCardProps) => (
  <section
    id={id}
    className={cn(
      "rounded-[14px] border-t-[3px] border-t-report-sky bg-white px-20 py-16 text-report-ink",
      className
    )}
  >
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-report-action">
      {label}
    </p>
    {children}
  </section>
);

export default SectionCard;
