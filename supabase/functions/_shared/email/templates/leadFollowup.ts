// supabase/functions/_shared/email/templates/leadFollowup.ts
//
// Bespoke market-entry-plan follow-up (transactional; user requested it).
// Used by the separate send-lead-followup function, not the send-email registry.
// Variables: sector, target_market.

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, paragraph, button, bulletList, escapeHtml, plainText } from "../components.ts";

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const sector = escapeHtml(plainText(data.sector, "your"));
  const targetMarket = escapeHtml(plainText(data.target_market, "your target market"));

  const subject = "Your bespoke market entry plan is on its way";

  const content =
    h1("Your bespoke market entry plan is on its way") +
    paragraph(
      `Thank you for your interest. Your bespoke market entry plan for the ${sector} sector is being prepared.`
    ) +
    paragraph("<strong>What happens next</strong>") +
    bulletList([
      `<strong>Analysis, within 24 hours</strong>: our team reviews your ${sector} sector and target market.`,
      "<strong>Custom plan, 24 to 48 hours</strong>: we build a personalised entry strategy for your business.",
      "<strong>Delivery, within 48 hours</strong>: your complete plan arrives in this inbox.",
    ]) +
    paragraph(
      "Your plan will include market sizing, regulatory requirements, key service providers, target customer insights, entry strategy, risk assessment, and a timeline."
    ) +
    paragraph(`<strong>Target market:</strong> ${targetMarket}`) +
    button("Contact our team", `mailto:${theme.sender.support}`);

  const html = layout({
    preheader: "Your bespoke market entry plan is being prepared.",
    contentHtml: content,
  });

  return { subject, html };
}
