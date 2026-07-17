/**
 * Concierge intro requests (MES-188 T9).
 *
 * A paid member requests a human-facilitated mentor/ecosystem introduction drawn
 * from their D4 allowance. The SERVER enforces the cap (check_concierge_intro_
 * capacity blocks over-requests; fulfil_concierge_intro + the CHECK constraint
 * enforce consumption) — this hook just reads the member's own requests + exposes
 * client-side availability for the UI's "N left" / disabled state.
 *
 * concierge_intro_requests isn't in the generated Supabase types yet, so the
 * client is cast through `unknown` to a minimal typed surface (same pattern as
 * useServiceEntitlements / intakeFunnel — avoids `any`). RLS scopes reads/inserts
 * to the owner, so no user_id filter is needed on the query.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import {
  availableToRequest, canRequestIntro, type IntroKind,
} from '@/lib/conciergeIntros';

export type ConciergeIntroStatus = 'new' | 'in_progress' | 'delivered' | 'declined';

export interface ConciergeIntroRequest {
  id: string;
  report_id: string | null;
  intro_kind: IntroKind;
  target_entity_type: 'mentor' | 'ecosystem' | null;
  target_entity_id: string | null;
  request_text: string | null;
  status: ConciergeIntroStatus;
  entitlement_id: string | null;
  created_at: string;
}

interface ConciergeInsert {
  user_id: string;
  report_id: string | null;
  intro_kind: IntroKind;
  target_entity_type: 'mentor' | 'ecosystem' | null;
  target_entity_id: string | null;
  request_text: string | null;
}

interface MinimalConciergeClient {
  from: (table: string) => {
    select: (columns: string) => {
      order: (
        column: string,
        opts: { ascending: boolean },
      ) => PromiseLike<{ data: ConciergeIntroRequest[] | null; error: unknown }>;
    };
    insert: (row: ConciergeInsert) => {
      select: (columns: string) => {
        single: () => PromiseLike<{ data: { id: string } | null; error: unknown }>;
      };
    };
  };
}

const client = () => supabase as unknown as MinimalConciergeClient;
const TABLE = 'concierge_intro_requests';

/** The signed-in member's own concierge intro requests, newest first. */
export const useMyConciergeIntros = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['concierge-intros', user?.id],
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    queryFn: async (): Promise<ConciergeIntroRequest[]> => {
      const { data, error } = await client()
        .from(TABLE)
        .select('id, report_id, intro_kind, target_entity_type, target_entity_id, request_text, status, entitlement_id, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export interface RequestIntroInput {
  introKind: IntroKind;
  targetEntityType: 'mentor' | 'ecosystem';
  targetEntityId?: string | null;
  requestText?: string | null;
  reportId?: string | null;
}

/** File a concierge intro request. The server capacity trigger is the real gate;
 *  the UI should still pre-check availability so it never invites a blocked ask. */
export const useRequestConciergeIntro = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: RequestIntroInput) => {
      if (!user?.id) throw new Error('Please sign in to request an introduction.');
      const { data, error } = await client()
        .from(TABLE)
        .insert({
          user_id: user.id,
          report_id: input.reportId ?? null,
          intro_kind: input.introKind,
          target_entity_type: input.targetEntityType,
          target_entity_id: input.targetEntityId ?? null,
          request_text: (input.requestText ?? '').trim().slice(0, 2000) || null,
        })
        .select('id')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['concierge-intros'] });
      qc.invalidateQueries({ queryKey: ['service-entitlements'] });
    },
  });
};

/**
 * Convenience view combining entitlements + open requests into per-kind
 * availability for the request UI. `nowMs` defaults to Date.now() (the component
 * layer — the pure maths in lib/conciergeIntros takes it explicitly for testing).
 */
export const useConciergeIntroAvailability = () => {
  const { entitlements } = useServiceEntitlements();
  const { data: requests = [], isLoading } = useMyConciergeIntros();
  const nowMs = Date.now();
  return {
    requests,
    isLoading,
    availableFor: (kind: IntroKind) => availableToRequest(entitlements, requests, kind, nowMs),
    canRequest: (kind: IntroKind) => canRequestIntro(entitlements, requests, kind, nowMs),
  };
};
