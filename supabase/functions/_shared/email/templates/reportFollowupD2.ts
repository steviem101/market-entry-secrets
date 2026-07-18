// supabase/functions/_shared/email/templates/reportFollowupD2.ts
//
// Day-2 report follow-up (marketing, has unsubscribe) — conversion plan step 4.
// Sent by the report_followup sequence (process-email-queue) two days after a
// FREE-tier report completes, when its gated sections actually matched
// something. Leads with the member's own numbers (counts only — never names,
// that is what gating protects), then one CTA back to their report, where the
// gated sections carry the tier-priced unlock.
//
// Variables: first_name, company_name, report_url, locked_findings
// (Array<{ key, count }> — same shape as reportCompleted; parsed defensively).

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, paragraph, button, bulletList, microcopy, escapeHtml, plainText } from "../components.ts";
import { parseLockedFindings, lockedFindingLabel } from "./reportCompleted.ts";

const UNSUBSCRIBE_URL = `mailto:${theme.sender.support}?subject=Unsubscribe`;

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const nameHtml = escapeHtml(plainText(data.first_name ?? data.USER_NAME, "there"));
  const companyHtml = escapeHtml(plainText(data.company_name, "your company"));
  const reportUrl = plainText(data.report_url, `${theme.siteUrl}/my-reports`);
  const findings = parseLockedFindings(data.locked_findings);

  const subject = "Your report found more than you have unlocked";

  const content =
    h1("Your report kept working") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      `When we built ${companyHtml}'s market-entry report, the research matched real, named options in the sections your free tier keeps locked:`
    ) +
    (findings.length > 0
      ? bulletList(findings.map((f) => `<strong>${escapeHtml(lockedFindingLabel(f.key, f.count))}</strong>`))
      : paragraph("Your locked sections hold the mentor, customer and lead-list matches from your research.")) +
    paragraph(
      "Each one traces back to a real organisation or person in our directories — unlocking shows you exactly who they are and how to reach them."
    ) +
    button("Open your report", reportUrl) +
    microcopy(["One-time payment", "Instant unlock — no regeneration", "No subscription"]);

  const html = layout({
    preheader: "The matches behind your locked sections are real and waiting.",
    contentHtml: content,
    unsubscribeUrl: UNSUBSCRIBE_URL,
  });

  return { subject, html };
}
