// supabase/functions/_shared/email/templates.ts

import type { TemplateResult } from "./types.ts";

/** Escape user-supplied strings before interpolating into HTML */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const BRAND = {
  primaryColor: "#2B7A8C",
  accentBg: "rgba(43,122,140,0.08)",
  darkText: "#1A1A2E",
  lightBg: "#F8FAFB",
  white: "#FFFFFF",
  mutedText: "#6B7280",
  accentBlue: "#B8E4F0",
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
                <a href="${BRAND.siteUrl}/email-preferences" style="color: ${BRAND.primaryColor}; text-decoration: underline;">Unsubscribe</a> &middot;
                <a href="${BRAND.siteUrl}/member-hub" style="color: ${BRAND.primaryColor}; text-decoration: underline;">Manage preferences</a>
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

function secondaryCta(href: string, label: string): string {
  return `<div style="text-align: center; margin: 16px 0;">
  <a href="${href}" style="color: ${BRAND.primaryColor}; font-size: 14px; text-decoration: underline; font-weight: 500;">
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

function paragraph(text: string): string {
  return `<p style="color: ${BRAND.darkText}; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">${text}</p>`;
}

function signOff(): string {
  return `<p style="color: ${BRAND.darkText}; font-size: 16px; line-height: 1.6; margin: 24px 0 0;">
  Cheers,<br/>The Market Entry Secrets Team
</p>`;
}

// ── Templates ────────────────────────────────────────────────────

function welcomeTemplate(data: Record<string, unknown>): TemplateResult {
  const firstName = escapeHtml((data.first_name as string) || "there");
  const subject = "Welcome to Market Entry Secrets";

  const body = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      Welcome aboard, ${firstName}!
    </h2>
    ${paragraph("You now have access to Australia and New Zealand's most comprehensive market entry intelligence platform. Here are three ways to get started:")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      ${stepCard(
        `<a href="${BRAND.siteUrl}/service-providers" style="color: ${BRAND.primaryColor}; text-decoration: none;">1. Explore vetted service providers</a>`,
        "Browse providers specialising in legal, tax, recruitment, marketing, and more — all focused on ANZ market entry."
      )}
      ${stepCard(
        `<a href="${BRAND.siteUrl}/case-studies" style="color: ${BRAND.primaryColor}; text-decoration: none;">2. Read real market entry case studies</a>`,
        "See how other international companies successfully entered the Australian market."
      )}
      ${stepCard(
        `<a href="${BRAND.siteUrl}/report-creator" style="color: ${BRAND.primaryColor}; text-decoration: none;">3. Generate your AI market entry report</a>`,
        "Get a personalised market entry plan tailored to your company, sector, and goals."
      )}
    </table>
    ${ctaButton(`${BRAND.siteUrl}/report-creator`, "Create Your Free Report")}
    ${signOff()}`;

  return {
    subject,
    html: baseLayout(subject, body, "Your market entry journey starts now — explore providers, case studies, and your AI report"),
  };
}

function nurtureEcosystemTemplate(data: Record<string, unknown>): TemplateResult {
  const firstName = escapeHtml((data.first_name as string) || "there");
  const providerCount = data.provider_count ? String(data.provider_count) : "100+";
  const subject = "Your shortcut to the right partners";

  const body = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      The right partners make all the difference, ${firstName}
    </h2>
    ${paragraph(`Entering a new market is hard. Doing it with the wrong advisors is harder. That's why we've built a curated ecosystem of <strong>${escapeHtml(providerCount)}</strong> vetted service providers, mentors, trade agencies, and innovation hubs — all focused on helping international companies succeed in ANZ.`)}
    ${paragraph("Every provider is categorised by sector, service type, and market relevance. Need legal advice for entity setup? Tax guidance? Digital marketing localised for Australia? It's all here.")}
    ${ctaButton(`${BRAND.siteUrl}/service-providers`, "Browse the Ecosystem")}
    ${paragraph("You can also connect directly with:")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      ${stepCard(
        `<a href="${BRAND.siteUrl}/community" style="color: ${BRAND.primaryColor}; text-decoration: none;">Mentors &amp; advisors</a>`,
        "Founders and operators who've been through ANZ market entry themselves."
      )}
      ${stepCard(
        `<a href="${BRAND.siteUrl}/trade-investment-agencies" style="color: ${BRAND.primaryColor}; text-decoration: none;">Trade &amp; investment agencies</a>`,
        "Government-backed organisations that support international expansion."
      )}
    </table>
    ${signOff()}`;

  return {
    subject,
    html: baseLayout(subject, body, `${providerCount} vetted providers, mentors, and agencies — ready when you are`),
  };
}

function nurtureCaseStudiesTemplate(data: Record<string, unknown>): TemplateResult {
  const firstName = escapeHtml((data.first_name as string) || "there");
  const caseStudyTitle = escapeHtml((data.featured_case_study_title as string) || "a global company entering the Australian market");
  const caseStudyCompany = escapeHtml((data.featured_case_study_company as string) || "");
  const subjectCompany = caseStudyCompany || "a global company";
  const subject = `How ${subjectCompany} cracked the AU market`;

  const body = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      Real playbooks, not theory
    </h2>
    ${paragraph(`${firstName}, the best way to learn about entering the Australian market is from companies that have already done it.`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px; background: ${BRAND.accentBg}; border-radius: 8px; border-left: 4px solid ${BRAND.primaryColor};">
          <p style="color: ${BRAND.primaryColor}; margin: 0 0 4px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Featured Case Study</p>
          <p style="color: ${BRAND.darkText}; margin: 0 0 8px; font-weight: 600; font-size: 18px;">${caseStudyTitle}</p>
          <p style="color: ${BRAND.mutedText}; margin: 0; font-size: 14px;">See how they navigated regulatory requirements, found the right partners, and built traction in ANZ.</p>
        </td>
      </tr>
    </table>
    ${ctaButton(`${BRAND.siteUrl}/case-studies`, "Read the Case Studies")}
    ${paragraph("We also publish sector-specific guides and market intelligence covering regulatory landscapes, competitive analysis, and entry strategies across key industries.")}
    ${secondaryCta(`${BRAND.siteUrl}/content`, "Browse sector guides &amp; intelligence")}
    ${signOff()}`;

  return {
    subject,
    html: baseLayout(subject, body, `See how ${subjectCompany} entered Australia — real strategies, real results`),
  };
}

function nurtureAiReportTemplate(data: Record<string, unknown>): TemplateResult {
  const firstName = escapeHtml((data.first_name as string) || "there");
  const reportCount = data.report_count ? escapeHtml(String(data.report_count)) : null;
  const subject = "Your personalised market entry plan";

  const socialProof = reportCount
    ? `<p style="color: ${BRAND.mutedText}; font-size: 14px; line-height: 1.6; margin: 0 0 24px; text-align: center;"><strong>${reportCount} reports</strong> generated by companies planning their ANZ entry.</p>`
    : "";

  const body = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      Your market entry plan, in minutes
    </h2>
    ${paragraph(`${firstName}, our AI-powered report generator is the fastest way to get a tailored market entry strategy for Australia and New Zealand.`)}
    ${paragraph("Answer a few questions about your company, target sector, and goals — and get a comprehensive plan covering:")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      ${stepCard("Regulatory requirements", "What you need to know before you set up in ANZ.")}
      ${stepCard("Competitive landscape", "Who's already in the market and where the gaps are.")}
      ${stepCard("Recommended partners", "Service providers matched to your sector and needs.")}
      ${stepCard("Action plan", "A step-by-step roadmap for your first 90 days.")}
    </table>
    ${socialProof}
    ${ctaButton(`${BRAND.siteUrl}/report-creator`, "Generate Your Report")}
    ${signOff()}`;

  return {
    subject,
    html: baseLayout(subject, body, "Answer a few questions, get a tailored market entry plan — powered by AI"),
  };
}

function nurtureEventsTemplate(data: Record<string, unknown>): TemplateResult {
  const firstName = escapeHtml((data.first_name as string) || "there");
  const eventTitle = escapeHtml((data.upcoming_event_title as string) || "");
  const eventDate = escapeHtml((data.upcoming_event_date as string) || "");
  const subject = "Connect with the ANZ community";

  const eventBlock = eventTitle
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        <tr>
          <td style="padding: 20px; background: ${BRAND.accentBg}; border-radius: 8px; border-left: 4px solid ${BRAND.primaryColor};">
            <p style="color: ${BRAND.primaryColor}; margin: 0 0 4px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Upcoming Event</p>
            <p style="color: ${BRAND.darkText}; margin: 0 0 4px; font-weight: 600; font-size: 18px;">${eventTitle}</p>
            ${eventDate ? `<p style="color: ${BRAND.mutedText}; margin: 0; font-size: 14px;">${eventDate}</p>` : ""}
          </td>
        </tr>
      </table>`
    : "";

  const body = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      The fastest path into a new market? People who've done it.
    </h2>
    ${paragraph(`${firstName}, the companies that succeed in market entry almost always have one thing in common: they connected with the right people early.`)}
    ${paragraph("Our events directory and community bring together founders, mentors, and operators who understand ANZ market entry firsthand.")}
    ${eventBlock}
    ${ctaButton(`${BRAND.siteUrl}/events`, "View Upcoming Events")}
    ${secondaryCta(`${BRAND.siteUrl}/community`, "Browse the community directory")}
    ${signOff()}`;

  return {
    subject,
    html: baseLayout(subject, body, "Events, mentors, and founders — your ANZ market entry network starts here"),
  };
}

function nurtureUpgradeTemplate(data: Record<string, unknown>): TemplateResult {
  const firstName = escapeHtml((data.first_name as string) || "there");
  const tier = (data.current_tier as string) || "free";
  const subject = "There's more beneath the surface";

  const isPaid = tier !== "free";

  const freeBody = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      You've explored the surface, ${firstName}. Here's what's deeper.
    </h2>
    ${paragraph("Over the past two weeks, you've had access to service providers, events, case studies, and your free AI report. Here's what a paid plan unlocks:")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      ${stepCard("SWOT analysis &amp; competitor deep-dive", "Understand the competitive landscape before you commit resources.")}
      ${stepCard("Mentor recommendations", "Get matched with advisors who specialise in your sector.")}
      ${stepCard("Lead databases", "Access verified contact lists for your target market.")}
      ${stepCard("Full report sections", "Unlock every section of your AI-generated market entry report.")}
    </table>
    ${ctaButton(`${BRAND.siteUrl}/pricing`, "View Plans &amp; Pricing")}
    ${paragraph("No pressure — your free access isn't going anywhere. But if you're serious about ANZ, these tools will save you months of research.")}
    ${signOff()}`;

  const paidBody = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      Two weeks in — how's your market entry journey going, ${firstName}?
    </h2>
    ${paragraph("You've been on the platform for a couple of weeks now, and we wanted to check in. Have you had a chance to explore everything your plan offers?")}
    ${paragraph("If you have questions about your report, need help connecting with a provider, or want to discuss your market entry strategy — we're here to help.")}
    ${ctaButton(`${BRAND.siteUrl}/my-reports`, "Go to Your Dashboard")}
    ${paragraph(`Just reply to this email and we'll get back to you within one business day.`)}
    ${signOff()}`;

  return {
    subject,
    html: baseLayout(subject, isPaid ? paidBody : freeBody, isPaid
      ? "Two weeks in — let us know how we can help with your ANZ entry"
      : "SWOT analysis, competitor data, lead lists — see what's behind the paywall"),
  };
}

function reportCompletedTemplate(
  data: Record<string, unknown>
): TemplateResult {
  const firstName = escapeHtml((data.first_name as string) || "there");
  const companyName = escapeHtml((data.company_name as string) || "your company");
  const reportUrl = (data.report_url as string) || `${BRAND.siteUrl}/my-reports`;
  const subject = `Your report for ${companyName} is ready`;

  const body = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      Good news, ${firstName}!
    </h2>
    ${paragraph(`Your AI-generated market entry report for <strong>${companyName}</strong> has been completed. It includes tailored insights on the competitive landscape, recommended service providers, relevant events, and a step-by-step action plan.`)}
    ${ctaButton(reportUrl, "View Your Report")}
    ${paragraph("Now that you have your plan, the next step is connecting with service providers who can help you execute. Browse providers matched to your sector and needs:")}
    ${secondaryCta(`${BRAND.siteUrl}/service-providers`, "Browse service providers")}
    <p style="color: ${BRAND.mutedText}; font-size: 14px; line-height: 1.6; margin: 24px 0 0; text-align: center;">
      Upgrade your plan to unlock additional sections like SWOT analysis, competitor deep-dive, and lead lists.
    </p>
    ${signOff()}`;

  return {
    subject,
    html: baseLayout(
      subject,
      body,
      `Your market entry report for ${companyName} is ready to view`
    ),
  };
}

function paymentConfirmationTemplate(
  data: Record<string, unknown>
): TemplateResult {
  const tier = (data.tier as string) || "Growth";
  const amount = data.amount ? escapeHtml(String(data.amount)) : null;
  const currency = escapeHtml((data.currency as string) || "AUD");
  const tierDisplay = escapeHtml(tier.charAt(0).toUpperCase() + tier.slice(1));
  const subject = `Payment confirmed — ${tierDisplay} plan`;

  const amountLine = amount
    ? `<p style="color: ${BRAND.darkText}; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
        Amount charged: <strong>${currency} $${amount}</strong>
      </p>`
    : "";

  const tierFeatures: Record<string, string[]> = {
    growth: [
      "SWOT analysis and competitor landscape",
      "Mentor recommendations matched to your sector",
      "Full case study access",
    ],
    scale: [
      "Everything in Growth, plus:",
      "Lead databases with verified contacts",
      "Unlimited report generation",
    ],
    enterprise: [
      "Full platform access",
      "Priority support",
      "Custom research and advisory",
    ],
  };

  const features = tierFeatures[tier.toLowerCase()] || [];
  const featureList = features.length > 0
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        ${features.map(f => `<tr>
          <td style="padding: 8px 16px; font-size: 14px; color: ${BRAND.darkText};">
            &#10003;&nbsp; ${escapeHtml(f)}
          </td>
        </tr>`).join("")}
      </table>`
    : "";

  const body = `
    <h2 style="color: ${BRAND.darkText}; font-size: 24px; margin: 0 0 16px;">
      Payment Confirmed
    </h2>
    ${paragraph(`Thank you for upgrading to the <strong>${tierDisplay}</strong> plan. Your new features are now unlocked — including any previously generated reports.`)}
    ${amountLine}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px; background: ${BRAND.accentBg}; border-radius: 8px;">
          <p style="color: ${BRAND.darkText}; margin: 0; font-weight: 600;">Your Plan: ${tierDisplay}</p>
        </td>
      </tr>
    </table>
    ${featureList}
    ${ctaButton(`${BRAND.siteUrl}/my-reports`, "Go to Your Dashboard")}
    ${signOff()}`;

  return {
    subject,
    html: baseLayout(subject, body, `Your ${tierDisplay} plan is now active — new features unlocked`),
  };
}

// ── Registry ─────────────────────────────────────────────────────

const templates: Record<
  string,
  (data: Record<string, unknown>) => TemplateResult
> = {
  welcome: welcomeTemplate,
  nurture_ecosystem: nurtureEcosystemTemplate,
  nurture_case_studies: nurtureCaseStudiesTemplate,
  nurture_ai_report: nurtureAiReportTemplate,
  nurture_events: nurtureEventsTemplate,
  nurture_upgrade: nurtureUpgradeTemplate,
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
