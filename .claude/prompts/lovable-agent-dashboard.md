# Lovable handoff: Agent Loops dashboard (`/admin/agents`)

> Written by the agent-loops session (Claude Code). CC has built the data layer, edge functions,
> and migrations. **This prompt is for Lovable to build the page shell + presentational UI only.**
> Ownership: Lovable owns `src/pages/` and `src/components/ui/`. Do NOT edit `src/hooks/`,
> `src/lib/`, or `supabase/functions/` — those are done and imported below.

## What this page is

An admin surface at `/admin/agents` to see what every self-improving agent loop has been doing and
to bulk approve or reject its pending proposals. It is the backstop for missed Slack notifications:
the dashboard and Slack share one apply path, so a proposal resolved in either place reflects in both.

## Route + gating (add to `src/App.tsx`, lazy, admin-gated)

- Add a lazy route `/admin/agents` rendering a new `src/pages/AdminAgents.tsx` (mirror how
  `/admin/mentors` / `AdminMentors` is registered: `React.lazy` + `Suspense`, no extra `<Layout>`).
- Gate on admin the same way the other admin pages do (`useAuth()` -> `isAdmin()`; redirect or an
  "admins only" state for non-admins). The underlying data is already RLS-admin-only, so a non-admin
  sees empty data even if the route renders.

## Data hooks CC has already built (import and use as-is)

```ts
// Loop-health grid + 30-day activity (derived, last 30 days)
import { useAgentLoopHealth } from "@/hooks/useAgentRuns";
//   -> { data: { health: LoopHealth[], activity: LoopActivityPoint[] }, isLoading, error }
//   LoopHealth       = { loop_name, last_run_at, last_status, success_streak, pending_count, proposals_total }
//   LoopActivityPoint= { loop_name, proposed, resolved, acceptance_rate }  // acceptance_rate is 0..1

// Run history (optional detail table)
import { useAgentRuns } from "@/hooks/useAgentRuns";
//   useAgentRuns({ loop?, limit? }) -> { data: AgentRun[], ... }

// Proposals queue (filtered + paginated)
import { useAgentProposals } from "@/hooks/useAgentProposals";
//   useAgentProposals({ status?, loop?, source?, page?, pageSize? })
//     -> { data: { rows: AgentProposal[], count: number }, isLoading, error }
//   AgentProposal = { proposal_key, source_table, id, run_id, loop_name, action_type, target_table,
//                     target_id, payload, reason, confidence, status, reviewed_at, applied_at, created_at }
//   status is canonical: pending | approved | rejected | auto_approved | applied | apply_failed

// Mutations (approve / reject / retry) — go through the agent-actions edge fn, never a table write
import { useAgentProposalActions } from "@/hooks/useAgentProposals";
//   const { approve, reject, retry } = useAgentProposalActions();
//   approve.mutate(proposalKeys: string[]);  // same for reject / retry
//   Each resolves to { action, ok, total, results: [{ proposal_key, ok, applied?, error? }] }
```

`MAX_BULK` (100) is exported from `@/lib/api/agentApi` — use it for the selection cap.

## Sections to build

1. **Loop health grid** — one card per `health[]` row: `loop_name`, last run time (relative), a
   status pill (`last_status`: success/failed/running/none), `success_streak`, and a
   `pending_count` badge. Cards with pending > 0 sort first (already sorted by the hook).
2. **Proposals queue** — a table over `useAgentProposals`:
   - Filter controls: status, loop, source (each with an "all" default). Reset page to 0 on change.
   - Columns: checkbox, loop, action_type, reason, status pill, created_at (relative). Row expands
     to show `payload` as pretty JSON and `target_table`/`target_id`.
   - Pagination using `count` and `pageSize` (default 25).
   - **Bulk actions:** per-row Approve/Reject, plus checkbox selection with a "select all filtered"
     control. Selection capped at `MAX_BULK` (100). A confirmation modal shows the count and the
     distinct `action_type`s being approved/rejected. On result, report per-row success and failure
     (the response `results[]` carries `{ ok, error }` per key) — a partial failure must NOT be
     shown as a clean success; surface which rows failed and why.
   - Retry button shown only on `apply_failed` rows.
3. **30-day activity chart** — from `activity[]`: proposals per loop and acceptance rate. A simple
   bar or grouped bar is fine; keep it readable at 390px.
4. **States** — explicit empty (no proposals / no runs), loading (skeletons), and error (with a
   retry) states for every section. The loop-health grid must render even when a loop has runs but
   zero proposals (and vice-versa) — the hook already returns those rows.

## Constraints (MES house rules)

- **390px mobile-first**; wide tables/charts scroll inside their own `overflow-x:auto` container,
  never the page body.
- **HSL semantic tokens only** (shadcn + `--mes-*`); no hardcoded palette colours.
- **shadcn/ui** components (`Card`, `Table`, `Badge`, `Dialog`, `Checkbox`, `Select`, `Button`,
  `Skeleton`, `Tabs`). Toasts via `useToast`/`sonner`.
- **Australian English** in all copy ("personalised", "organised", "recognised").
- **No em dashes or en dashes** in any UI copy — use commas, colons, or parentheses.
- Read-only + mutations only through the imported hooks; **no direct Supabase table writes** from
  the page.

## Acceptance

- `/admin/agents` renders the grid, queue, and chart for an admin; non-admins do not see the data.
- Selecting up to 100 mixed proposals and clicking Approve shows a confirm modal, calls
  `approve.mutate(keys)`, and reports per-row success/failure.
- Approving a `content-refresh` `archive_event` proposal moves it to `applied` (agent-actions ->
  apply-proposal archives the event); the queue refreshes to reflect it.
