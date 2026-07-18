// corridorSeed.ts — interim corridor / publication-date / proprietary resolution for
// Content Studio documents that carry no structured corridor metadata at source.
//
// Metadata resolution ladder (Sub-ticket 1B), in priority order:
//   1. source-side columns (the target-state ingest contract — none exist today on
//      source_documents; a companion Content Studio ticket adds upload-time fields);
//   2. this editable seed map, keyed by normalised file_name, covering the 17 known docs;
//   3. a Haiku classification fallback for untagged sources (see classifyCorridor, gated);
//   4. null — never guessed.
//
// Direction is only asserted when the title states it ("Exporting from the UK to
// Australia", "…for Australian technology companies"). For bilateral / ambiguous
// titles origin_country is left null and the involved countries are still captured in
// `countries[]` so the signal is not lost. publication_date is 'YYYY-01-01' when only
// the edition year is known, else null. is_proprietary is false for every third-party
// PDF here (the proprietary lane is calls/podcasts/interviews, populated later).

export interface CorridorMeta {
  origin_country: string | null;
  target_country: string | null;
  countries: string[];
  publication_date: string | null; // ISO date or null
  is_proprietary: boolean;
  sectors: string[]; // coarse hint only; the taxonomy bridge (Sub-ticket 2) refines this
}

/** Normalise a file_name to a stable seed key: lowercase, strip a trailing " (1)"
 *  duplicate-suffix and the extension, collapse non-alphanumerics to single spaces. */
export function seedKey(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")       // drop extension
    .replace(/\s*\(\d+\)\s*$/, "")     // drop " (1)" dedupe suffix
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Keys are seedKey(file_name). Keep this list in lockstep with source_documents.
const SEED: Record<string, CorridorMeta> = {
  // Generic "Doing Business in Australia" vintages — inbound, no single origin.
  "1605 doing business in australia 2016":
    { origin_country: null, target_country: "Australia", countries: ["Australia"], publication_date: "2016-01-01", is_proprietary: false, sectors: [] },
  "doing business in australia 2020":
    { origin_country: null, target_country: "Australia", countries: ["Australia"], publication_date: "2020-01-01", is_proprietary: false, sectors: [] },
  "gtal 2022 doing business in australia 2021":
    { origin_country: null, target_country: "Australia", countries: ["Australia"], publication_date: "2021-01-01", is_proprietary: false, sectors: [] },
  "hc dbia our guide 2021":
    { origin_country: null, target_country: "Australia", countries: ["Australia"], publication_date: "2021-01-01", is_proprietary: false, sectors: [] },

  // Directional inbound-to-Australia.
  "2exporting from the uk to australia business gov uk business gov uk":
    { origin_country: "United Kingdom", target_country: "Australia", countries: ["United Kingdom", "Australia"], publication_date: null, is_proprietary: false, sectors: [] },
  "uk gov exporting to australia gov uk":
    { origin_country: "United Kingdom", target_country: "Australia", countries: ["United Kingdom", "Australia"], publication_date: null, is_proprietary: false, sectors: [] },
  "report how to scale from the uk to australia":
    { origin_country: "United Kingdom", target_country: "Australia", countries: ["United Kingdom", "Australia"], publication_date: null, is_proprietary: false, sectors: [] },

  // Directional outbound-from-Australia (still market-entry playbook material).
  "an aussie founders guide to scaling into the uk":
    { origin_country: "Australia", target_country: "United Kingdom", countries: ["Australia", "United Kingdom"], publication_date: null, is_proprietary: false, sectors: [] },
  "entering the german market a guide for australian technology companies":
    { origin_country: "Australia", target_country: "Germany", countries: ["Australia", "Germany"], publication_date: null, is_proprietary: false, sectors: ["technology"] },

  // Inbound-to-Australia, sector-specific.
  "australia engineering biology market opportunities report intralink tech growth programme":
    { origin_country: null, target_country: "Australia", countries: ["Australia"], publication_date: null, is_proprietary: false, sectors: ["engineering biology", "biotech"] },

  // Bilateral / multi-market — direction not asserted; countries captured.
  "australia and the united sta":
    { origin_country: null, target_country: "Australia", countries: ["Australia", "United States"], publication_date: null, is_proprietary: false, sectors: [] },
  "australia singapore digital trade standards research report":
    { origin_country: null, target_country: "Australia", countries: ["Australia", "Singapore"], publication_date: null, is_proprietary: false, sectors: ["digital trade"] },
  "foreign market entry strategies for australian and singaporean smes findings of a two country comparative study":
    { origin_country: null, target_country: null, countries: ["Australia", "Singapore"], publication_date: null, is_proprietary: false, sectors: [] },
  "export finance australia expanding globally southeast asia europe and the pacific ebook january 2026":
    { origin_country: "Australia", target_country: null, countries: ["Australia"], publication_date: "2026-01-01", is_proprietary: false, sectors: [] },

  // Example snapshots — illustrative corridor examples, treated as generic playbook.
  "example snapshot high fashion retail":
    { origin_country: null, target_country: null, countries: [], publication_date: null, is_proprietary: false, sectors: ["retail", "fashion"] },
  "example snapshot us saas platform":
    { origin_country: "United States", target_country: null, countries: ["United States"], publication_date: null, is_proprietary: false, sectors: ["saas", "technology"] },

  // Ambiguous title; corridor left null rather than guessed.
  "passing us by2":
    { origin_country: null, target_country: null, countries: [], publication_date: null, is_proprietary: false, sectors: [] },
};

/** Resolve corridor metadata for a document file_name from the seed map.
 *  Returns null when the file is not in the seed (caller then tries Haiku / null). */
export function resolveFromSeed(fileName: string | null | undefined): CorridorMeta | null {
  if (!fileName) return null;
  return SEED[seedKey(fileName)] ?? null;
}

/** An all-null corridor result — the explicit "unknown, never guessed" value. */
export function unknownCorridor(): CorridorMeta {
  return { origin_country: null, target_country: null, countries: [], publication_date: null, is_proprietary: false, sectors: [] };
}
