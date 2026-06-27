import { useEcosystemStatsQuery } from "./useEcosystemStats";

/**
 * Legacy shape consumed by the per-persona hero stat cards (HeroStatsRow).
 * Kept intentionally identical so the Lovable-owned component does not change.
 * Now single-sourced from the `get_ecosystem_stats()` RPC via
 * `useEcosystemStatsQuery` (one request shared with `useEcosystemStats`).
 */
interface HeroStatCount {
  serviceProviders: number;
  communityMembers: number;
  events: number;
  leads: number;
  guides: number;
  investors: number;
  accelerators: number;
}

export const useHeroStats = () => {
  const { data, isLoading, isError } = useEcosystemStatsQuery();

  const mapped: HeroStatCount | undefined = data
    ? {
        serviceProviders: data.serviceProviders,
        communityMembers: data.mentors,
        events: data.events,
        leads: data.leadDatabases,
        guides: data.guides,
        investors: data.investors,
        accelerators: data.accelerators,
      }
    : undefined;

  return { data: mapped, isLoading, isError };
};
