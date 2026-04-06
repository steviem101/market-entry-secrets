// supabase/functions/_shared/email/resend-templates.ts
//
// Maps email types to Resend template IDs + handles variable mapping.
// Templates are managed in the Resend dashboard: https://resend.com/templates

export const RESEND_TEMPLATE_IDS: Record<string, string> = {
  welcome: "b252c9f8-6e40-42e1-b18b-b9b2241a1c62",
  nurture_ecosystem: "eb576a39-a5fc-4229-b87e-bad62bc8b031",
  nurture_case_studies: "96d2c574-a8d2-44a3-b940-d143f8937503",
  nurture_ai_report: "5581662e-d917-403e-a410-485cb5741a08",
  nurture_events: "baebf571-44c2-4452-a002-0af38424cba8",
  nurture_upgrade_free: "57162f7a-50b7-44f3-bc44-b3792b029f86",
  nurture_upgrade_paid: "edb5c831-8293-49ec-a78e-b92efa7c0580",
  report_completed: "5d30c0bf-1c6f-4d74-9d42-2cbbcf91fd00",
  payment_confirmation: "d80bb2ee-61e9-4f57-beab-155680af5ba1",
};

/**
 * Resolve the correct Resend template ID for a given email type.
 * For nurture_upgrade, selects free vs paid variant based on data.
 */
export function resolveTemplateId(
  emailType: string,
  data: Record<string, unknown>
): string | null {
  if (emailType === "nurture_upgrade") {
    const tier = (data.current_tier as string) || "free";
    return tier === "free"
      ? RESEND_TEMPLATE_IDS.nurture_upgrade_free
      : RESEND_TEMPLATE_IDS.nurture_upgrade_paid;
  }
  return RESEND_TEMPLATE_IDS[emailType] || null;
}

/**
 * Maps internal data keys to Resend template variable names.
 * Variable keys must match what's defined in the Resend template.
 */
export function mapToResendVariables(
  emailType: string,
  data: Record<string, unknown>
): Record<string, string> {
  const vars: Record<string, string> = {
    USER_NAME: String(data.first_name || "there"),
  };

  switch (emailType) {
    case "nurture_ecosystem":
      vars.PROVIDER_COUNT = String(data.provider_count || "100+");
      break;
    case "nurture_case_studies":
      vars.CASE_STUDY_TITLE = String(
        data.featured_case_study_title ||
          "a global company entering the Australian market"
      );
      vars.CASE_STUDY_COMPANY = String(
        data.featured_case_study_company || "a global company"
      );
      break;
    case "nurture_ai_report":
      vars.REPORT_COUNT = data.report_count ? String(data.report_count) : "";
      break;
    case "nurture_events":
      vars.EVENT_TITLE = String(data.upcoming_event_title || "");
      vars.EVENT_DATE = String(data.upcoming_event_date || "");
      break;
    case "report_completed":
      vars.COMPANY_NAME = String(data.company_name || "your company");
      vars.REPORT_URL = String(
        data.report_url || "https://marketentrysecrets.com/my-reports"
      );
      break;
    case "payment_confirmation": {
      const tier = String(data.tier || "Growth");
      vars.TIER_DISPLAY = tier.charAt(0).toUpperCase() + tier.slice(1);
      vars.AMOUNT = data.amount ? String(data.amount) : "";
      vars.CURRENCY = String(data.currency || "AUD");
      break;
    }
  }

  return vars;
}
