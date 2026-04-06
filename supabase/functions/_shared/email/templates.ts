// supabase/functions/_shared/email/templates.ts

import type { TemplateResult } from "./types.ts";

const BRAND = {
  primaryColor: "#2B7A8C",
  accentBg: "rgba(43,122,140,0.08)",
  darkText: "#1A1A2E",
  lightBg: "#F8FAFB",
  white: "#FFFFFF",
  mutedText: "#6B7280",
  siteUrl: "https://marketentrysecrets.com",
  siteName: "Market Entry Secrets",
};

function baseLayout(
  title: string,
  bodyContent: string,
  preheaderText = ""
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <!--[if !mso]><!-->
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
  </style>
  <!--<![endif]-->
</head>
<body style="margin:0; padding:0; background-color:${BRAND.lightBg};">
  ${preheaderText ? `<div style="display:none;font-size:1px;color:${BRAND.lightBg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheaderText}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.lightBg};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:${BRAND.white}; border-radius:12px; overflow:hidden; box-shadow: 0 4px 20px rgba(43,122,140,0.08);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primaryColor}, #1F6475); padding: 32px 40px; text-align: center;">
              <h1 style="color: ${BRAND.white}; font-size: 22px; margin: 0; font-weight: 700;">
                ${BRAND.siteName}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: ${BRAND.lightBg}; border-top: 1px solid #E5E7EB;">
              <p style="color: ${BRAND.mutedText}; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                You're receiving this because you have an account at ${BRAND.siteName}.<br/>
                <a href="${BRAND.siteUrl}/member-hub" style="color: ${BRAND.primaryColor}; text-decoration: underline;">Manage email preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<div style="text-align: center; margin: 32px 0;">
  <a href="${href}" style="display: inline-block; background: ${BRAND.primaryColor}; color: ${BRAND.white}; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
    ${label}
  </a>
</div>`;
}

function stepCard(title: string, description: string): string {
  return `<tr>
  <td style="padding: 16px 20px; background: ${BRAND.accentBg}; border-radius: 8px; border-left: 4px solid ${BRAND.primaryColor};">
    <p style="color: ${BRAND.darkText}; margin: 0 0 4px; font-weight: 600;">${title}</p>
    <p style="color: ${BRAND.mutedText}; margin: 0; font-size: 14px;">${description}</p>
  </td>
</tr>
<tr><td style="height: 12px;"></td></tr>`;
}

// ── Templates ────────────────────────────────────────────────────

function welcomeTemplate(data: Record<string, unknown>): TemplateResult {
  const firstName = (data.first_name as string) || "there";
  const subject = `Welcome to Market Entry Secrets, ${firstName}!`;

  const body = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      Welcome aboard, ${firstName}!
    </h2>
    <p style="color: ${BRAND.darkText}; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      You've just joined the platform trusted by international companies entering the Australian and ANZ market. Here's what you can do next:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      ${stepCard("1. Generate Your Free Market Entry Report", "AI-powered insights tailored to your company and target market.")}
      ${stepCard("2. Explore Service Providers", "Browse vetted providers who specialise in market entry.")}
      ${stepCard("3. Connect with Mentors", "Get guidance from experienced professionals who've been through it.")}
    </table>
    ${ctaButton(`${BRAND.siteUrl}/report-creator`, "Create Your Free Report")}`;

  return {
    subject,
    html: baseLayout(subject, body, "Your market entry journey starts now"),
  };
}

function reportCompletedTemplate(
  data: Record<string, unknown>
): TemplateResult {
  const firstName = (data.first_name as string) || "there";
  const companyName = (data.company_name as string) || "your company";
  const reportUrl = data.report_url as string;
  const subject = `Your Market Entry Report for ${companyName} is Ready`;

  const body = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      Good news, ${firstName}!
    </h2>
    <p style="color: ${BRAND.darkText}; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Your AI-generated market entry report for <strong>${companyName}</strong> has been completed. It includes tailored insights on the competitive landscape, service providers, events, and a recommended action plan.
    </p>
    ${ctaButton(reportUrl, "View Your Report")}
    <p style="color: ${BRAND.mutedText}; font-size: 14px; line-height: 1.6; margin: 24px 0 0; text-align: center;">
      Upgrade your plan to unlock additional sections like SWOT analysis, competitor deep-dive, and lead lists.
    </p>`;

  return {
    subject,
    html: baseLayout(
      subject,
      body,
      `Your report for ${companyName} is ready to view`
    ),
  };
}

function paymentConfirmationTemplate(
  data: Record<string, unknown>
): TemplateResult {
  const tier = (data.tier as string) || "Growth";
  const amount = data.amount as string | null;
  const currency = (data.currency as string) || "AUD";
  const tierDisplay = tier.charAt(0).toUpperCase() + tier.slice(1);
  const subject = `Payment Confirmed — ${tierDisplay} Plan`;

  const amountLine = amount
    ? `<p style="color: ${BRAND.darkText}; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Amount charged: <strong>${currency} $${amount}</strong>
      </p>`
    : "";

  const body = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      Payment Confirmed
    </h2>
    <p style="color: ${BRAND.darkText}; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      Thank you for upgrading to the <strong>${tierDisplay}</strong> plan. Your new features are now unlocked — including any previously generated reports.
    </p>
    ${amountLine}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px; background: ${BRAND.accentBg}; border-radius: 8px;">
          <p style="color: ${BRAND.darkText}; margin: 0; font-weight: 600;">Your Plan: ${tierDisplay}</p>
        </td>
      </tr>
    </table>
    ${ctaButton(`${BRAND.siteUrl}/my-reports`, "View Your Reports")}`;

  return {
    subject,
    html: baseLayout(subject, body, `Your ${tierDisplay} plan is now active`),
  };
}

// ── Registry ─────────────────────────────────────────────────────

const templates: Record<
  string,
  (data: Record<string, unknown>) => TemplateResult
> = {
  welcome: welcomeTemplate,
  report_completed: reportCompletedTemplate,
  payment_confirmation: paymentConfirmationTemplate,
};

export function getTemplate(
  emailType: string,
  data: Record<string, unknown> = {}
): TemplateResult {
  const templateFn = templates[emailType];
  if (!templateFn) {
    throw new Error(`Unknown email template: ${emailType}`);
  }
  return templateFn(data);
}
