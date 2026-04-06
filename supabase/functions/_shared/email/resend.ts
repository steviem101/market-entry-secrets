// supabase/functions/_shared/email/resend.ts

import type { ResendResult } from "./types.ts";

const FROM_EMAIL = "Market Entry Secrets <noreply@marketentrysecrets.com>";
const RESEND_TIMEOUT_MS = 10_000;

export async function sendViaResend(
  to: string,
  subject: string,
  html: string
): Promise<ResendResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return { error: "RESEND_API_KEY is not configured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
      signal: controller.signal,
    });

    const data = await resp.json();

    if (!resp.ok) {
      return { error: data.message || `Resend API error: ${resp.status}` };
    }

    return { id: data.id };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { error: `Resend API timeout after ${RESEND_TIMEOUT_MS}ms` };
    }
    return { error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timeout);
  }
}
