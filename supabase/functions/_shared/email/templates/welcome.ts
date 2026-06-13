// supabase/functions/_shared/email/templates/welcome.ts
//
// Welcome email (transactional, no unsubscribe). Sent on signup.
// Variables: first_name (or legacy USER_NAME).

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import {
  h1,
  paragraph,
  button,
  microcopy,
  escapeHtml,
  plainText,
} from "../components.ts";

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const namePlain = plainText(data.first_name ?? data.USER_NAME, "");
  const nameHtml = escapeHtml(namePlain || "there");

  const subject = namePlain
    ? `Welcome to Market Entry Secrets, ${namePlain}`
    : "Welcome to Market Entry Secrets";

  const content =
    h1("Welcome to Market Entry Secrets") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      "You now have the shortcut to entering the Australian and ANZ market: vetted service providers, mentors, live market intelligence, and AI generated entry reports, all in one place."
    ) +
    paragraph(
      "The fastest way to see the value is to generate your free market entry report. Answer a few questions about your company and we will build a tailored plan in minutes."
    ) +
    button("Create my free market entry report", `${theme.siteUrl}/report-creator`) +
    microcopy(["No credit card required", "Ready in minutes"]) +
    paragraph(
      `Prefer to browse first? Explore the <a href="${theme.siteUrl}/service-providers" style="color:${theme.color.primary};">service provider directory</a>, <a href="${theme.siteUrl}/events" style="color:${theme.color.primary};">upcoming events</a>, and <a href="${theme.siteUrl}/case-studies" style="color:${theme.color.primary};">case studies</a> any time.`
    );

  const html = layout({
    preheader: "Your shortcut to the Australian and ANZ market starts here.",
    contentHtml: content,
  });

  return { subject, html };
}
