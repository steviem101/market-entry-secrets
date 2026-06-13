// supabase/functions/_shared/email/templates/reportCompleted.ts
//
// Report ready (transactional, no unsubscribe). Sent by generate-report when a
// report finishes. Variables: first_name, company_name, report_url.

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, paragraph, button, escapeHtml, plainText } from "../components.ts";

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const nameHtml = escapeHtml(plainText(data.first_name ?? data.USER_NAME, "there"));
  const companyPlain = plainText(data.company_name, "your company");
  const companyHtml = escapeHtml(companyPlain);
  const reportUrl = plainText(data.report_url, `${theme.siteUrl}/my-reports`);

  const subject = `Your ${companyPlain} market entry report is ready`;

  const content =
    h1("Your market entry report is ready") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      `Your market entry report for ${companyHtml} is ready. Inside you will find the market landscape, competitor analysis, matched service providers, mentor recommendations, and a step by step action plan.`
    ) +
    button("View my report", reportUrl) +
    paragraph(
      "Your report stays in your dashboard, and upgrading unlocks any gated sections instantly."
    );

  const html = layout({
    preheader: `Your ${companyPlain} report is ready to view.`,
    contentHtml: content,
  });

  return { subject, html };
}
