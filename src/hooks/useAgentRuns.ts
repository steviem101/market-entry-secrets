// useAgentRuns — reads the automation_runs ledger (admin-only via RLS) for the dashboard's run
// history and the loop-health grid / activity chart. Read-only. automation_runs is absent from the
// generated types, so the (supabase as any) cast is deliberate.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  buildLoopHealth, buildLoopActivity, type AgentRun, type AgentProposalLite,
  type LoopHealth, type LoopActivityPoint,
} from "@/lib/agentLoopHealth";
import { LOOP_OPTIONS } from "@/lib/agentProposalsMeta";

// Loops the agent_proposals view can emit. A ledger loop outside this set is runs-only
// (no review queue), which the health grid labels honestly instead of "Pending review: 0".
const PROPOSAL_CAPABLE_LOOPS: ReadonlySet<string> = new Set(LOOP_OPTIONS);

export interface UseAgentRunsOptions {
  loop?: string;      // filter to one loop_name, or "all"
  limit?: number;     // default 50
}

export function useAgentRuns(opts: UseAgentRunsOptions = {}) {
  const { loop = "all", limit = 50 } = opts;
  return useQuery({
    queryKey: ["agent-runs", loop, limit],
    queryFn: async (): Promise<AgentRun[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- automation_runs is absent from generated types (documented cast pattern)
      let query = (supabase as any)
        .from("automation_runs")
        .select("id,loop,started_at,finished_at,status,proposed,accepted,created_at")
        .order("started_at", { ascending: false })
        .limit(limit);
      if (loop !== "all") query = query.eq("loop", loop);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as AgentRun[];
    },
  });
}

const WINDOW_DAYS = 30;

/**
 * Loop-health grid + 30-day activity, derived from the last 30 days of runs and proposals via the
 * pure reducers. One query per source; shaping is pure and tested (agentLoopHealth.test.ts).
 */
export function useAgentLoopHealth() {
  return useQuery({
    queryKey: ["agent-loop-health"],
    queryFn: async (): Promise<{ health: LoopHealth[]; activity: LoopActivityPoint[] }> => {
      const sinceISO = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- automation_runs is absent from generated types (documented cast pattern)
      const runsQ = (supabase as any)
        .from("automation_runs")
        .select("id,loop,started_at,finished_at,status,proposed,accepted,created_at")
        .gte("started_at", sinceISO)
        .order("started_at", { ascending: false })
        .limit(1000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- agent_proposals view is absent from generated types (documented cast pattern)
      const propsQ = (supabase as any)
        .from("agent_proposals")
        .select("loop_name,status,created_at")
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false }) // deterministic slice if the window exceeds the cap
        .limit(1000);

      const [{ data: runs, error: rErr }, { data: props, error: pErr }] = await Promise.all([runsQ, propsQ]);
      if (rErr) throw rErr;
      if (pErr) throw pErr;

      const runsData = (runs ?? []) as AgentRun[];
      const propsData = (props ?? []) as AgentProposalLite[];
      return { health: buildLoopHealth(runsData, propsData, PROPOSAL_CAPABLE_LOOPS), activity: buildLoopActivity(propsData) };
    },
  });
}
