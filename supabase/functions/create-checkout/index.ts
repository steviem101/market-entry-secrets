import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Function to get Stripe configuration based on user email
// GitHub issue #16: Support test/live mode configuration
const getStripeConfig = (userEmail: string) => {
  const isTestUser = userEmail === 'dannymullan17@gmail.com';
  
  logStep("Determining Stripe configuration", { userEmail, isTestUser });
  
  if (isTestUser) {
    // Test environment configuration
    return {
      secretKey: Deno.env.get("STRIPE_TEST_SECRET_KEY"),
      pricingTiers: {
        free: {
          name: "Free Plan",
          priceId: Deno.env.get("STRIPE_TEST_PRICE_ID_FREE"),
          amount: 0
        },
        growth: {
          name: "Growth Plan",
          priceId: Deno.env.get("STRIPE_TEST_PRICE_ID_GROWTH"), 
          amount: 2900 // $29 in cents
        },
        scale: {
          name: "Scale Plan",
          priceId: Deno.env.get("STRIPE_TEST_PRICE_ID_SCALE"),
          amount: 9900 // $99 in cents
        },
        enterprise: {
          name: "Enterprise Plan",
          priceId: Deno.env.get("STRIPE_TEST_PRICE_ID_ENTERPRISE"),
          amount: 49900 // $499 in cents
        }
      }
    };
  } else {
    // Live environment configuration
    return {
      secretKey: Deno.env.get("STRIPE_LIVE_SECRET_KEY"),
      pricingTiers: {
        free: {
          name: "Free Plan",
          priceId: Deno.env.get("STRIPE_LIVE_PRICE_ID_FREE"),
          amount: 0
        },
        growth: {
          name: "Growth Plan",
          priceId: Deno.env.get("STRIPE_LIVE_PRICE_ID_GROWTH"), 
          amount: 2900 // $29 in cents
        },
        scale: {
          name: "Scale Plan",
          priceId: Deno.env.get("STRIPE_LIVE_PRICE_ID_SCALE"),
          amount: 9900 // $99 in cents
        },
        enterprise: {
          name: "Enterprise Plan",
          priceId: Deno.env.get("STRIPE_LIVE_PRICE_ID_ENTERPRISE"),
          amount: 49900 // $499 in cents
        }
      }
    };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client using anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get Stripe configuration based on user email (GitHub issue #16)
    const stripeConfig = getStripeConfig(user.email);
    if (!stripeConfig.secretKey) {
      logStep("ERROR: Stripe secret key not configured for user type");
      throw new Error("Stripe configuration missing. Please add your Stripe secret keys.");
    }
    logStep("Stripe configuration loaded", { 
      isTestMode: user.email === 'dannymullan17@gmail.com',
      availableTiers: Object.keys(stripeConfig.pricingTiers)
    });

    // Parse request body to get selected tier
    const { tier } = await req.json();
    if (!tier || !stripeConfig.pricingTiers[tier as keyof typeof stripeConfig.pricingTiers]) {
      throw new Error(`Invalid pricing tier: ${tier}. Available tiers: ${Object.keys(stripeConfig.pricingTiers).join(', ')}`);
    }
    const selectedTier = stripeConfig.pricingTiers[tier as keyof typeof stripeConfig.pricingTiers];
    
    if (!selectedTier.priceId) {
      throw new Error(`Price ID not configured for tier: ${tier}`);
    }
    
    logStep("Pricing tier selected", { tier, selectedTier });

    // Initialize Stripe with dynamic key
    const stripe = new Stripe(stripeConfig.secretKey, { apiVersion: "2023-10-16" });

    // Check if a Stripe customer exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      logStep("No existing Stripe customer found");
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create Stripe checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: selectedTier.priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        tier: tier,
      },
    });

    logStep("Checkout session created", { 
      sessionId: session.id, 
      url: session.url,
      tier: tier,
      amount: selectedTier.amount 
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});