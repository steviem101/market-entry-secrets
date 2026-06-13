// supabase/functions/_shared/email/templates/paymentConfirmation.ts
//
// Payment confirmation (transactional, no unsubscribe). Sent by stripe-webhook
// on checkout.session.completed. Variables: tier, amount (dollar string),
// currency. first_name is not always present (Stripe path), so it falls back.

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, paragraph, button, microcopy, escapeHtml, plainText } from "../components.ts";

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const nameHtml = escapeHtml(plainText(data.first_name ?? data.USER_NAME, "there"));
  const tierRaw = plainText(data.tier, "Growth");
  const tier = tierRaw.charAt(0).toUpperCase() + tierRaw.slice(1);
  const tierHtml = escapeHtml(tier);
  const amount = plainText(data.amount, "");
  const currency = plainText(data.currency, "AUD");

  const subject = `Payment confirmed: your ${tier} access is live`;
  const receiptParts = amount
    ? [`Amount: ${amount} ${currency}`, "One time payment", "Access does not expire"]
    : ["One time payment", "Access does not expire"];

  const content =
    h1("Payment confirmed") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      `Thank you. Your payment is confirmed and your ${tierHtml} access is now live. Everything in ${tierHtml} is unlocked, including the previously gated sections of your reports.`
    ) +
    button("Go to my reports", `${theme.siteUrl}/my-reports`) +
    microcopy(receiptParts) +
    paragraph("Need a hand? Just reply to this email and it reaches our team.");

  const html = layout({
    preheader: `Your ${tier} access is now live.`,
    contentHtml: content,
  });

  return { subject, html };
}
