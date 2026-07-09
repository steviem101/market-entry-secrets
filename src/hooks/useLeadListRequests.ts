import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// lead_list_requests is NOT in the auto-generated types yet — use the established
// (supabase as any) pattern (mirrors useLeadDatabases / reportApi). RLS scopes
// reads to the owner (+ admin) and inserts to the owner, so no user_id filter is
// needed on the query — the policy enforces it.
const table = () => (supabase as any).from('lead_list_requests');

export type LeadListRequestStatus = 'new' | 'in_progress' | 'delivered' | 'declined';

export interface LeadListRequest {
  id: string;
  report_id: string | null;
  request_text: string;
  status: LeadListRequestStatus;
  delivered_database_id: string | null;
  created_at: string;
}

/** The signed-in member's own custom lead-list requests, newest first. */
export const useMyLeadListRequests = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['lead-list-requests', user?.id],
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<LeadListRequest[]> => {
      const { data, error } = await table()
        .select('id, report_id, request_text, status, delivered_database_id, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as LeadListRequest[];
    },
  });
};

/** Submit a custom lead-list request tied (optionally) to the report it came from. */
export const useCreateLeadListRequest = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ requestText, reportId }: { requestText: string; reportId?: string | null }) => {
      if (!user?.id) throw new Error('Please sign in to request a list.');
      const text = (requestText || '').trim();
      if (!text) throw new Error('Please describe the list you need.');
      const { data, error } = await table()
        .insert({ user_id: user.id, report_id: reportId ?? null, request_text: text.slice(0, 2000) })
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lead-list-requests'] }),
  });
};
