/**
 * Pure filter/sort logic for the Case Studies directory — React-free so it can
 * be unit-tested with `node --test`. Extracted from CaseStudies.tsx during the
 * MES-96 migration to the shared DirectoryFilterBar.
 */
import type { FilterValues } from "@/lib/directoryFilters";

/** Parse a "$1,234" style money string to a number; null/blank → 0. */
export const parseMoneyToNumber = (value: string | null | undefined): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/[$,]/g, "")) || 0;
};

/**
 * Outcome semantics (2026-07-14 filter bar consistency sweep). The DB column
 * carries more than a boolean: `scaling`, `ipo` and `acquired` are POSITIVE
 * outcomes and must never render as "Failure". Tabs and stats stay binary —
 * every positive outcome counts as a success; only `unsuccessful` is a failure;
 * NULL/unknown outcomes get no badge and only appear under "All".
 */
export const POSITIVE_OUTCOMES: readonly string[] = ["successful", "scaling", "ipo", "acquired"];

export const isPositiveOutcome = (outcome: string | null | undefined): boolean =>
  outcome != null && POSITIVE_OUTCOMES.includes(outcome);

export const isFailureOutcome = (outcome: string | null | undefined): boolean =>
  outcome === "unsuccessful";

/** Badge copy per outcome value; values without a label render no badge. */
export const OUTCOME_LABELS: Readonly<Record<string, string>> = {
  successful: "Success",
  scaling: "Scaling",
  ipo: "IPO",
  acquired: "Acquired",
  unsuccessful: "Failure",
};

export type OutcomeTone = "positive" | "negative";

/** Presentation tone for an outcome; null → render nothing. */
export function outcomeTone(outcome: string | null | undefined): OutcomeTone | null {
  if (isPositiveOutcome(outcome)) return "positive";
  if (isFailureOutcome(outcome)) return "negative";
  return null;
}

/** The "no range selected" sentinels — either the standard default or the legacy one. */
const isUnfiltered = (range: string) => range === "all" || range === "any";

export const matchesRevenueRange = (revenue: string | null | undefined, range: string): boolean => {
  if (isUnfiltered(range)) return true;
  const amount = parseMoneyToNumber(revenue);
  switch (range) {
    case "0-10k": return amount >= 0 && amount <= 10000;
    case "10k-50k": return amount > 10000 && amount <= 50000;
    case "50k-100k": return amount > 50000 && amount <= 100000;
    case "100k+": return amount > 100000;
    default: return true;
  }
};

export const matchesCostsRange = (costs: string | null | undefined, range: string): boolean => {
  if (isUnfiltered(range)) return true;
  const amount = parseMoneyToNumber(costs);
  switch (range) {
    case "0-25k": return amount >= 0 && amount <= 25000;
    case "25k-75k": return amount > 25000 && amount <= 75000;
    case "75k-150k": return amount > 75000 && amount <= 150000;
    case "150k+": return amount > 150000;
    default: return true;
  }
};

/** Range option lists for the advanced-panel selects. */
export const REVENUE_RANGES = [
  { value: "all", label: "Any Amount" },
  { value: "0-10k", label: "$0 - $10K" },
  { value: "10k-50k", label: "$10K - $50K" },
  { value: "50k-100k", label: "$50K - $100K" },
  { value: "100k+", label: "$100K+" },
];

export const COST_RANGES = [
  { value: "all", label: "Any Amount" },
  { value: "0-25k", label: "$0 - $25K" },
  { value: "25k-75k", label: "$25K - $75K" },
  { value: "75k-150k", label: "$75K - $150K" },
  { value: "150k+", label: "$150K+" },
];

interface CaseStudyProfile {
  company_name?: string | null;
  industry?: string | null;
  origin_country?: string | null;
  outcome?: string | null;
  monthly_revenue?: string | null;
  startup_costs?: string | null;
}

export interface CaseStudyLike {
  title: string;
  subtitle?: string | null;
  view_count?: number | null;
  /** Canonical MES-110 sector slugs on the case-study content_item (MES-177 B3). */
  sector_tags?: string[] | null;
  content_company_profiles?: CaseStudyProfile[] | null;
}

/**
 * Filter + sort case studies from the shared filter values. Expected keys:
 *   search, outcome, sector, country, revenue, costs, sort
 * (`sort` ∈ recent | views | alphabetical). Returns a new array; input is not
 * mutated (recent order is assumed already applied by the query).
 *
 * MES-177 B3: the facet is canonical `sector_tags` (not the free-text
 * `content_company_profiles.industry`, which stays searchable via `search`).
 */
export function filterAndSortCaseStudies<T extends CaseStudyLike>(
  caseStudies: T[],
  filters: FilterValues,
): T[] {
  const search = (filters.search ?? "").toLowerCase().trim();
  const {
    outcome = "all",
    sector = "all",
    country = "all",
    revenue = "all",
    costs = "all",
    sort = "recent",
  } = filters;

  const filtered = caseStudies.filter((cs) => {
    const profile = cs.content_company_profiles?.[0];

    // Free-text industry stays searchable even though it is no longer a facet.
    const matchesSearch =
      search === "" ||
      cs.title.toLowerCase().includes(search) ||
      (cs.subtitle ?? "").toLowerCase().includes(search) ||
      (profile?.company_name ?? "").toLowerCase().includes(search) ||
      (profile?.industry ?? "").toLowerCase().includes(search);

    // The "successful" tab groups every positive outcome (scaling/ipo/acquired
    // included); other values (unsuccessful, or a direct ?outcome=scaling deep
    // link) match by equality.
    const matchesOutcome =
      outcome === "all" ||
      (outcome === "successful" ? isPositiveOutcome(profile?.outcome) : profile?.outcome === outcome);
    const matchesSector = sector === "all" || (cs.sector_tags ?? []).includes(sector);
    const matchesCountry = country === "all" || profile?.origin_country === country;
    const matchesRevenue = matchesRevenueRange(profile?.monthly_revenue, revenue);
    const matchesCosts = matchesCostsRange(profile?.startup_costs, costs);

    return matchesSearch && matchesOutcome && matchesSector && matchesCountry && matchesRevenue && matchesCosts;
  });

  const sorted = [...filtered];
  switch (sort) {
    case "views":
      sorted.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      break;
    case "alphabetical":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    // "recent" — query already returns publish_date DESC; keep as-is.
  }
  return sorted;
}
