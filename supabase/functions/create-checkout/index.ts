// supabase/functions/create-checkout/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { log, logError } from "../_shared/log.ts";
import { buildCorsHeaders } from "../_shared/http.ts";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FRONTEND_URL = Deno.env.get("FRONTEND_URL");

const PRICE_IDS: Record<string, string> = {
  growth: Deno.env.get("STRIPE_GROWTH_PRICE_ID")!,
  scale: Deno.env.get("STRIPE_SCALE_PRICE_ID")!,
};

const stripe = new Stripe(STRIPE_SECRET);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST")
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });

    const body = await req.json();
    log("create-checkout", "incoming body", body);

    const tier = String(body.tier ?? "").toLowerCase();
    const priceId = PRICE_IDS[tier];
    if (!priceId) {
      logError("create-checkout", "Invalid tier provided", { tier });
      return new Response(JSON.stringify({ error: "Invalid tier" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token || !body.supabase_user_id) {
      logError("create-checkout", "Authentication required: missing token or supabase_user_id", null);
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !userData?.user || userData.user.id !== body.supabase_user_id) {
      logError("create-checkout", "Invalid/unauthorized user token", { error });
      return new Response(JSON.stringify({ error: "Invalid user token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const supabaseUserId = userData.user.id;

    // First fetch user profile (with stripe_customer_id) from Supabase
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id, first_name, last_name")
      .eq("id", supabaseUserId)
      .single();

    if (profileError) {
      throw new Error("Could not fetch user profile");
    }

    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create customer on Stripe only at the moment of purchase
      const customer = await stripe.customers.create({
        email: userData.user.email,
        name: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim(),
        metadata: { supabase_user_id: supabaseUserId },
      });

      stripeCustomerId = customer.id;

      // Save customerId back in Supabase
      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", supabaseUserId);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: stripeCustomerId,
      metadata: { tier, supabase_user_id: supabaseUserId },
      client_reference_id: supabaseUserId,
      success_url: `${FRONTEND_URL}/pricing?session_id={CHECKOUT_SESSION_ID}&stripe_status=success`,
      cancel_url: `${FRONTEND_URL}/pricing?stripe_status=cancel`,
    });


    log("create-checkout", "created Stripe session", session);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    logError("create-checkout", "Unhandled exception", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}, { port: Number(Deno.env.get("PORT") ?? 8000) });



