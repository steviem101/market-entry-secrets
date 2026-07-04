import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { log, logError } from "../_shared/log.ts";
import { buildCorsHeaders } from "../_shared/http.ts";
import { sendViaResend } from "../_shared/email/resend.ts";
import { render as renderLeadFollowup } from "../_shared/email/templates/leadFollowup.ts";
import { checkRateLimit } from "../_shared/rateLimit.ts";

function json(status: number, body: Record<string, unknown>, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json(401, { error: "Missing authorization" }, corsHeaders);
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return json(401, { error: "Unauthorized" }, corsHeaders);
    }

    // Anti-abuse rate limit: max 3 follow-up emails per user per 24 hours.
    // Prevents this endpoint being used as an authenticated email relay.
    const rateLimitError = await checkRateLimit(user.id, "send-lead-followup", 3, 60 * 24);
    if (rateLimitError) {
      return json(429, { error: rateLimitError }, corsHeaders);
    }

    const { sector, target_market } = await req.json();

    if (!sector || !target_market) {
      return json(400, { error: "Missing required fields" }, corsHeaders);
    }

    // Recipient is ALWAYS the authenticated user's own verified email.
    // Never accept an arbitrary `email` from the request body — that would
    // turn this endpoint into an open email relay.
    const email = user.email;
    if (!email) {
      return json(400, { error: "Authenticated user has no email on file" }, corsHeaders);
    }

    // Cap user-supplied prompt inputs so they can't bloat the email body.
    const safeSector = String(sector).slice(0, 120);
    const safeTargetMarket = String(target_market).slice(0, 120);

    log("send-lead-followup", "Processing follow-up email request", {
      sector: safeSector,
      target_market: safeTargetMarket,
    });

    // Render via the shared, blue-branded email module (handles HTML escaping).
    const { subject, html } = renderLeadFollowup({
      sector: safeSector,
      target_market: safeTargetMarket,
    });
    const result = await sendViaResend(email, subject, html);
    const emailSent = !result.error;

    if (result.error) {
      logError("send-lead-followup", "Resend API error", result.error);
    } else {
      log("send-lead-followup", "Follow-up email sent", { sector: safeSector });
    }

    return json(
      200,
      {
        success: true,
        message: emailSent ? "Follow-up email sent successfully" : "Email send failed",
        email_sent: emailSent,
        sector: safeSector,
      },
      corsHeaders
    );
  } catch (error) {
    logError("send-lead-followup", "Error processing follow-up email", error);
    return json(500, { error: "Failed to send follow-up email" }, corsHeaders);
  }
});
