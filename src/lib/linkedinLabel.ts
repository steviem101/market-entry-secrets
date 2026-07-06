/**
 * LinkedIn URL classification for report match cards (Stage 5 render bug B12).
 *
 * A match card's `website` slot doubles as its LinkedIn slot, and the card
 * previously labelled ANY linkedin.com URL as a flat "LinkedIn". So a mentor
 * (person) card whose website held a company page — or an org card holding a
 * personal `/in/` profile — showed a misleading link. This classifier reads the
 * URL path so the label is always honest about what it points to: a personal
 * profile vs a company/organisation page.
 *
 * Pure module — no DOM, no I/O — unit-tested under `node --test`.
 */

export type LinkedInKind = "personal" | "org" | "generic";

/** Personal-profile path segments. `/pub/` is the legacy public-profile form. */
const PERSONAL_RE = /linkedin\.com\/(in|pub)\//i;
/** Organisation path segments: company pages, showcases, schools. */
const ORG_RE = /linkedin\.com\/(company|school|showcase)\//i;
/** Any linkedin.com host (guards against substring hosts like `notlinkedin.com`). */
const LINKEDIN_HOST_RE = /(?:^|\/\/|\.)linkedin\.com\//i;

export interface LinkedInInfo {
  isLinkedIn: boolean;
  kind: LinkedInKind | null;
  /** Human label for the card link button. */
  label: string;
}

/**
 * Classify a URL. Non-LinkedIn URLs return `{ isLinkedIn: false, kind: null,
 * label: "Website" }` so the card's existing website path is unchanged.
 */
export function classifyLinkedIn(url: string | undefined | null): LinkedInInfo {
  const u = (url || "").trim();
  if (!u || !LINKEDIN_HOST_RE.test(u)) {
    return { isLinkedIn: false, kind: null, label: "Website" };
  }
  if (PERSONAL_RE.test(u)) return { isLinkedIn: true, kind: "personal", label: "LinkedIn Profile" };
  if (ORG_RE.test(u)) return { isLinkedIn: true, kind: "org", label: "LinkedIn Page" };
  return { isLinkedIn: true, kind: "generic", label: "LinkedIn" };
}
