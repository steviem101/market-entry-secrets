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
  content_company_profiles?: CaseStudyProfile[] | null;
}

/**
 * Filter + sort case studies from the shared filter values. Expected keys:
 *   search, outcome, industry, country, revenue, costs, sort
 * (`sort` ∈ recent | views | alphabetical). Returns a new array; input is not
 * mutated (recent order is assumed already applied by the query).
 */
export function filterAndSortCaseStudies<T extends CaseStudyLike>(
  caseStudies: T[],
  filters: FilterValues,
): T[] {
  const search = (filters.search ?? "").toLowerCase().trim();
  const {
    outcome = "all",
    industry = "all",
    country = "all",
    revenue = "all",
    costs = "all",
    sort = "recent",
  } = filters;

  const filtered = caseStudies.filter((cs) => {
    const profile = cs.content_company_profiles?.[0];

    const matchesSearch =
      search === "" ||
      cs.title.toLowerCase().includes(search) ||
      (cs.subtitle ?? "").toLowerCase().includes(search) ||
      (profile?.company_name ?? "").toLowerCase().includes(search);

    const matchesOutcome = outcome === "all" || profile?.outcome === outcome;
    const matchesIndustry = industry === "all" || profile?.industry === industry;
    const matchesCountry = country === "all" || profile?.origin_country === country;
    const matchesRevenue = matchesRevenueRange(profile?.monthly_revenue, revenue);
    const matchesCosts = matchesCostsRange(profile?.startup_costs, costs);

    return matchesSearch && matchesOutcome && matchesIndustry && matchesCountry && matchesRevenue && matchesCosts;
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
