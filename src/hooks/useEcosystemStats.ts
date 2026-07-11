import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Real ANZ ecosystem counts for the homepage hero substantiation line.
 *
 * Single source of truth: backed by the `get_ecosystem_stats()` Postgres RPC
 * (one round-trip, correct public filters applied server-side). Counts change
 * slowly, so the result is cached aggressively.
 *
 * Never-zero guarantee: consumers should render a skeleton (or nothing) until
 * `isReady` is true. While loading or on error, `stats` is `null` and `isReady`
 * is `false` — the hero must never display a literal `0` or a fabricated number.
 */
export interface EcosystemStats {
  serviceProviders: number;
  mentors: number;
  investors: number;
  accelerators: number;
  leadDatabases: number;
  events: number;
  guides: number;
}

const STAT_KEYS: (keyof EcosystemStats)[] = [
  "serviceProviders",
  "mentors",
  "investors",
  "accelerators",
  "leadDatabases",
  "events",
  "guides",
];

// Core counts that must be > 0 for the hero substantiation line to be credible.
// If any of these is missing/zero we withhold the whole payload (skeleton stays).
const REQUIRED_KEYS: (keyof EcosystemStats)[] = [
  "serviceProviders",
  "mentors",
  "investors",
];

export const ECOSYSTEM_STATS_QUERY_KEY = ["ecosystem-stats"] as const;

const toCount = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

export const fetchEcosystemStats = async (): Promise<EcosystemStats> => {
  // `get_ecosystem_stats` is an RPC, not in the auto-generated types — cast.
  const { data, error } = await (supabase as any).rpc("get_ecosystem_stats");
  if (error) throw error;

  const row = (data ?? {}) as Record<string, unknown>;
  return STAT_KEYS.reduce((acc, key) => {
    acc[key] = toCount(row[key]);
    return acc;
  }, {} as EcosystemStats);
};

/**
 * Shared react-query hook. Both `useEcosystemStats` and the legacy
 * `useHeroStats` adapter consume this so the homepage makes a single request.
 */
export const useEcosystemStatsQuery = () =>
  useQuery({
    queryKey: ECOSYSTEM_STATS_QUERY_KEY,
    queryFn: fetchEcosystemStats,
    staleTime: 30 * 60 * 1000, // 30 min — counts change slowly
    gcTime: 60 * 60 * 1000,
  });

export interface UseEcosystemStatsResult {
  /** Verified counts, or `null` until ready. Never contains a zeroed core count. */
  stats: EcosystemStats | null;
  isLoading: boolean;
  /** True only once loaded AND the core counts (providers, mentors, investors) are all > 0. */
  isReady: boolean;
}

export const useEcosystemStats = (): UseEcosystemStatsResult => {
  const { data, isLoading } = useEcosystemStatsQuery();

  const isReady = !!data && REQUIRED_KEYS.every((key) => data[key] > 0);

  return {
    stats: isReady ? data! : null,
    isLoading,
    isReady,
  };
};
