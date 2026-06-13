// supabase/functions/_shared/email/render.ts
//
// Maps an internal email_type to a code-based template renderer that returns the
// email's subject + HTML. This is the single source of truth for send-email's
// content (the legacy Resend-dashboard templates have been retired).

import * as welcome from "./templates/welcome.ts";
import * as paymentConfirmation from "./templates/paymentConfirmation.ts";
import * as reportCompleted from "./templates/reportCompleted.ts";
import * as nurtureEcosystem from "./templates/nurtureEcosystem.ts";
import * as nurtureCaseStudies from "./templates/nurtureCaseStudies.ts";
import * as nurtureAiReport from "./templates/nurtureAiReport.ts";
import * as nurtureEvents from "./templates/nurtureEvents.ts";
import * as nurtureUpgradeFree from "./templates/nurtureUpgradeFree.ts";
import * as nurtureUpgradePaid from "./templates/nurtureUpgradePaid.ts";

export interface RenderResult {
  subject: string;
  html: string;
}

type Renderer = (data: Record<string, unknown>) => RenderResult;

const REGISTRY: Record<string, Renderer> = {
  welcome: welcome.render,
  payment_confirmation: paymentConfirmation.render,
  report_completed: reportCompleted.render,
  nurture_ecosystem: nurtureEcosystem.render,
  nurture_case_studies: nurtureCaseStudies.render,
  nurture_ai_report: nurtureAiReport.render,
  nurture_events: nurtureEvents.render,
  nurture_upgrade_free: nurtureUpgradeFree.render,
  nurture_upgrade_paid: nurtureUpgradePaid.render,
};

/**
 * Resolve an email_type (handling the nurture_upgrade free/paid variant) and
 * render it. Returns null for an unknown type.
 */
export function renderEmail(
  emailType: string,
  data: Record<string, unknown> = {}
): RenderResult | null {
  let key = emailType;
  if (emailType === "nurture_upgrade") {
    const tier = (data.current_tier as string) || "free";
    key = tier === "free" ? "nurture_upgrade_free" : "nurture_upgrade_paid";
  }
  const renderer = REGISTRY[key];
  return renderer ? renderer(data) : null;
}
