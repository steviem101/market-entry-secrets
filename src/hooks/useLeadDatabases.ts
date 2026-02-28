import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LeadDatabase, LeadDatabaseRecord } from "@/types/leadDatabase";

// lead_databases is NOT in auto-generated types — use (supabase as any) pattern
const leadDatabasesTable = () => (supabase as any).from('lead_databases');
const leadDatabaseRecordsTable = () => (supabase as any).from('lead_database_records');

export const useLeadDatabases = () => {
  return useQuery({
    queryKey: ['lead-databases'],
    queryFn: async () => {
      const { data, error } = await leadDatabasesTable()
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

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

export const useLeadDatabaseRecords = (leadDatabaseId: string) => {
  return useQuery({
    queryKey: ['lead-database-records', leadDatabaseId],
    queryFn: async () => {
      const { data, error } = await leadDatabaseRecordsTable()
        .select('*')
        .eq('lead_database_id', leadDatabaseId)
        .eq('is_preview', true)
        .limit(5);

      if (error) throw error;
      return data as LeadDatabaseRecord[];
    },
    enabled: !!leadDatabaseId,
  });
};
