// supabase/functions/_shared/email/render.ts
//
// Registry that maps an internal email_type to a code-based template renderer.
// Replaces the Resend-dashboard template lookup (resolveTemplateId +
// mapToResendVariables) as templates are migrated into the repo.
//
// During migration, send-email tries renderEmail() first and falls back to the
// legacy Resend-template path for any type not yet registered here.

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

// All send-email types are migrated to code templates. (lead follow-up lives in
// the separate send-lead-followup function and is handled there.)
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
 * Resolve an email_type (handling the nurture_upgrade free/paid variant the
 * same way the legacy resolveTemplateId did) and render it.
 * Returns null if no code template is registered yet (caller should fall back).
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

/** Email types that have been migrated to code templates. */
export function isMigrated(emailType: string): boolean {
  const key =
    emailType === "nurture_upgrade"
      ? "nurture_upgrade_free"
      : emailType;
  return key in REGISTRY || emailType === "nurture_upgrade" && "nurture_upgrade_paid" in REGISTRY;
}
