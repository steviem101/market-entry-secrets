import type React from "react";

/**
 * report_v2 page frame: full-bleed #f4f6f8 background, centred 1240px column,
 * 28px gap between section cards (reference/*.dc.html outer frame). The
 * report surface uses the fixed report palette and never theme-inverts.
 * `printFooter` renders as a running footer on every printed page (ticket 16).
 */
const ReportShell = ({
  children,
  printFooter,
}: {
  children: React.ReactNode;
  printFooter?: React.ReactNode;
}) => (
  <div data-report-v2 className="bg-report-bg px-4 pb-24 pt-12 font-sans text-report-ink lg:px-6">
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-7">{children}</div>
    {printFooter && (
      <div className="report-v2-print-footer hidden print:block">{printFooter}</div>
    )}
  </div>
);

export default ReportShell;
