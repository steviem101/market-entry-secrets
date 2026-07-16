import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { LeadDatabase, LeadDatabaseRecord } from "@/types/leadDatabase";

// lead_databases is NOT in auto-generated types — use (supabase as any) pattern
const leadDatabasesTable = () => (supabase as any).from('lead_databases');
const leadDatabaseRecordsTable = () => (supabase as any).from('lead_database_records');
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- lead_database_purchases not in generated types (file convention above)
const leadDatabasePurchasesTable = () => (supabase as any).from('lead_database_purchases');

export const useLeadDatabases = () => {
  return useQuery({
    queryKey: ['lead-databases'],
    queryFn: async () => {
      const { data, error } = await leadDatabasesTable()
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as LeadDatabase[];
    },
  });
};

export const useLeadDatabaseBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['lead-database', slug],
    queryFn: async () => {
      const { data, error } = await leadDatabasesTable()
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as LeadDatabase;
    },
    enabled: !!slug,
  });
};

export const useRelatedLeadDatabases = (id: string, sector: string | null) => {
  return useQuery({
    queryKey: ['related-lead-databases', id, sector],
    queryFn: async () => {
      const { data, error } = await leadDatabasesTable()
        .select('*')
        .eq('status', 'active')
        .eq('sector', sector)
        .neq('id', id)
        .limit(3);

      if (error) throw error;
      return data as LeadDatabase[];
    },
    enabled: !!id && !!sector,
  });
};

export const useLeadDatabaseStats = () => {
  return useQuery({
    queryKey: ['lead-database-stats'],
    queryFn: async () => {
      const { data, error } = await leadDatabasesTable()
        .select('list_type, record_count')
        .eq('status', 'active');

      if (error) throw error;

      const items = data as Pick<LeadDatabase, 'list_type' | 'record_count'>[];
      const totalDatabases = items.length;
      const totalRecords = items.reduce((sum, item) => sum + (item.record_count || 0), 0);

      const countsByType: Record<string, number> = {};
      items.forEach(item => {
        const type = item.list_type || 'Other';
        countsByType[type] = (countsByType[type] || 0) + 1;
      });

      return {
        totalDatabases,
        totalRecords,
        countsByType,
      };
    },
  });
};

export const useLeadDatabaseRecords = (leadDatabaseId: string, options?: { full?: boolean }) => {
  const full = options?.full ?? false;
  return useQuery({
    queryKey: ['lead-database-records', leadDatabaseId, full ? 'full' : 'preview'],
    queryFn: async () => {
      // Preview: the 5 masked sample rows anyone may see (is_preview=true).
      // Full: the buyer's complete list. The buyer-scoped RLS on
      // lead_database_records (restore_lead_database_purchases / MES-198) only
      // returns non-preview rows to a user who holds a lead_database_purchases
      // entitlement, so a non-owner requesting `full` silently gets nothing —
      // the gate is server-side, this flag just widens what we ask for.
      const base = leadDatabaseRecordsTable().select('*').eq('lead_database_id', leadDatabaseId);
      const q = full
        ? base.order('company_name', { ascending: true }).limit(1000)
        : base.eq('is_preview', true).limit(5);
      const { data, error } = await q;

      if (error) throw error;
      return data as LeadDatabaseRecord[];
    },
    enabled: !!leadDatabaseId,
  });
};

/**
 * Whether the signed-in user has access to a lead database's full records
 * (MES-198 / T7 D-B) — i.e. holds a lead_database_purchases entitlement, whether
 * bought directly or auto-delivered with a Scale/Enterprise report. The read is
 * owner-scoped by RLS ("Users view own purchases"); the explicit user_id filter
 * keeps the query tight. Returns false for anon/non-owners.
 */
export const useLeadDatabaseAccess = (leadDatabaseId: string) => {
  const { user } = useAuth();
  const { data: hasAccess = false, isLoading } = useQuery({
    queryKey: ['lead-database-access', leadDatabaseId, user?.id],
    queryFn: async () => {
      const { data, error } = await leadDatabasePurchasesTable()
        .select('id')
        .eq('lead_database_id', leadDatabaseId)
        .eq('user_id', user!.id)
        .limit(1);
      if (error) return false;
      return (data?.length ?? 0) > 0;
    },
    enabled: !!leadDatabaseId && !!user,
    staleTime: 2 * 60 * 1000,
  });
  // `loading` is true ONLY while a signed-in user's access query is genuinely in
  // flight — never for anon (the query is disabled, so there's nothing to wait
  // for and the page should render the sales flow immediately). The detail page
  // gates on this so a real owner never flashes the "Buy Now" hero before the
  // access check resolves (version-robust: doesn't rely on how react-query
  // reports isLoading for a disabled query).
  return { hasAccess, loading: !!user && isLoading };
};
