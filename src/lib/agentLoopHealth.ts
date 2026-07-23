// Pure reducers for the agent-loops dashboard (tested in agentLoopHealth.test.ts).
//
// The dashboard's loop-health grid and activity chart derive from two raw sources: automation_runs
// (the run ledger) and the agent_proposals view. Keeping the shaping here (pure, deterministic)
// lets the hooks stay thin and the logic stay testable without a DOM.

export interface AgentRun {
  id: string;
  loop: string;
  started_at: string;
  finished_at: string | null;
  status: string;            // running | success | failed
  proposed: number | null;
  accepted: number | null;
  created_at: string;
}

export interface AgentProposalLite {
  loop_name: string;
  status: string;            // canonical: pending | approved | rejected | auto_approved | applied | apply_failed
  created_at: string;
}

export interface LoopHealth {
  loop_name: string;
  last_run_at: string | null;
  last_status: string | null;
  success_streak: number;    // consecutive most-recent successful runs
  pending_count: number;     // proposals awaiting review (pending)
  proposals_total: number;
  runs_only: boolean;        // ledger-only loop with no proposals branch (e.g. distill-knowledge)
}

const OPEN_STATUSES = new Set(["pending"]);

/**
 * One health row per loop that appears in EITHER runs or proposals, so a loop with proposals but
 * no ledger row (e.g. demand-mining today) still shows up rather than silently vanishing.
 *
 * `proposalCapableLoops` is the set of loop_names the agent_proposals view can emit (injected
 * from agentProposalsMeta so this module stays import-free). A ledger loop outside that set has
 * no review queue AT ALL (its ledger counters are self-applied work, e.g. distill-knowledge KB
 * cards) — the grid labels it runs-only instead of showing a misleading "Pending review: 0".
 */
export function buildLoopHealth(
  runs: AgentRun[],
  proposals: AgentProposalLite[],
  proposalCapableLoops?: ReadonlySet<string>,
): LoopHealth[] {
  const loops = new Set<string>();
  for (const r of runs) loops.add(r.loop);
  for (const p of proposals) loops.add(p.loop_name);

  const byLoopRuns = new Map<string, AgentRun[]>();
  for (const r of runs) {
    const arr = byLoopRuns.get(r.loop) ?? [];
    arr.push(r);
    byLoopRuns.set(r.loop, arr);
  }

  const result: LoopHealth[] = [];
  for (const loop of loops) {
    const loopRuns = (byLoopRuns.get(loop) ?? []).slice()
      .sort((a, b) => (b.started_at ?? "").localeCompare(a.started_at ?? ""));
    const last = loopRuns[0] ?? null;

    let streak = 0;
    for (const r of loopRuns) {
      if (r.status === "success") streak++;
      else break;
    }

    const loopProps = proposals.filter((p) => p.loop_name === loop);
    const pending = loopProps.filter((p) => OPEN_STATUSES.has(p.status)).length;

    result.push({
      loop_name: loop,
      last_run_at: last?.started_at ?? null,
      last_status: last?.status ?? null,
      success_streak: streak,
      pending_count: pending,
      proposals_total: loopProps.length,
      // Only a KNOWN non-proposal loop is runs-only; without the capability set, or for a loop
      // the view can emit (even if quiet this window), keep the normal pending-review framing.
      runs_only: proposalCapableLoops ? !proposalCapableLoops.has(loop) : false,
    });
  }
  // Most-pending first so the grid surfaces what needs review; stable tie-break by name.
  return result.sort((a, b) => b.pending_count - a.pending_count || a.loop_name.localeCompare(b.loop_name));
}

export interface LoopActivityPoint {
  loop_name: string;
  proposed: number;      // proposals created in-window
  resolved: number;      // approved + auto_approved + applied + rejected
  acceptance_rate: number; // (approved+auto_approved+applied) / resolved, 0 when none resolved
}

/** 30-day activity + acceptance rate per loop, from the proposals in the given window. */
export function buildLoopActivity(proposals: AgentProposalLite[]): LoopActivityPoint[] {
  const byLoop = new Map<string, AgentProposalLite[]>();
  for (const p of proposals) {
    const arr = byLoop.get(p.loop_name) ?? [];
    arr.push(p);
    byLoop.set(p.loop_name, arr);
  }
  const accepted = new Set(["approved", "auto_approved", "applied"]);
  const resolvedSet = new Set(["approved", "auto_approved", "applied", "rejected"]);
  const out: LoopActivityPoint[] = [];
  for (const [loop, ps] of byLoop) {
    const resolved = ps.filter((p) => resolvedSet.has(p.status)).length;
    const acc = ps.filter((p) => accepted.has(p.status)).length;
    out.push({
      loop_name: loop,
      proposed: ps.length,
      resolved,
      acceptance_rate: resolved === 0 ? 0 : acc / resolved,
    });
  }
  return out.sort((a, b) => b.proposed - a.proposed || a.loop_name.localeCompare(b.loop_name));
}
