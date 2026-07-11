// MES-123 — import disposition gates (pure, unit-tested).
//
// Two safety gates decide whether a matched row is written, held, or failed:
//   1. Name-only matches (no LinkedIn/email key) are NEVER auto-written — the wrong face on a
//      profile is this feature's worst failure — they are held for a human (needs_review) unless
//      explicitly approved with applyNameMatches.
//   2. Cold-scraped surfaces (agency/investor contacts — people who never opted into MES) are held
//      unless the operator explicitly opts in with includeColdContacts (privacy/ToS posture).

import type { Candidate, MatchResult } from "./matching.ts";

export const COLD_SURFACES = new Set(["agency_contact", "investor"]);

export type Disposition =
  | { action: "failed"; reason: string }
  | { action: "needs_review"; reason: string }
  | { action: "write"; targets: Candidate[]; heldCold: number };

export function decideDisposition(
  result: MatchResult,
  opts: { applyNameMatches: boolean; includeColdContacts: boolean },
): Disposition {
  if (result.status === "failed") {
    return { action: "failed", reason: result.reason ?? "no_match" };
  }
  if (result.method === "name_org" && !opts.applyNameMatches) {
    return { action: "needs_review", reason: "name_only_review (no linkedin/email key)" };
  }
  const writable = result.targets.filter((t) => !COLD_SURFACES.has(t.surface) || opts.includeColdContacts);
  const heldCold = result.targets.length - writable.length;
  if (writable.length === 0) {
    return { action: "needs_review", reason: "cold_contact_gated (agency/investor — set includeColdContacts)" };
  }
  return { action: "write", targets: writable, heldCold };
}
