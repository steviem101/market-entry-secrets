// useAgentProposals — reads the unified agent_proposals view (admin-only via RLS), filtered and
// paginated, for the dashboard's proposals queue. Read-only; mutations go through agentApi ->
// agent-actions. The view/tables are absent from the generated types, so the (supabase as any)
// cast is used deliberately (same pattern as reportApi.ts).

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { approveProposals, rejectProposals, retryProposals } from "@/lib/api/agentApi";

export interface AgentProposal {
  proposal_key: string;
  source_table: string;
  id: string;
  run_id: string | null;
  loop_name: string;
  action_type: string;
  target_table: string | null;
  target_id: string | null;
  payload: Record<string, unknown> | null;
  reason: string;
  confidence: number | null;
  status: string;
  reviewed_at: string | null;
  applied_at: string | null;
  created_at: string;
}

export interface UseAgentProposalsOptions {
  status?: string;      // canonical status, or "all"
  loop?: string;        // loop_name, or "all"
  source?: string;      // source_table, or "all"
  page?: number;        // 0-based
  pageSize?: number;    // default 25
}

const DEFAULT_PAGE_SIZE = 25;

export function useAgentProposals(opts: UseAgentProposalsOptions = {}) {
  const { status = "all", loop = "all", source = "all", page = 0, pageSize = DEFAULT_PAGE_SIZE } = opts;

  return useQuery({
    queryKey: ["agent-proposals", status, loop, source, page, pageSize],
    queryFn: async (): Promise<{ rows: AgentProposal[]; count: number }> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- agent_proposals view is absent from generated types (documented cast pattern)
      let query = (supabase as any)
        .from("agent_proposals")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (status !== "all") query = query.eq("status", status);
      if (loop !== "all") query = query.eq("loop_name", loop);
      if (source !== "all") query = query.eq("source_table", source);

      const { data, error, count } = await query;
      if (error) throw error;
      return { rows: (data ?? []) as AgentProposal[], count: count ?? 0 };
    },
  });
}

/** Mutations invalidate the proposals + loop-health caches so the queue reflects the new state. */
export function useAgentProposalActions() {
  const qc = useQueryClient();
  const onSettled = () => {
    qc.invalidateQueries({ queryKey: ["agent-proposals"] });
    qc.invalidateQueries({ queryKey: ["agent-loop-health"] });
    qc.invalidateQueries({ queryKey: ["agent-runs"] });
  };

  const approve = useMutation({ mutationFn: (keys: string[]) => approveProposals(keys), onSettled });
  const reject = useMutation({ mutationFn: (keys: string[]) => rejectProposals(keys), onSettled });
  const retry = useMutation({ mutationFn: (keys: string[]) => retryProposals(keys), onSettled });

  return { approve, reject, retry };
}
