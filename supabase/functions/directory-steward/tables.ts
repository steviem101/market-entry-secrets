// MES-148 Phase 5 (P5-3b) — directory steward table config (pure, node --test).
//
// Which directory tables the nightly steward re-verifies, the URL column it checks
// for reachability, the fields that drive the completeness score, and whether the
// table carries PII (mentors). PII tables are scored for freshness/reachability but
// their CONTENT is never diffed or staged (community_members holds real name/company
// behind the anonymised public view) — v1 stages only dead-source signals, never
// content, so no PII reaches staging regardless; the flag guards the future content pass.

export interface StewardTableConfig {
  table: string;
  /** column holding the row's source URL (reachability check + freshness signal). */
  urlField: string;
  /** fields whose presence drives the completeness component of data_health. */
  requiredFields: string[];
  /** true = never diff/stage this table's CONTENT (PII). Reachability-only. */
  pii: boolean;
}

export const STEWARD_TABLES: StewardTableConfig[] = [
  { table: "service_providers", urlField: "website", pii: false,
    requiredFields: ["name", "description", "location", "services", "website"] },
  { table: "community_members", urlField: "website", pii: true,
    requiredFields: ["name", "title", "description", "location", "specialties"] },
  { table: "investors", urlField: "website", pii: false,
    requiredFields: ["name", "description", "investor_type", "location", "sector_focus", "website"] },
  { table: "innovation_ecosystem", urlField: "website", pii: false,
    requiredFields: ["name", "description", "location", "services", "website"] },
  { table: "trade_investment_agencies", urlField: "website", pii: false,
    requiredFields: ["name", "description", "location", "services"] },
];

/** Look up the steward config for a table name (undefined if not stewarded). */
export function stewardConfigFor(table: string): StewardTableConfig | undefined {
  return STEWARD_TABLES.find((t) => t.table === table);
}

/** Days between two ISO timestamps (or STALE fallback when either is missing/invalid). */
export function ageInDays(lastVerified: string | null | undefined, nowMs: number, staleDays: number): number {
  if (!lastVerified) return staleDays;
  const then = Date.parse(lastVerified);
  if (!Number.isFinite(then)) return staleDays;
  return Math.max(0, (nowMs - then) / 86400000);
}
