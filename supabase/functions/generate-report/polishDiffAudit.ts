// MES-148 Phase 2c — polish diff audit (pure logic, node --test).
//
// The polish pass is an editorial rewrite (readability, dedup, transitions). It
// must never introduce a NEW fact — a figure or a named organisation that wasn't
// in the section it edited. When it does (model drift), we revert that section to
// its pre-polish, already-verified text rather than ship the drift.
//
// Reuses the Phase 1 verifier machinery: build an evidence corpus from the
// ORIGINAL section, then flag any numeral/entity in the POLISHED section that
// isn't traceable to the original (numerals within the verifier's rounding
// tolerance; entities via substring / known-name / builtin-allow). Faithful
// rewording passes (it adds no new figures or names); a fabricated stat or
// company fails and the section is reverted.

import {
  buildEvidenceCorpus,
  extractNumerals,
  extractCandidateEntities,
  numeralIsSupported,
  entityIsSupported,
} from "./verifier.ts";

export interface PolishAuditResult {
  ok: boolean;
  new_numerals: string[];
  new_entities: string[];
}

/** Audit one polished section against its original. `ok:false` means the polish
 *  introduced a figure or named entity not present in the original — revert it. */
export function auditPolishedSection(original: string, polished: string): PolishAuditResult {
  // Corpus = the original section only. A polished figure/name is "supported"
  // iff it traces back to the original (same tolerance rules as the grounding
  // verifier), so rephrasing is fine but new facts are not.
  const corpus = buildEvidenceCorpus([original || ""], [], []);
  const newNumerals = extractNumerals(polished || "")
    .filter((n) => !numeralIsSupported(n, corpus))
    .map((n) => n.raw);
  const newEntities = extractCandidateEntities(polished || "")
    .filter((e) => !entityIsSupported(e, corpus));
  return {
    ok: newNumerals.length === 0 && newEntities.length === 0,
    new_numerals: [...new Set(newNumerals)].slice(0, 10),
    new_entities: [...new Set(newEntities)].slice(0, 10),
  };
}

export interface PolishAuditSummary {
  checked: number;
  reverted_sections: string[];
  /** Per reverted section, the offending new figures/names (for server logs). */
  details: Record<string, { new_numerals: string[]; new_entities: string[] }>;
}

/** Audit every polished section against its original. Returns the set to REVERT
 *  (audit failed) plus a summary for telemetry. Pure — the caller applies the
 *  reversion. `originals`/`polished` are section-name → content maps. */
export function auditPolishedSections(
  originals: Record<string, string>,
  polished: Record<string, string>,
): { revert: Set<string>; summary: PolishAuditSummary } {
  const revert = new Set<string>();
  const details: PolishAuditSummary["details"] = {};
  let checked = 0;
  for (const [name, polishedContent] of Object.entries(polished || {})) {
    const original = originals[name] ?? "";
    // Only audit sections that actually changed and have content on both sides.
    if (!polishedContent?.trim() || !original.trim()) continue;
    if (polishedContent === original) continue;
    checked++;
    const res = auditPolishedSection(original, polishedContent);
    if (!res.ok) {
      revert.add(name);
      details[name] = { new_numerals: res.new_numerals, new_entities: res.new_entities };
    }
  }
  return {
    revert,
    summary: { checked, reverted_sections: [...revert], details },
  };
}
