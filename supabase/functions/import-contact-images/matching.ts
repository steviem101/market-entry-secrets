// MES-123 — Matching a CSV contact row to MES directory records (pure, unit-tested).
//
// Precedence: normalised LinkedIn URL -> exact email -> exact name + organisation.
// One row may legitimately match the SAME person across several directories (different tables)
// -> fan out, write to all. Two or more DIFFERENT people within a SINGLE table -> ambiguous,
// never guessed: the row fails with a reason. Records are never fabricated.

import { normalizeLinkedInUrl, normalizeKey } from "./linkedin.ts";

export interface Candidate {
  surface: string;                    // display label, e.g. 'mentor', 'agency_contact'
  table: string;                      // db table the write targets
  recordId: string;                   // staging matched_record_id ("<parentId>:<contactId>" for JSONB)
  name: string;
  org: string | null;
  email: string | null;
  linkedinNormalized: string | null;  // pre-normalised at load time
  existingAvatar?: string | null;     // current photo (for skip-unless-overwrite); ignored by the matcher
}

export interface CsvRowForMatch {
  fullName: string;
  linkedinUrl: string;
  email: string;
  company: string;
}

export interface MatchResult {
  status: "matched" | "failed";
  method: "linkedin" | "email" | "name_org" | null;
  targets: Candidate[];
  reason?: string;
}

/** True when a tier's hits point at more than one distinct record within any single table. */
function ambiguousTable(hits: Candidate[]): string | null {
  const byTable = new Map<string, Set<string>>();
  for (const c of hits) {
    if (!byTable.has(c.table)) byTable.set(c.table, new Set());
    byTable.get(c.table)!.add(c.recordId);
  }
  for (const [table, ids] of byTable) {
    if (ids.size > 1) return `${ids.size} distinct candidates in ${table}`;
  }
  return null;
}

/** Dedupe candidates by table+recordId (fan-out keeps one target per record). */
function dedupe(hits: Candidate[]): Candidate[] {
  const seen = new Set<string>();
  const out: Candidate[] = [];
  for (const c of hits) {
    const key = `${c.table}:${c.recordId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

export function matchRow(row: CsvRowForMatch, candidates: Candidate[]): MatchResult {
  const link = normalizeLinkedInUrl(row.linkedinUrl);
  const emailKey = normalizeKey(row.email);
  const nameKey = normalizeKey(row.fullName);
  const orgKey = normalizeKey(row.company);

  const tiers: { method: MatchResult["method"]; hits: Candidate[] }[] = [
    {
      method: "linkedin",
      hits: link ? candidates.filter((c) => c.linkedinNormalized && c.linkedinNormalized === link) : [],
    },
    {
      method: "email",
      hits: emailKey ? candidates.filter((c) => c.email && normalizeKey(c.email) === emailKey) : [],
    },
    {
      method: "name_org",
      hits: (nameKey && orgKey)
        ? candidates.filter((c) => normalizeKey(c.name) === nameKey && c.org && normalizeKey(c.org) === orgKey)
        : [],
    },
  ];

  for (const tier of tiers) {
    if (tier.hits.length === 0) continue;
    const hits = dedupe(tier.hits);
    const amb = ambiguousTable(hits);
    if (amb) {
      return { status: "failed", method: null, targets: [], reason: `ambiguous: ${amb}` };
    }
    return { status: "matched", method: tier.method, targets: hits };
  }

  return { status: "failed", method: null, targets: [], reason: "no_match" };
}
