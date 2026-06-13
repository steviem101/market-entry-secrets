// supabase/functions/_shared/email/render.ts
//
// Registry that maps an internal email_type to a code-based template renderer.
// Replaces the Resend-dashboard template lookup (resolveTemplateId +
// mapToResendVariables) as templates are migrated into the repo.
//
// During migration, send-email tries renderEmail() first and falls back to the
// legacy Resend-template path for any type not yet registered here.

import * as welcome from "./templates/welcome.ts";

export interface RenderResult {
  subject: string;
  html: string;
}

type Renderer = (data: Record<string, unknown>) => RenderResult;

// Only migrated templates are registered. Add entries as each email is ported.
const REGISTRY: Record<string, Renderer> = {
  welcome: welcome.render,
  // nurture_ecosystem, nurture_case_studies, nurture_ai_report, nurture_events,
  // nurture_upgrade_free, nurture_upgrade_paid, report_completed,
  // payment_confirmation, lead_followup  -> added during fan-out.
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
