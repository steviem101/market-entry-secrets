// MES-148 Phase 5 (P5-5) — demand-mining aggregation (pure, node --test).
//
// Turns report intake into per-canonical-service-term demand, so the loop can compare
// it against directory supply and rank the unmet gaps. Pure + total so it's unit-tested
// under Node and reused by the demand-mining edge function. No I/O, no throwing.
//
// The canonical vocabulary comes from service_terms (P5-1): each term carries the real
// directory-cased synonyms that mean it. We normalise a form's free-text services_needed
// through that index so "Legal Services", "Tax & Legal", "Employment Law" all count as
// demand for the `legal` term — the same expansion matching uses, applied to demand.

/** A canonical service term as loaded from service_terms. */
export interface ServiceTerm {
  slug: string;
  label: string;
  synonyms: string[];
}

/** The intake fields demand is mined from (all optional/nullable — forms vary). */
export interface IntakeDemand {
  services_needed?: string[] | null;
  target_regions?: string[] | null;
  industry_sector?: string[] | null;
}

export interface TermDemand {
  slug: string;
  label: string;
  /** distinct intake forms that asked for this term. */
  demand: number;
  /** target regions demanding this term, most-common first. */
  regions: string[];
  /** industry sectors demanding this term, most-common first. */
  sectors: string[];
}

/** A service term is considered adequately served once it has this many matching
 *  directory rows — supply at/above the target zeroes the gap regardless of demand. */
export const SUPPLY_TARGET = 5;
/** Ignore terms demanded fewer than this many times in the window (noise floor). */
export const MIN_DEMAND = 2;

/** Lowercase + collapse internal whitespace so directory casing/spacing never splits a
 *  synonym from its demand form. Total: non-strings normalise to "". */
export function normalizeTag(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Build a normalised-synonym → term index. Each term is keyed by its slug, its label,
 *  and every synonym (all normalised). Later terms don't clobber earlier keys, so a
 *  shared synonym maps to the first term that claims it (curation order in service_terms). */
export function buildTermIndex(terms: ServiceTerm[]): Map<string, { slug: string; label: string }> {
  const index = new Map<string, { slug: string; label: string }>();
  for (const t of terms ?? []) {
    if (!t || typeof t.slug !== "string" || !t.slug) continue;
    const entry = { slug: t.slug, label: typeof t.label === "string" && t.label ? t.label : t.slug };
    const keys = [t.slug, t.label, ...(Array.isArray(t.synonyms) ? t.synonyms : [])];
    for (const k of keys) {
      const nk = normalizeTag(k);
      if (nk && !index.has(nk)) index.set(nk, entry);
    }
  }
  return index;
}

/** Map one raw service tag to its canonical term (or null if unknown). */
export function mapToTerm(
  raw: unknown,
  index: Map<string, { slug: string; label: string }>,
): { slug: string; label: string } | null {
  return index.get(normalizeTag(raw)) ?? null;
}

function bump(m: Map<string, number>, key: unknown): void {
  const k = typeof key === "string" ? key.trim() : "";
  if (!k) return;
  m.set(k, (m.get(k) ?? 0) + 1);
}

/** Top-n keys of a count map, most-common first (ties broken alphabetically for
 *  determinism — important because tests and Slack digests compare output). */
export function topKeys(m: Map<string, number>, n: number): string[] {
  return [...m.entries()]
    .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([k]) => k);
}

/** Aggregate demand per canonical term across forms. A form counts ONCE per term even
 *  if several of its services_needed map to the same term (distinct-form demand), and
 *  contributes its regions/sectors to each term it demands. Deterministic ordering. */
export function tallyDemand(
  forms: IntakeDemand[],
  index: Map<string, { slug: string; label: string }>,
): TermDemand[] {
  const demand = new Map<string, number>();
  const labels = new Map<string, string>();
  const regions = new Map<string, Map<string, number>>();
  const sectors = new Map<string, Map<string, number>>();

  for (const form of forms ?? []) {
    if (!form) continue;
    // Distinct canonical terms this single form demands.
    const termsInForm = new Map<string, string>();
    for (const raw of Array.isArray(form.services_needed) ? form.services_needed : []) {
      const t = mapToTerm(raw, index);
      if (t) termsInForm.set(t.slug, t.label);
    }
    for (const [slug, label] of termsInForm) {
      demand.set(slug, (demand.get(slug) ?? 0) + 1);
      labels.set(slug, label);
      if (!regions.has(slug)) regions.set(slug, new Map());
      if (!sectors.has(slug)) sectors.set(slug, new Map());
      for (const r of Array.isArray(form.target_regions) ? form.target_regions : []) bump(regions.get(slug)!, r);
      for (const s of Array.isArray(form.industry_sector) ? form.industry_sector : []) bump(sectors.get(slug)!, s);
    }
  }

  return [...demand.entries()]
    .map(([slug, count]) => ({
      slug,
      label: labels.get(slug) ?? slug,
      demand: count,
      regions: topKeys(regions.get(slug) ?? new Map(), 3),
      sectors: topKeys(sectors.get(slug) ?? new Map(), 3),
    }))
    .sort((a, b) => (b.demand - a.demand) || a.slug.localeCompare(b.slug));
}

/** Round to 2dp without float dust. */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Demand-weighted shortfall: expected number of under-served requests. Zero once
 *  supply reaches SUPPLY_TARGET (term adequately served), full weight at zero supply.
 *  Total: negative/NaN inputs clamp to a sane 0-floor. */
export function gapScore(demand: number, supply: number, target: number = SUPPLY_TARGET): number {
  const d = Number.isFinite(demand) ? Math.max(0, demand) : 0;
  const s = Number.isFinite(supply) ? Math.max(0, supply) : 0;
  const t = Number.isFinite(target) && target > 0 ? target : SUPPLY_TARGET;
  const unmet = Math.max(0, 1 - s / t);
  return round2(d * unmet);
}
