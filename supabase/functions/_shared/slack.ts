// supabase/functions/_shared/slack.ts

import { log, logError } from "./log.ts";

const PREFIX = "slack";

export interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: { type: string; text: string }[];
  elements?: { type: string; text: string }[];
}

/**
 * Send a message to Slack via Incoming Webhook.
 * Requires SLACK_WEBHOOK_URL secret to be set in Supabase.
 */
export async function sendSlackMessage(
  text: string,
  blocks?: SlackBlock[],
): Promise<boolean> {
  const webhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");

  if (!webhookUrl) {
    log(PREFIX, "SLACK_WEBHOOK_URL not configured — skipping notification");
    return false;
  }

  const payload: Record<string, unknown> = { text };
  if (blocks) payload.blocks = blocks;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      logError(PREFIX, `Slack webhook returned ${res.status}`, body);
      return false;
    }

    log(PREFIX, "Slack notification sent successfully");
    return true;
  } catch (err) {
    logError(PREFIX, "Failed to send Slack notification", err);
    return false;
  }
}

/** Format a UTC timestamp for display. */
function fmtTime(iso?: string): string {
  if (!iso) return "just now";
  const d = new Date(iso);
  return d.toLocaleString("en-AU", { timeZone: "Australia/Sydney" });
}

/**
 * Notify Slack about a new user signup.
 */
export async function notifySignup(profile: {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  created_at?: string | null;
}): Promise<boolean> {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Unknown";
  const email = profile.email || "no email";
  const time = fmtTime(profile.created_at ?? undefined);

  const text = `New user signed up: ${name} (${email})`;
  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "New User Signed Up", emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Name:*\n${name}` },
        { type: "mrkdwn", text: `*Email:*\n${email}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*User ID:*\n\`${profile.id}\`` },
        { type: "mrkdwn", text: `*Signed up:*\n${time}` },
      ],
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: "Market Entry Secrets | User Signup Notification" },
      ],
    },
  ];

  return sendSlackMessage(text, blocks);
}

/**
 * Notify Slack about a successful payment.
 */
export async function notifyPayment(details: {
  user_id?: string | null;
  email?: string | null;
  name?: string | null;
  tier?: string | null;
  amount?: number | null;
  currency?: string | null;
  stripe_event_id?: string | null;
}): Promise<boolean> {
  const tier = details.tier ?? "unknown";
  const name = details.name || "Unknown";
  const email = details.email || "no email";
  const amount = details.amount != null ? (details.amount / 100).toFixed(2) : "—";
  const currency = (details.currency || "aud").toUpperCase();

  const text = `New payment: ${name} upgraded to ${tier} ($${amount} ${currency})`;
  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: "Payment Received", emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Customer:*\n${name}` },
        { type: "mrkdwn", text: `*Email:*\n${email}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Plan:*\n${tier}` },
        { type: "mrkdwn", text: `*Amount:*\n$${amount} ${currency}` },
      ],
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `Market Entry Secrets | Stripe Event: \`${details.stripe_event_id ?? "n/a"}\`` },
      ],
    },
  ];

  return sendSlackMessage(text, blocks);
}
