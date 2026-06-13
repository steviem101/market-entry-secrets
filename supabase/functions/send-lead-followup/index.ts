import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { log, logError } from "../_shared/log.ts";
import { buildCorsHeaders } from "../_shared/http.ts";
import { sendViaResend } from "../_shared/email/resend.ts";
import { render as renderLeadFollowup } from "../_shared/email/templates/leadFollowup.ts";

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

    const { email, sector, target_market } = await req.json();

    if (!email || !sector || !target_market) {
      return json(400, { error: "Missing required fields" }, corsHeaders);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json(400, { error: "Invalid email format" }, corsHeaders);
    }

    log("send-lead-followup", "Processing follow-up email request", { sector, target_market });

    // Render via the shared, blue-branded email module (handles HTML escaping).
    const { subject, html } = renderLeadFollowup({ sector, target_market });
    const result = await sendViaResend(email, subject, html);
    const emailSent = !result.error;

    if (result.error) {
      logError("send-lead-followup", "Resend API error", result.error);
    } else {
      log("send-lead-followup", "Follow-up email sent", { sector });
    }

    return json(
      200,
      {
        success: true,
        message: emailSent ? "Follow-up email sent successfully" : "Email send failed",
        email_sent: emailSent,
        sector,
      },
      corsHeaders
    );
  } catch (error) {
    logError("send-lead-followup", "Error processing follow-up email", error);
    return json(500, { error: "Failed to send follow-up email" }, corsHeaders);
  }
});
