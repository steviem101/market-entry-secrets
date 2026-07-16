// supabase/functions/_shared/email/templates/paymentConfirmation.ts
//
// Payment confirmation (transactional, no unsubscribe). Sent by stripe-webhook
// on checkout.session.completed. Variables: tier, amount (dollar string),
// currency. first_name is not always present (Stripe path), so it falls back.

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, h2, paragraph, button, bulletList, divider, microcopy, escapeHtml, plainText } from "../components.ts";

export interface RenderResult {
  subject: string;
  html: string;
}

// Fulfilment (MES-195 / T8): the human-service next steps a paid tier includes.
// The Calendly booking link (D7) is the actual fulfilment mechanism; the intros
// are brokered after the call. Keyed by tier; free/other tiers get no block.
const FULFILMENT: Record<string, { label: string; calendly: string; whatsComing: string[] }> = {
  growth: {
    label: "Book your 20–30 min walkthrough call",
    calendly: "https://calendly.com/stephen-marketentrysecrets/30min",
    whatsComing: [
      "A 20–30 minute market-entry walkthrough with your advisor",
      "1 personal mentor introduction",
      "3 ecosystem introductions",
    ],
  },
  scale: {
    label: "Book your 60-minute strategy session",
    calendly: "https://calendly.com/stephen-marketentrysecrets/60-minute-meeting",
    whatsComing: [
      "A 60-minute market-entry strategy session",
      "2 mentor introductions + priority ecosystem access",
      "Your curated lead list, tuned after the session",
    ],
  },
};

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

  // Human-service fulfilment block for paid tiers (growth/scale) — booking link
  // + what's coming. Introductions are brokered, never guaranteed (D5 policy).
  const fulfilment = FULFILMENT[tierRaw.toLowerCase()];
  const fulfilmentHtml = fulfilment
    ? divider() +
      h2("What happens next") +
      paragraph(
        `Your ${tierHtml} plan includes hands-on help. Book your call below — after it, we broker your introductions (introductions are made in good faith, never guaranteed).`
      ) +
      button(fulfilment.label, fulfilment.calendly) +
      bulletList(fulfilment.whatsComing.map((item) => escapeHtml(item)))
    : "";

  const content =
    h1("Payment confirmed") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      `Thank you. Your payment is confirmed and your ${tierHtml} access is now live. Everything in ${tierHtml} is unlocked, including the previously gated sections of your reports.`
    ) +
    button("Go to my reports", `${theme.siteUrl}/my-reports`) +
    microcopy(receiptParts) +
    fulfilmentHtml +
    paragraph("Need a hand? Just reply to this email and it reaches our team.");

  const html = layout({
    preheader: `Your ${tier} access is now live.`,
    contentHtml: content,
  });

  return { subject, html };
}
