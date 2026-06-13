// supabase/functions/_shared/email/templates/nurtureUpgradePaid.ts
//
// Value-reinforcement nudge for paid users (marketing, has unsubscribe).
// NOTE: process-email-queue currently skips the upgrade step for paid users, so
// this may rarely fire; kept on-brand for completeness. Variables: first_name.

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, paragraph, button, escapeHtml, plainText } from "../components.ts";

const UNSUBSCRIBE_URL = `mailto:${theme.sender.support}?subject=Unsubscribe`;

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const nameHtml = escapeHtml(plainText(data.first_name ?? data.USER_NAME, "there"));

  const subject = "Getting the most from your Market Entry Secrets plan";

  const content =
    h1("Getting the most from your plan") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      "Thanks for backing your market entry with a paid plan. A few ways to get full value: generate a report for each target region, shortlist three providers and reach out this week, and save the mentors who match your sector."
    ) +
    button("Go to my dashboard", `${theme.siteUrl}/dashboard`);

  const html = layout({
    preheader: "Three quick ways to get full value from your plan.",
    contentHtml: content,
    unsubscribeUrl: UNSUBSCRIBE_URL,
  });

  return { subject, html };
}
