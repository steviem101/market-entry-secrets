import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CountryPlaybookStage } from "@/lib/countryPageContent";

export const useCountryPlaybook = (countryId: string | undefined) => {
  return useQuery({
    queryKey: ["country-playbook", countryId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("country_playbook_stages")
        .select("*")
        .eq("country_id", countryId)
        .order("stage_number", { ascending: true });

      if (error) throw error;
      return (data as CountryPlaybookStage[]) ?? [];
    },
    enabled: !!countryId,
    staleTime: 30 * 60 * 1000,
  });
};
