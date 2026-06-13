// supabase/functions/_shared/email/templates/nurtureAiReport.ts
//
// Nurture drip (marketing, has unsubscribe). Variables: first_name, report_count.

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, paragraph, button, microcopy, escapeHtml, plainText } from "../components.ts";

const UNSUBSCRIBE_URL = `mailto:${theme.sender.support}?subject=Unsubscribe`;

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const nameHtml = escapeHtml(plainText(data.first_name ?? data.USER_NAME, "there"));
  const reportCount = plainText(data.report_count, "");

  const subject = "Your market entry plan, generated in minutes";

  const closing = reportCount
    ? paragraph(`Founders have already generated ${escapeHtml(reportCount)} reports. Yours takes minutes.`)
    : microcopy(["Tailored to your company", "Ready in minutes"]);

  const content =
    h1("Your market entry plan, in minutes") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      "Your AI market entry report pulls live market research, competitor analysis, regulatory notes, matched service providers, and an action plan into one tailored document, built around your company and target regions."
    ) +
    button("Create my report", `${theme.siteUrl}/report-creator`) +
    closing;

  const html = layout({
    preheader: "Live research, competitors, and an action plan in one report.",
    contentHtml: content,
    unsubscribeUrl: UNSUBSCRIBE_URL,
  });

  return { subject, html };
}
