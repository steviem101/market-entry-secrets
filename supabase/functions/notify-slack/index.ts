// supabase/functions/notify-slack/index.ts
//
// Receives webhook payloads from Supabase Database Webhooks and posts
// formatted notifications to Slack.
//
// ── Setup ───────────────────────────────────────────────────────────
// 1. Create a Slack Incoming Webhook:
//    https://api.slack.com/messaging/webhooks
//
// 2. Store the URL as a Supabase secret:
//    supabase secrets set SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T.../B.../xxx"
//
// 3. Configure a Database Webhook in the Supabase Dashboard:
//    Dashboard → Database → Webhooks → Create
//    • Table: public.profiles
//    • Events: INSERT
//    • Type: Supabase Edge Function
//    • Edge Function: notify-slack
//
//    This will automatically fire on every new signup since the
//    handle_new_user() trigger inserts a row into profiles.
// ─────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { log, logError } from "../_shared/log.ts";
import { buildCorsHeaders } from "../_shared/http.ts";
import { notifySignup } from "../_shared/slack.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    log("notify-slack", "Received webhook payload", { type: body.type, table: body.table });

    // Supabase Database Webhooks send payloads in this shape:
    // { type: "INSERT", table: "profiles", record: { ... }, old_record: null }
    const record = body.record;

    if (!record || !record.id) {
      log("notify-slack", "No record or id in payload, skipping");
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the user's email from auth.users (not stored in profiles)
    let email: string | null = null;
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(record.id);
      email = authUser?.user?.email ?? null;
    } catch (err) {
      logError("notify-slack", "Could not fetch auth user for email", err);
    }

    const sent = await notifySignup({
      id: record.id,
      first_name: record.first_name,
      last_name: record.last_name,
      email,
      created_at: record.created_at,
    });

    return new Response(JSON.stringify({ ok: true, sent }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    logError("notify-slack", "Handler error", err);
    return new Response(JSON.stringify({ error: "internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
