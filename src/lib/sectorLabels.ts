/**
 * Friendly display labels for the 20 canonical sector slugs (MES-110
 * vocabulary, mirrored in src/constants/linkedinTaxonomy.ts LINKEDIN_SECTORS).
 *
 * Every sector select fed by canonical `sector_tags` uses `sectorLabel` so the
 * same slug renders identically platform-wide — and renders as plain product
 * language, not LinkedIn taxonomy-ese ("Farming, Ranching, Forestry" →
 * "Agriculture & Farming"). Free-text sector columns (e.g. `events.sector`)
 * are NOT in this vocabulary and keep their raw display values.
 *
 * Labels are display-only: filter values stay the raw slugs, so URLs and
 * predicates are unaffected by label changes.
 */
// Relative (not "@/") because this module is unit-tested with node --test, whose
// resolver doesn't understand the Vite alias for runtime (value) imports.
import { humanizeSlug } from "./humanizeSlug.ts";

export const SECTOR_LABELS: Readonly<Record<string, string>> = {
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
 * Display label for a canonical sector slug. Unknown slugs (future vocabulary
 * additions, or stale data) fall back to `humanizeSlug` so nothing renders as
 * a raw kebab-case value.
 */
export const sectorLabel = (slug: string): string =>
  SECTOR_LABELS[slug] ?? humanizeSlug(slug);
