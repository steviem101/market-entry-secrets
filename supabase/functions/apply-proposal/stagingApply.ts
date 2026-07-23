// stagingApply — pure planners that extend apply-proposal (the single production writer) to the
// legacy staging sources (MES-223 E1). No IO here; index.ts owns all network/DB access.
//
// Safety model (epic docs/audits/mes-agent-loops-phase3-epic.md, invariants section):
//   • Organisations only: the field allowlist below deliberately has NO people tables
//     (community_members is absent) — an automated write can never touch mentor/PII data.
//   • Facts vs prose: only `fact`-class fields are machine-writable; `prose` fields (brand-voice
//     copy) are skipped with an explicit reason, forever.
//   • Steward diffs apply per-field via compare-and-swap: a field is written ONLY while the live
//     value still equals the recorded `before` (null / "" / missing treated as equal), so a row
//     edited since the proposal can never be overwritten.
//   • Enrichment payloads are fill-empty-only: a populated field is never overwritten.
//   • Rollout is gated per source by the AGENT_APPLY_SOURCES env (unset = nothing changes).

export interface StagingSourceSpec {
  kind: "steward" | "enrichment";
  /** Column on the staging row naming the directory table (steward), or the fixed table. */
  targetTable?: string;
  targetTableField?: string;
  targetIdField: string;
  appliedStatus: string;
  /** Native statuses apply may consume. Staging tables have no apply_failed status, so a failed
   * apply leaves the row in its approved status — visibly retryable, never silently terminal. */
  applyableStatuses: ReadonlySet<string>;
  hasAppliedAt: boolean;
}

export const STAGING_SOURCES: Record<string, StagingSourceSpec> = {
  directory_steward_staging: {
    kind: "steward", targetTableField: "directory_table", targetIdField: "record_id",
    appliedStatus: "applied", applyableStatuses: new Set(["approved"]), hasAppliedAt: true,
  },
  innovation_ecosystem_enrichment_staging: {
    kind: "enrichment", targetTable: "innovation_ecosystem", targetIdField: "source_id",
    appliedStatus: "applied", applyableStatuses: new Set(["approved"]), hasAppliedAt: false,
  },
  trade_agencies_enrichment_staging: {
    kind: "enrichment", targetTable: "trade_investment_agencies", targetIdField: "source_id",
    appliedStatus: "applied", applyableStatuses: new Set(["approved"]), hasAppliedAt: true,
  },
};

export function isStagingSource(source: string): boolean {
  return source in STAGING_SOURCES;
}

/** Parse AGENT_APPLY_SOURCES (comma-separated staging source names). Unknown names are ignored
 * so a typo can only under-enable, never widen the surface. Unset/empty = nothing enabled. */
export function enabledStagingSources(env: string | undefined | null): ReadonlySet<string> {
  const out = new Set<string>();
  for (const part of (env ?? "").split(",")) {
    const name = part.trim();
    if (name && name in STAGING_SOURCES) out.add(name);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Field allowlist: table -> field -> { cls, kind }. Organisations only — no people tables.
// `fact` fields are machine-writable; `prose` fields always require a human edit.

type FieldClass = "fact" | "prose";
type FieldKind = "text" | "text[]";
interface FieldSpec { cls: FieldClass; kind: FieldKind }

const T = (cls: FieldClass, kind: FieldKind = "text"): FieldSpec => ({ cls, kind });

export const STAGING_FIELD_ALLOWLIST: Record<string, Record<string, FieldSpec>> = {
  service_providers: {
    website: T("fact"), logo: T("fact"), location: T("fact"),
    services: T("fact", "text[]"), sector_tags: T("fact", "text[]"),
    description: T("prose"),
  },
  investors: {
    website: T("fact"), logo: T("fact"), location: T("fact"), country: T("fact"),
    sector_focus: T("fact", "text[]"), stage_focus: T("fact", "text[]"), sector_tags: T("fact", "text[]"),
    description: T("prose"),
  },
  innovation_ecosystem: {
    website: T("fact"), logo: T("fact"), location: T("fact"),
    services: T("fact", "text[]"), sectors: T("fact", "text[]"), sector_tags: T("fact", "text[]"),
    description: T("prose"),
  },
  trade_investment_agencies: {
    website: T("fact"), website_url: T("fact"), logo: T("fact"), location: T("fact"),
    services: T("fact", "text[]"), sectors_supported: T("fact", "text[]"),
    support_types: T("fact", "text[]"), sector_tags: T("fact", "text[]"),
    description: T("prose"),
  },
  events: {
    website_url: T("fact"), location: T("fact"), city: T("fact"), country: T("fact"),
    tags: T("fact", "text[]"), sector_tags: T("fact", "text[]"),
    description: T("prose"),
  },
};

// ---------------------------------------------------------------------------

export interface StagingSkip { field: string; reason: string }

export interface StagingPlan {
  op: "update" | "noop";
  set?: Record<string, unknown>;
  appliedFields: string[];
  skipped: StagingSkip[];
  /** true when every diff field is already at its proposed value — safe to mark applied. */
  allSatisfied: boolean;
}

export interface StagingRefusal { refused: true; reason: string }
export type StagingResult = StagingPlan | StagingRefusal;

export function isStagingRefusal(r: StagingResult): r is StagingRefusal {
  return (r as StagingRefusal).refused === true;
}

/** null, undefined and whitespace-only strings are one "empty" identity; [] counts as empty. */
function normalise(v: unknown): unknown {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") { const t = v.trim(); return t === "" ? null : t; }
  if (Array.isArray(v) && v.length === 0) return null;
  return v;
}

function isEmptyValue(v: unknown): boolean {
  return normalise(v) === null;
}

function valueEquals(a: unknown, b: unknown): boolean {
  const na = normalise(a), nb = normalise(b);
  if (na === null || nb === null) return na === nb;
  if (Array.isArray(na) && Array.isArray(nb)) {
    return na.length === nb.length && na.every((x, i) => String(x) === String(nb[i]));
  }
  return na === nb;
}

function typeOk(v: unknown, kind: FieldKind, allowNull: boolean): boolean {
  if (v === null) return allowNull;
  if (kind === "text") return typeof v === "string";
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

/**
 * Plan a directory-steward apply: field_diffs is {field: {before, after}}. Per-field CAS — write
 * `after` only while the live value still equals `before`. A field already at `after` counts as
 * satisfied. Everything else is skipped with a reason, never guessed.
 */
export function planStewardApply(
  staging: { status: string; field_diffs: unknown },
  targetTable: string,
  currentRow: Record<string, unknown> | null,
): StagingResult {
  const spec = STAGING_SOURCES.directory_steward_staging;
  if (!spec.applyableStatuses.has(staging.status)) {
    return { refused: true, reason: `status '${staging.status}' is not applyable (need approved)` };
  }
  const allow = STAGING_FIELD_ALLOWLIST[targetTable];
  if (!allow) return { refused: true, reason: `target table '${targetTable}' is not staging-applyable (organisations allowlist)` };
  if (!currentRow) return { refused: true, reason: "target row not found (deleted since proposal)" };
  const diffs = staging.field_diffs;
  if (diffs === null || typeof diffs !== "object" || Array.isArray(diffs)) {
    return { refused: true, reason: "field_diffs missing or malformed" };
  }

  const set: Record<string, unknown> = {};
  const appliedFields: string[] = [];
  const skipped: StagingSkip[] = [];
  let satisfied = 0;

  for (const [field, rawDiff] of Object.entries(diffs as Record<string, unknown>)) {
    const diff = (rawDiff ?? {}) as Record<string, unknown>;
    const before = diff.before, after = diff.after;
    const fs = allow[field];
    if (!fs) { skipped.push({ field, reason: "field not in the staging allowlist" }); continue; }
    if (fs.cls === "prose") { skipped.push({ field, reason: "prose field: human edit only" }); continue; }
    // Clearing (after=null) is allowed for text facts (dead links); arrays are never auto-cleared.
    if (!typeOk(after ?? null, fs.kind, fs.kind === "text")) {
      skipped.push({ field, reason: `proposed value has wrong type for ${fs.kind} field` }); continue;
    }
    const live = currentRow[field];
    if (valueEquals(live, after ?? null)) { satisfied++; skipped.push({ field, reason: "already at proposed value" }); continue; }
    if (!valueEquals(live, before ?? null)) {
      skipped.push({ field, reason: "live value changed since proposal (CAS mismatch)" }); continue;
    }
    set[field] = after ?? null;
    appliedFields.push(field);
  }

  const diffCount = Object.keys(diffs as Record<string, unknown>).length;
  if (appliedFields.length === 0) {
    return { op: "noop", appliedFields, skipped, allSatisfied: diffCount > 0 && satisfied === diffCount };
  }
  return { op: "update", set, appliedFields, skipped, allSatisfied: false };
}

/**
 * Plan an enrichment apply: fill-empty only. Writes a proposed value only into a currently-empty
 * fact field of the fixed target table. Populated fields, prose fields, unknown fields, empty or
 * mistyped proposed values are all skipped with reasons.
 */
export function planEnrichmentApply(
  staging: { status: string; enrichment: unknown },
  targetTable: string,
  currentRow: Record<string, unknown> | null,
): StagingResult {
  const allow = STAGING_FIELD_ALLOWLIST[targetTable];
  if (!allow) return { refused: true, reason: `target table '${targetTable}' is not staging-applyable (organisations allowlist)` };
  if (!currentRow) return { refused: true, reason: "target row not found (deleted since proposal)" };
  const src = staging.enrichment;
  if (src === null || typeof src !== "object" || Array.isArray(src)) {
    return { refused: true, reason: "enrichment payload missing or malformed" };
  }

  const set: Record<string, unknown> = {};
  const appliedFields: string[] = [];
  const skipped: StagingSkip[] = [];
  let satisfied = 0;
  let considered = 0;

  for (const [field, value] of Object.entries(src as Record<string, unknown>)) {
    considered++;
    const fs = allow[field];
    if (!fs) { skipped.push({ field, reason: "field not in the staging allowlist" }); continue; }
    if (fs.cls === "prose") { skipped.push({ field, reason: "prose field: human edit only" }); continue; }
    if (isEmptyValue(value)) { skipped.push({ field, reason: "proposed value is empty" }); continue; }
    if (!typeOk(value, fs.kind, false)) {
      skipped.push({ field, reason: `proposed value has wrong type for ${fs.kind} field` }); continue;
    }
    const live = currentRow[field];
    if (!isEmptyValue(live)) {
      if (valueEquals(live, value)) { satisfied++; skipped.push({ field, reason: "already at proposed value" }); }
      else skipped.push({ field, reason: "field already populated (fill-empty only)" });
      continue;
    }
    set[field] = value;
    appliedFields.push(field);
  }

  if (appliedFields.length === 0) {
    return { op: "noop", appliedFields, skipped, allSatisfied: considered > 0 && satisfied === considered };
  }
  return { op: "update", set, appliedFields, skipped, allSatisfied: false };
}
