/**
 * Curated origin-corridor boost (MES-233 AC3) — feature-flagged, default OFF.
 *
 * `country_entity_links` is a hand-curated, approved-only table mapping each source
 * country to the mentors + trade/government agencies most relevant to that corridor
 * (e.g. 35 Irish-corridor mentors + 4 agencies). It powers the country landing pages
 * but reached ZERO reports. When CORRIDOR_LINKS_ENABLED is on and the founder's origin
 * resolves to a curated corridor, this lifts the curated entities that were ALSO
 * matched to the front of the mentor / agency slate, with a bonus to their match_score
 * and a "Curated <country> corridor" reason — so the verified corridor picks lead,
 * while the rest of the (diversity-reranked) slate keeps its relative order.
 *
 * Deliberately a re-rank of already-matched rows, not an injection: it never bypasses
 * the geo-gate, tier-gate, dedup or diversity logic, and never surfaces an entity the
 * matcher didn't already qualify. Empty in → unchanged out.
 *
 * Pure module — NO Deno globals, NO I/O — importable by the edge function AND
 * unit-tested under Node.
 */

export interface Boostable {
  id?: unknown;
  match_score?: unknown;
  match_reasons?: unknown;
}

const DEFAULT_BONUS = 5;

/**
 * Move the rows whose id is in `curatedIds` to the FRONT of the slate (preserving their
 * relative order), adding `bonus` to their match_score and a "Curated <country> corridor"
 * reason. Non-curated rows keep their order. Returns the new slate + how many were boosted.
 */
export function applyCorridorBoost<T extends Boostable>(
  rows: T[] | null | undefined,
  curatedIds: Set<string> | null | undefined,
  countryLabel: string,
  bonus: number = DEFAULT_BONUS,
): { rows: T[]; boostedCount: number } {
  const list = Array.isArray(rows) ? rows : [];
  if (!curatedIds || curatedIds.size === 0) return { rows: list, boostedCount: 0 };

  const reason = `Curated ${countryLabel} corridor`.replace(/\s+/g, " ").trim();
  const boosted: T[] = [];
  const rest: T[] = [];

  for (const r of list) {
    const id = typeof r?.id === "string" ? r.id : "";
    if (id && curatedIds.has(id)) {
      const score = (typeof r.match_score === "number" ? r.match_score : 0) + bonus;
      const reasons = Array.isArray(r.match_reasons) ? [...(r.match_reasons as unknown[])] : [];
      if (!reasons.includes(reason)) reasons.push(reason);
      boosted.push({ ...r, match_score: score, match_reasons: reasons });
    } else {
      rest.push(r);
    }
  }
  return { rows: [...boosted, ...rest], boostedCount: boosted.length };
}

/**
 * Split approved country_entity_links rows into the id-sets the boost needs. `mentor`
 * links point at community_members.id; `agency` links at trade_investment_agencies.id.
 * Only rows with status "approved" and a string entity_id are kept.
 */
export function corridorIdSets(
  links: Array<{ entity_type?: unknown; entity_id?: unknown; status?: unknown }> | null | undefined,
): { mentorIds: Set<string>; agencyIds: Set<string> } {
  const mentorIds = new Set<string>();
  const agencyIds = new Set<string>();
  for (const l of links || []) {
    if (l?.status !== "approved") continue;
    const id = typeof l?.entity_id === "string" ? l.entity_id : "";
    if (!id) continue;
    if (l.entity_type === "mentor") mentorIds.add(id);
    else if (l.entity_type === "agency") agencyIds.add(id);
  }
  return { mentorIds, agencyIds };
}
