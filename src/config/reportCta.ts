// Single source of truth for the report funnel CTA. Every surface that sends
// a visitor into the report creator (nav, hero, homepage sections, popup)
// must use these constants so the label and promise can never drift apart.

export const REPORT_CREATOR_PATH = "/report-creator";

/** Deep-link that pre-selects the Australian-startup persona in the intake. */
export const REPORT_CREATOR_STARTUP_PATH = `${REPORT_CREATOR_PATH}?persona=startup`;

export const REPORT_CTA_LABEL = "Generate my free report";

export const REPORT_CTA_MICROCOPY = "Free · No credit card · Ready in about 3 minutes";
