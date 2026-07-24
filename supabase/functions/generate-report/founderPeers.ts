/**
 * "Founder peers" sub-slate for the mentor_recommendations section (MES-236).
 *
 * The `founders` goal ("Connect with other founders") had no peer-founder data
 * source, so the intake card promised a connection product the report never
 * delivered (MES-213 finding 10). Real signal DOES exist: vetted mentors carrying a
 * founder archetype in their `specialties` — "Scaled Founder" (×15) and
 * "International Founder" (×47), 62 active rows (prod 2026-07-24). When the founders
 * goal is selected, this module labels those ALREADY-matched mentors as a grounded
 * "Founder peers" sub-slate inside the mentor section — no new query, no invented
 * people. Empty (no heading) when the goal is off or none of the matched mentors
 * qualify, so the report never fabricates a peer it can't back.
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node (`node --test`), like buyerBriefs.ts / firmographics.ts.
 */

// The founder archetypes that live in community_members.specialties (lower-cased for
// a case-insensitive compare). Mirrors goalServiceTags.ts's documented vocabulary.
const FOUNDER_ARCHETYPES = new Set(["scaled founder", "international founder"]);

export interface MentorLike {
  name?: unknown;
  specialties?: unknown;
}

/** True when a mentor row carries a founder archetype in its specialties. */
export function isFounderPeer(mentor: MentorLike | null | undefined): boolean {
  const specs = Array.isArray(mentor?.specialties) ? mentor!.specialties as unknown[] : [];
  return specs.some((s) => typeof s === "string" && FOUNDER_ARCHETYPES.has(s.trim().toLowerCase()));
}

/**
 * Section-prompt note for mentor_recommendations. Returns "" unless the founders goal
 * is selected AND at least one matched mentor is a founder peer — an honest empty
 * (no heading) when there is nothing real to put under it. Names come only from the
 * provided (vetted, already-matched) mentor rows, so the model can't invent peers.
 */
export function buildFounderPeersNote(
  foundersGoalSelected: boolean,
  mentors: MentorLike[] | null | undefined,
  cap = 4,
): string {
  if (!foundersGoalSelected) return "";
  const names = (mentors || [])
    .filter(isFounderPeer)
    .map((p) => String(p?.name ?? "").trim())
    .filter(Boolean)
    .slice(0, cap);
  if (names.length === 0) return "";
  return `\n\nFOUNDER PEERS (this section): the user selected "Connect with other founders". Among the matched mentors, these have themselves founded and scaled companies (or led international market entry): ${names.join(", ")}. Organise this section so they appear under a dedicated "### Founder peers" sub-heading — for each, say in one line what they built and the specific experience a fellow founder would draw on — and cover any remaining mentors under the normal recommendations. Each mentor appears ONCE. Use ONLY the provided mentor data; never invent founders, peer networks, or people not in the matched list.`;
}
