import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * T14 (MES-188) — the one report-section refinement path. A member refines a
 * matched section (structured reasons + free text); we act on it. Mirrors
 * useCreateLeadListRequest; RLS scopes the insert to the owner. The
 * report_section_feedback table isn't in the generated types yet, so we cast the
 * client through a minimal typed surface (avoids `any` — same shape as
 * analytics/intakeFunnel) until types regenerate.
 */
interface FeedbackInsertRow {
  user_id: string;
  report_id: string | null;
  section_key: string;
  reason_tags: string[];
  note: string | null;
}
interface MinimalInsertClient {
  from: (table: string) => {
    insert: (row: FeedbackInsertRow) => {
      select: (cols: string) => {
        single: () => PromiseLike<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };
}

export const useCreateReportSectionFeedback = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      sectionKey, reasonTags, note, reportId,
    }: { sectionKey: string; reasonTags: string[]; note?: string; reportId?: string | null }) => {
      if (!user?.id) throw new Error('Please sign in to send feedback.');
      const tags = (reasonTags || []).filter(Boolean).slice(0, 8);
      const text = (note || '').trim().slice(0, 2000);
      if (tags.length === 0 && !text) throw new Error('Pick a reason or add a note.');
      const client = supabase as unknown as MinimalInsertClient;
      const { data, error } = await client
        .from('report_section_feedback')
        .insert({
          user_id: user.id,
          report_id: reportId ?? null,
          section_key: sectionKey,
          reason_tags: tags,
          note: text || null,
        })
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });
};
