import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HeroStatCount {
  serviceProviders: number;
  communityMembers: number;
  events: number;
  leads: number;
  guides: number;
  investors: number;
  accelerators: number;
}

const fetchHeroCounts = async (): Promise<HeroStatCount> => {
  const [
    spResult,
    cmResult,
    evResult,
    leadsResult,
    guidesResult,
    investorsResult,
    acceleratorsResult,
  ] = await Promise.all([
    supabase.from("service_providers").select("*", { count: "exact", head: true }),
    supabase.from("community_members").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("content_items")
      .select("*", { count: "exact", head: true })
      .eq("content_type", "guide"),
    supabase.from("investors").select("*", { count: "exact", head: true }),
    supabase
      .from("investors")
      .select("*", { count: "exact", head: true })
      .eq("investor_type", "accelerator"),
  ]);

  return {
    serviceProviders: spResult.count ?? 0,
    communityMembers: cmResult.count ?? 0,
    events: evResult.count ?? 0,
    leads: leadsResult.count ?? 0,
    guides: guidesResult.count ?? 0,
    investors: investorsResult.count ?? 0,
    accelerators: acceleratorsResult.count ?? 0,
  };
};

export const useHeroStats = () => {
  return useQuery({
    queryKey: ["hero-stats"],
    queryFn: fetchHeroCounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};
