import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { log, logError } from "../_shared/log.ts";
import { buildCorsHeaders } from "../_shared/http.ts";

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
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
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, sector, target_market } = await req.json();

    if (!email || !sector || !target_market) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Escape user-supplied values to prevent HTML injection in email templates
    const escapeHtml = (str: string): string =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const safeSector = escapeHtml(sector);
    const safeEmail = escapeHtml(email);
    const safeTargetMarket = escapeHtml(target_market);

    log("send-lead-followup", "Processing follow-up email request", { sector, target_market });

    // Create the email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Thank You for Your Interest!</h1>
          <p style="color: #666; font-size: 16px;">Your Bespoke Market Entry Plan is Being Prepared</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; margin-bottom: 15px;">What Happens Next?</h2>
          <div style="margin-bottom: 15px;">
            <h3 style="color: #374151; margin-bottom: 8px;">📋 Step 1: Analysis (Next 24 hours)</h3>
            <p style="color: #666; margin: 0;">Our market entry experts will analyze your ${safeSector} sector and target market requirements.</p>
          </div>
          <div style="margin-bottom: 15px;">
            <h3 style="color: #374151; margin-bottom: 8px;">📊 Step 2: Custom Plan Creation (24-48 hours)</h3>
            <p style="color: #666; margin: 0;">We'll create a comprehensive, personalized market entry strategy specifically for your business.</p>
          </div>
          <div>
            <h3 style="color: #374151; margin-bottom: 8px;">📧 Step 3: Delivery (Within 48 hours)</h3>
            <p style="color: #666; margin: 0;">Your complete Bespoke Market Entry Plan will be delivered directly to this email address.</p>
          </div>
        </div>

        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #059669; margin-bottom: 15px;">Your Plan Will Include:</h2>
          <ul style="color: #374151; line-height: 1.6; padding-left: 20px;">
            <li><strong>Market Size & Opportunity Analysis</strong> for the ${safeSector} sector</li>
            <li><strong>Regulatory Requirements</strong> and compliance guidelines</li>
            <li><strong>Key Service Providers</strong> and potential partners</li>
            <li><strong>Target Customer Insights</strong> based on your specified market</li>
            <li><strong>Entry Strategy Recommendations</strong> tailored to your business</li>
            <li><strong>Risk Assessment</strong> and mitigation strategies</li>
            <li><strong>Timeline & Action Plan</strong> for market entry</li>
          </ul>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #92400e; margin: 0; font-weight: 500;">
            ⏰ <strong>Estimated Delivery:</strong> Within 48 hours to ${safeEmail}
          </p>
        </div>

        <div style="text-align: center; margin-bottom: 30px;">
          <p style="color: #666; margin-bottom: 15px;">Questions while you wait?</p>
          <a href="mailto:info@marketentry.com.au" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            Contact Our Team
          </a>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
            This email was sent because you requested a Bespoke Market Entry Plan from Market Entry.
          </p>
          <p style="color: #666; font-size: 14px; margin: 0;">
            <strong>Your Target Market:</strong> ${safeTargetMarket}
          </p>
        </div>
      </div>
    `;

    const emailText = `
Thank You for Your Interest!

Your Bespoke Market Entry Plan is Being Prepared

What Happens Next?

Step 1: Analysis (Next 24 hours)
Our market entry experts will analyze your ${sector} sector and target market requirements.

Step 2: Custom Plan Creation (24-48 hours)
We'll create a comprehensive, personalized market entry strategy specifically for your business.

Step 3: Delivery (Within 48 hours)
Your complete Bespoke Market Entry Plan will be delivered directly to ${email}.

Your Plan Will Include:
• Market Size & Opportunity Analysis for the ${sector} sector
• Regulatory Requirements and compliance guidelines
• Key Service Providers and potential partners
• Target Customer Insights based on your specified market
• Entry Strategy Recommendations tailored to your business
• Risk Assessment and mitigation strategies
• Timeline & Action Plan for market entry

Estimated Delivery: Within 48 hours to ${email}

Questions while you wait? Contact us at info@marketentry.com.au

Your Target Market: ${target_market}
    `;

    // Send email via Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (resendApiKey) {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Market Entry Secrets <noreply@marketentrysecrets.com>",
            to: [email],
            subject: "Your Bespoke Market Entry Plan is Being Prepared",
            html: emailHtml,
            text: emailText,
          }),
        });

        if (resendResponse.ok) {
          emailSent = true;
          log("send-lead-followup", "Email sent successfully via Resend", { email: safeEmail, sector });
        } else {
          const errorBody = await resendResponse.text();
          logError("send-lead-followup", `Resend API error: ${resendResponse.status}`, new Error(errorBody));
        }
      } catch (sendErr) {
        logError("send-lead-followup", "Failed to send via Resend", sendErr);
      }
    } else {
      log("send-lead-followup", "RESEND_API_KEY not configured - email not sent", { sector, target_market });
    }

    const emailResponse = {
      success: true,
      message: emailSent ? 'Follow-up email sent successfully' : 'Email prepared but sending not configured',
      email_prepared: true,
      email_sent: emailSent,
      sector: sector
    };

    return new Response(
      JSON.stringify(emailResponse),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    logError("send-lead-followup", "Error processing follow-up email", error);
    return new Response(
      JSON.stringify({ error: 'Failed to send follow-up email' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
