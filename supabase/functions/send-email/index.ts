import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { log, logError } from "../_shared/log.ts";
import { buildCorsHeaders } from "../_shared/http.ts";
import { sendViaResendTemplate } from "../_shared/email/resend.ts";
import {
  resolveTemplateId,
  mapToResendVariables,
} from "../_shared/email/resend-templates.ts";
import type { EmailRequest } from "../_shared/email/types.ts";

const EMAIL_INTERNAL_SECRET = Deno.env.get("EMAIL_INTERNAL_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

let _corsHeaders: Record<string, string> = {};

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ..._corsHeaders },
  });
}

function buildIdempotencyKey(
  emailType: string,
  userId: string | undefined,
  data: Record<string, unknown> | undefined
): string | null {
  switch (emailType) {
    case "welcome":
      return userId ? `welcome:${userId}` : null;
    case "report_completed":
      return data?.report_id ? `report_completed:${data.report_id}` : null;
    case "payment_confirmation":
      return data?.stripe_event_id
        ? `payment_confirmation:${data.stripe_event_id}`
        : null;
    case "nurture_ecosystem":
    case "nurture_case_studies":
    case "nurture_ai_report":
    case "nurture_events":
    case "nurture_upgrade":
      return userId ? `${emailType}:${userId}` : null;
    default:
      return null;
  }
}

serve(async (req: Request) => {
  _corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: _corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: _corsHeaders });
  }

  // ── Auth: internal secret OR JWT (for self-service welcome only) ──
  const secret = req.headers.get("x-internal-secret");
  const authHeader = req.headers.get("Authorization");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let body: EmailRequest;

  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (secret === EMAIL_INTERNAL_SECRET) {
    // Internal call — proceed with provided body as-is
  } else if (authHeader) {
    // JWT call — only allow self-service email types
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    if (!["welcome"].includes(body.email_type)) {
      return jsonResponse(
        { error: "Forbidden: this email type requires internal access" },
        403
      );
    }

    // Override with authenticated user's data
    if (!user.email) {
      return jsonResponse({ error: "User has no email address" }, 400);
    }
    body.user_id = user.id;
    body.recipient_email = user.email;
  } else {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { email_type, recipient_email, user_id, data } = body;

  if (!email_type || !recipient_email) {
    return jsonResponse({ error: "email_type and recipient_email required" }, 400);
  }

  // Resolve Resend template ID
  const templateId = resolveTemplateId(email_type, data || {});
  if (!templateId) {
    return jsonResponse({ error: `Unknown email type: ${email_type}` }, 400);
  }

  try {
    // 1. Check opt-out
    if (user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_email_subscribed")
        .eq("id", user_id)
        .maybeSingle();

      if (profile && profile.is_email_subscribed === false) {
        await supabase.from("email_log").insert({
          user_id,
          recipient_email,
          email_type,
          subject: "",
          status: "skipped_opt_out",
          idempotency_key: buildIdempotencyKey(email_type, user_id, data),
        });
        log("send-email", "Skipped — user opted out", { user_id, email_type });
        return jsonResponse({ sent: false, reason: "opt_out" });
      }
    }

    // 2. Check dedup
    const idempotencyKey = buildIdempotencyKey(email_type, user_id, data);
    if (idempotencyKey) {
      const { data: existing } = await supabase
        .from("email_log")
        .select("status")
        .eq("idempotency_key", idempotencyKey)
        .eq("status", "sent")
        .maybeSingle();

      if (existing) {
        log("send-email", "Skipped — duplicate", { idempotencyKey });
        return jsonResponse({ sent: false, reason: "dedup" });
      }
    }

    // 3. Map variables for Resend template
    const variables = mapToResendVariables(email_type, data || {});

    // 4. Send via Resend template
    const result = await sendViaResendTemplate(
      recipient_email,
      templateId,
      variables
    );

    // 5. Log the send
    await supabase.from("email_log").insert({
      user_id: user_id || null,
      recipient_email,
      email_type,
      subject: email_type, // Subject is defined in the Resend template
      resend_id: result.id || null,
      status: result.error ? "failed" : "sent",
      error_message: result.error || null,
      metadata: { ...data, template_id: templateId, variables },
      idempotency_key: idempotencyKey,
    });

    if (result.error) {
      logError("send-email", "Resend API error", result.error);
      return jsonResponse({ sent: false, error: result.error }, 502);
    }

    log("send-email", "Email sent via template", {
      email_type,
      template_id: templateId,
      resend_id: result.id,
      recipient_email,
    });

    return jsonResponse({ sent: true, resend_id: result.id });
  } catch (err) {
    logError("send-email", "Unhandled error", err);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
