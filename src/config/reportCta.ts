// Single source of truth for the report funnel CTA. Every surface that sends
// a visitor into the report creator (nav, hero, homepage sections, popup)
// must use these constants so the label and promise can never drift apart.

export const REPORT_CREATOR_PATH = "/report-creator";

/** Deep-link that pre-selects the Australian-startup persona in the intake. */
export const REPORT_CREATOR_STARTUP_PATH = `${REPORT_CREATOR_PATH}?persona=startup`;

export const REPORT_CTA_LABEL = "Generate my free report";

export const REPORT_CTA_MICROCOPY = "Free · No credit card · Ready in about 3 minutes";

// "See a real report" trust link (charter §5b design rec #3). Set this to the
// share_token of a curated, publicly-shareable completed report and the hero
// renders a "See a real report" link to /report/shared/<token>. Left EMPTY by
// design — choosing which report is public is an owner decision (privacy), so
// the link never appears until a token is deliberately pinned here. The shared
// route is noindexed (private-by-obscurity) — expected for a linked sample.
export const SAMPLE_REPORT_SHARE_TOKEN = "";

/** Public share path for the pinned sample report, or null when none is set. */
export const sampleReportPath = (): string | null =>
  SAMPLE_REPORT_SHARE_TOKEN ? `/report/shared/${SAMPLE_REPORT_SHARE_TOKEN}` : null;
