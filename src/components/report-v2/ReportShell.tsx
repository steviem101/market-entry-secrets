import type React from "react";

/**
 * report_v2 page frame: full-bleed #f4f6f8 background, centred 1240px column,
 * 28px gap between section cards (reference/*.dc.html outer frame). The
 * report surface uses the fixed report palette and never theme-inverts.
 */
const ReportShell = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-report-bg px-4 pb-24 pt-12 font-sans text-report-ink lg:px-6">
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-7">{children}</div>
  </div>
);

export default ReportShell;
