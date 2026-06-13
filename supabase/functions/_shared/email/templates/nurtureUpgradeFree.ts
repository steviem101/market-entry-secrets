// supabase/functions/_shared/email/templates/nurtureUpgradeFree.ts
//
// Nurture upgrade nudge for free-tier users (marketing, has unsubscribe).
// Variables: first_name.

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, paragraph, button, bulletList, microcopy, escapeHtml, plainText } from "../components.ts";

const UNSUBSCRIBE_URL = `mailto:${theme.sender.support}?subject=Unsubscribe`;

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const nameHtml = escapeHtml(plainText(data.first_name ?? data.USER_NAME, "there"));

  const subject = "You have seen the free tier. Here is what sits behind it.";

  const content =
    h1("There is a deeper layer") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      "Your free access covers the executive summary, service providers, events, and action plan. The deeper layer is where entry decisions actually get made:"
    ) +
    bulletList([
      "<strong>Growth</strong>: full SWOT, competitor landscape, and mentor recommendations",
      "<strong>Scale</strong>: targeted lead lists of real buyers and partners",
    ]) +
    button("See plans", `${theme.siteUrl}/pricing`) +
    microcopy(["One time payment", "Immediate access", "No subscription"]);

  const html = layout({
    preheader: "SWOT, competitors, mentors, and lead lists are one step away.",
    contentHtml: content,
    unsubscribeUrl: UNSUBSCRIBE_URL,
  });

  return { subject, html };
}
