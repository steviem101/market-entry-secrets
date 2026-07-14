/**
 * Friendly display labels for the canonical sector vocabulary (MES-110).
 *
 * The vocabulary itself has ONE source of truth — `LINKEDIN_SECTORS` in
 * src/constants/linkedinTaxonomy.ts. The canonical slug set is derived from it
 * here via `sectorSlug` (which mirrors the DB's slugify), so a sector added or
 * renamed there flows through automatically and the coverage test below fails
 * loudly if a friendly label is missing. Only the friendly overrides are
 * hand-authored — they are editorial copy ("Healthcare", not the raw
 * "Hospitals And Health Care"), which no slugify can produce.
 *
 * Every sector select fed by canonical `sector_tags` uses `sectorLabel`, and so
 * do the mentor cards/profile (via mentorDisplay.sectorTagLabel), so the same
 * slug renders identically platform-wide. Free-text sector columns (e.g.
 * `events.sector`) are NOT in this vocabulary and keep their raw display values.
 *
 * Labels are display-only: filter values stay the raw slugs, so URLs and
 * predicates are unaffected by label changes.
 */
// Relative (not "@/") because this module is unit-tested with node --test, whose
// resolver doesn't understand the Vite alias for runtime (value) imports.
import { humanizeSlug } from "./humanizeSlug.ts";
import { LINKEDIN_SECTORS } from "../constants/linkedinTaxonomy.ts";

/**
 * Slugify a canonical sector display name to its `sector_tags` slug. Mirrors the
 * DB slugify (canonicalSectors migration / sector_group_crosswalk): lowercase,
 * every non-alphanumeric run → "-", trimmed. "Farming, Ranching, Forestry" →
 * "farming-ranching-forestry".
 */
export const sectorSlug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** The canonical sector slugs, derived from the single LINKEDIN_SECTORS source. */
export const CANONICAL_SECTOR_SLUGS: readonly string[] = LINKEDIN_SECTORS.map(sectorSlug);

/**
 * Friendly overrides where the humanised slug would read as raw LinkedIn
 * taxonomy-ese. Keyed by canonical slug; the coverage test asserts these keys
 * are exactly `CANONICAL_SECTOR_SLUGS`, so a vocabulary change can't silently
 * ship a slug with no friendly label.
 */
const SECTOR_LABEL_OVERRIDES: Readonly<Record<string, string>> = {
  "accommodation-and-food-services": "Hospitality & Food Services",
  "administrative-and-support-services": "Admin & Support Services",
  "construction": "Construction",
  "consumer-services": "Consumer Services",
  "education": "Education",
  "entertainment-providers": "Entertainment",
  "farming-ranching-forestry": "Agriculture & Farming",
  "financial-services": "Financial Services",
  "government-administration": "Government",
  "holding-companies": "Holding Companies",
  "hospitals-and-health-care": "Healthcare",
  "manufacturing": "Manufacturing",
  "oil-gas-and-mining": "Mining, Oil & Gas",
  "professional-services": "Professional Services",
  "real-estate-and-equipment-rental-services": "Real Estate & Rentals",
  "retail": "Retail",
  "technology-information-and-media": "Technology & Media",
  "transportation-logistics-supply-chain-and-storage": "Transport & Logistics",
  "utilities": "Utilities",
  "wholesale": "Wholesale",
};

/**
 * Display label for a canonical sector slug. Falls back to `humanizeSlug` for
 * any value with no override (a future vocabulary addition, or a non-canonical
 * slug) so nothing renders as a raw kebab-case value.
 */
export const sectorLabel = (slug: string): string =>
  SECTOR_LABEL_OVERRIDES[slug] ?? humanizeSlug(slug);

/** Exposed for the coverage test only. */
export const SECTOR_LABEL_OVERRIDE_KEYS = Object.keys(SECTOR_LABEL_OVERRIDES);
