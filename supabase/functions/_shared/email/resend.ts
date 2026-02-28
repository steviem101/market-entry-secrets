// supabase/functions/_shared/email/resend.ts

import type { ResendResult } from "./types.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "Market Entry Secrets <noreply@marketentrysecrets.com>";

export async function sendViaResend(
  to: string,
  subject: string,
  html: string
): Promise<ResendResult> {
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return { error: data.message || `Resend API error: ${resp.status}` };
    }

    return { id: data.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
