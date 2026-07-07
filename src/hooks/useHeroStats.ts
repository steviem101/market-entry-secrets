import { useEcosystemStatsQuery } from "./useEcosystemStats";

/**
 * Homepage stat counts (consumed by ProofStrip), single-sourced from the
 * `get_ecosystem_stats()` RPC via `useEcosystemStatsQuery` (one request
 * shared with `useEcosystemStats`).
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
