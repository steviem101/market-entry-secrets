/**
 * Read the signed-in user's service entitlements (MES-196 / T13).
 *
 * service_entitlements is service-role-write only; clients hold an owner-scoped
 * SELECT policy (MES-195 migration), so this is a plain RLS-scoped read. The
 * table isn't in the generated Supabase types yet, so the client is cast
 * through `unknown` to a minimal typed surface (same pattern as
 * lib/analytics/intakeFunnel.ts — avoids `any`).
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { EntitlementRow } from '@/lib/sessionBooking';

interface MinimalSelectClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => PromiseLike<{ data: EntitlementRow[] | null; error: unknown }>;
    };
  };
}

export const useServiceEntitlements = () => {
  const { user } = useAuth();

  const { data: entitlements = [], isLoading: loading } = useQuery({
    queryKey: ['service-entitlements', user?.id],
    queryFn: async (): Promise<EntitlementRow[]> => {
      const client = supabase as unknown as MinimalSelectClient;
      const { data, error } = await client
        .from('service_entitlements')
        .select('kind, granted_count, consumed_count, expires_at')
        .eq('user_id', user!.id);
      if (error) return [];
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  return { entitlements, loading };
};
