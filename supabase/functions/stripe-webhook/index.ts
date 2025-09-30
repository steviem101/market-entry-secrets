// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { log, logError } from "../_shared/log.ts";
import { buildCorsHeaders } from "../_shared/http.ts";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2022-11-15" });
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  try {
    if (req.method !== "POST") return new Response("method not allowed", { status: 405, headers: corsHeaders });

    // Grab raw body as ArrayBuffer to preserve exact bytes
    const body = await req.arrayBuffer();
    const rawBody = new TextDecoder("utf-8").decode(body);

    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return new Response("Missing stripe-signature header", { status: 400, headers: corsHeaders });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err: Error | any) {
      logError("stripe-webhook", "Webhook signature verification failed", err);
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400, headers: corsHeaders });
    }

    log("stripe-webhook", "Received Stripe event", { eventId: event.id, type: event.type });

    // quick check if we already have this event (avoid duplicate upserts)
    const { data: existingEvent } = await supabaseAdmin
      .from("payment_webhook_logs")
      .select("stripe_event_id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existingEvent) {
      log("stripe-webhook", "Duplicate Stripe event detected, skipping", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract object + metadata
    const dataObj = (event.data && event.data.object) ? (event.data.object as any) : null;
    const metadata = dataObj?.metadata ?? {};
    const clientReferenceId = dataObj?.client_reference_id ?? null;
    let paymentIntentId: string | null = null;
    let amount = null;
    let currency = null;
    let status = null;

    if (dataObj?.payment_intent) paymentIntentId = String(dataObj.payment_intent);
    if (dataObj?.amount_total) {
      amount = dataObj.amount_total;
      currency = dataObj.currency;
    }

    // insert raw log first
    await supabaseAdmin.from("payment_webhook_logs").insert({
      stripe_event_id: event.id,
      stripe_payload: rawBody,
      parsed: {
        metadata,
        clientReferenceId,
        paymentIntentId,
        amount,
        currency,
        eventType: event.type,
      },
    });

    log("stripe-webhook", "Inserted raw log into payment_webhook_logs", { eventId: event.id, eventType: event.type, });

    // Handle checkout session completed
    if (event.type === "checkout.session.completed") {
      const session = dataObj as Stripe.Checkout.Session;
      const tier = metadata?.tier ?? null;
      const supabaseUserId = metadata?.supabase_user_id ?? null;
      const payment_intent_id = session.payment_intent ? String(session.payment_intent) : paymentIntentId;

      // optionally retrieve PI to verify
      if (payment_intent_id) {
        try {
          const pi = await stripe.paymentIntents.retrieve(payment_intent_id);
          amount = pi.amount;
          currency = pi.currency;
          status = pi.status;
        } catch (e) {
          log("stripe-webhook", "Could not retrieve payment intent", { error: e, payment_intent_id });
        }
      }

      if (tier == null) {
        log("stripe-webhook", "No tier found in metadata for checkout.session.completed", { eventId: event.id });
      }

      if (supabaseUserId) {
        log("stripe-webhook", "Upserting user subscription", { supabaseUserId, tier });

        const { data, error: upsertErr } = await supabaseAdmin
          .from("user_subscriptions")
          .upsert(
            {
              user_id: supabaseUserId,
              tier: tier,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )
          .select();

        if (upsertErr) {
          logError("stripe-webhook", "Error upserting user_subscriptions", { error: upsertErr });
        } else {
          log("stripe-webhook", "Upserted user_subscriptions successfully", { data });
        }
      } else {
        logError("stripe-webhook", "Checkout completed but no supabaseUserId in metadata — ignoring", {event: event});
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    logError("stripe-webhook", "webhook handler error", { error: err });
    return new Response("internal error", { status: 500, headers: corsHeaders });
  }
}, { port: Number(Deno.env.get("PORT") ?? 8000) });
