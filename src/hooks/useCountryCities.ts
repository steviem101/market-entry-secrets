import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCountryCities = (citySlugs: string[] | undefined) => {
  return useQuery({
    queryKey: ["country-cities", citySlugs],
    queryFn: async () => {
      if (!citySlugs?.length) return [];

      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .in("slug", citySlugs);

      if (error) throw error;

      const order = new Map(citySlugs.map((s, i) => [s, i]));
      return (data || []).slice().sort((a: any, b: any) => {
        const ai = order.get(a.slug) ?? 999;
        const bi = order.get(b.slug) ?? 999;
        return ai - bi;
      });
    },
    enabled: !!citySlugs?.length,
    staleTime: 30 * 60 * 1000,
  });
};
