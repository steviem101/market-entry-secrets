// apply-proposal — the SINGLE production writer for the MES agent loops.
//
// Given a set of proposal_keys, it loads each agent_content_proposals row, plans the mutation
// (planApply, pure + whitelisted + COALESCE-protected), applies it with the service role, and
// stamps applied_at / status. It NEVER writes production from anywhere else, and it reports a
// per-row {ok,error} result so a bulk apply can never silently drop a row.
//
// Auth (either):
//   • admin JWT (requireAdmin) — direct dashboard / manual use, OR
//   • x-internal-secret == APPLY_PROPOSAL_SECRET (fallback EMAIL_INTERNAL_SECRET) — the
//     server-to-server path used by agent-actions (which also backs the Slack buttons), so
//     Slack and the dashboard share one apply path.
//
// verify_jwt is false in config.toml (in-code auth). Deploy via Supabase CLI only.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { log, logError } from "../_shared/log.ts";
import {
  planApply, parseProposalKey, isApplyableSource, isRefusal, type Proposal, type ProposalStatus,
} from "./applyProposal.ts";
import {
  STAGING_SOURCES, isStagingSource, enabledStagingSources,
  planStewardApply, planEnrichmentApply, isStagingRefusal, type StagingPlan,
} from "./stagingApply.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APPLY_SECRET = Deno.env.get("APPLY_PROPOSAL_SECRET") ?? Deno.env.get("EMAIL_INTERNAL_SECRET") ?? "";
const MAX_KEYS = 100; // bulk cap (matches the dashboard 100-per-action cap)

// Per-source rollout switch (MES-223 E1). Unset/empty => no staging source applies, so the
// dashboard behaves exactly as before this change (approve records status, applies nothing).
const ENABLED_STAGING = enabledStagingSources(Deno.env.get("AGENT_APPLY_SOURCES"));

interface RowResult { proposal_key: string; ok: boolean; op?: string; error?: string; applied_fields?: string[]; skipped?: string[] }

function authorize(req: Request): Promise<{ actor: string } | { error: { status: number; message: string } }> {
  const secret = req.headers.get("x-internal-secret");
  if (APPLY_SECRET && secret && secret === APPLY_SECRET) {
    return Promise.resolve({ actor: "internal" });
  }
  return requireAdmin(req).then((r) =>
    "error" in r ? { error: r.error } : { actor: r.user.id },
  );
}

// Staging tables are dynamic + absent from generated types; queries below use the documented
// (supabase as any) cast pattern. The client itself is strongly typed here.
type Db = ReturnType<typeof createClient>;

/**
 * Apply one staging proposal (steward or enrichment) through the same choke point. Loads the
 * staging row, resolves its target directory row, plans via the pure planners (CAS / fill-empty),
 * writes the allowed fields, and stamps the staging row applied. A partial apply (some fields
 * skipped) is still success — the skips are reported per-field, never silently dropped. A hard
 * failure leaves the staging row in 'approved' (no apply_failed status on these tables), so it
 * stays visibly retryable rather than silently terminal.
 */
async function applyStagingRow(supabase: Db, source: string, id: string, key: string): Promise<RowResult> {
  const spec = STAGING_SOURCES[source];
  try {
    // deno-lint-ignore no-explicit-any
    const { data: row, error: loadErr } = await (supabase as any).from(source).select("*").eq("id", id).maybeSingle();
    if (loadErr) throw new Error(loadErr.message);
    if (!row) return { proposal_key: key, ok: false, error: "staging row not found" };
    if (row.status === spec.appliedStatus) return { proposal_key: key, ok: true, op: "noop" };

    const targetTable = spec.kind === "steward" ? String(row[spec.targetTableField!] ?? "") : spec.targetTable!;
    const targetId = row[spec.targetIdField];
    if (!targetTable || !targetId) return { proposal_key: key, ok: false, error: "staging row missing target table/id" };

    // deno-lint-ignore no-explicit-any
    const { data: cur } = await (supabase as any).from(targetTable).select("*").eq("id", targetId).maybeSingle();
    const currentRow = (cur ?? null) as Record<string, unknown> | null;

    const plan = spec.kind === "steward"
      ? planStewardApply({ status: row.status, field_diffs: row.field_diffs }, targetTable, currentRow)
      : planEnrichmentApply({ status: row.status, enrichment: row.enrichment }, targetTable, currentRow);

    if (isStagingRefusal(plan)) return { proposal_key: key, ok: false, error: plan.reason };

    const p = plan as StagingPlan;
    if (p.op === "update") {
      // deno-lint-ignore no-explicit-any
      const { error } = await (supabase as any).from(targetTable).update(p.set!).eq("id", targetId);
      if (error) throw new Error(error.message);
    }
    // op 'noop' (all fields skipped or already satisfied) still marks the staging row resolved so
    // it leaves the review queue — but only when the diff was genuinely satisfied, not when every
    // field was refused (CAS mismatch / not allowed): those must stay for a human to re-examine.
    if (p.op === "noop" && !p.allSatisfied) {
      return { proposal_key: key, ok: false, op: "noop", error: `nothing applied: ${p.skipped.map((s) => `${s.field}(${s.reason})`).join("; ")}` };
    }

    const stamp: Record<string, unknown> = { status: spec.appliedStatus };
    if (spec.hasAppliedAt) stamp.applied_at = new Date().toISOString();
    // deno-lint-ignore no-explicit-any
    await (supabase as any).from(source).update(stamp).eq("id", id).neq("status", spec.appliedStatus);

    return {
      proposal_key: key, ok: true, op: p.op,
      applied_fields: p.appliedFields, skipped: p.skipped.map((s) => `${s.field}(${s.reason})`),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("apply-proposal", `staging apply failed for ${key}`, err);
    return { proposal_key: key, ok: false, error: msg };
  }
}

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const auth = await authorize(req);
  if ("error" in auth) {
    return new Response(JSON.stringify({ error: auth.error.message }), {
      status: auth.error.status, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: { proposal_keys?: string[]; proposal_key?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON body" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const keys = body.proposal_keys ?? (body.proposal_key ? [body.proposal_key] : []);
  if (!Array.isArray(keys) || keys.length === 0) {
    return new Response(JSON.stringify({ error: "proposal_keys (array) or proposal_key required" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  if (keys.length > MAX_KEYS) {
    return new Response(JSON.stringify({ error: `too many keys (max ${MAX_KEYS})` }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const results: RowResult[] = [];

  for (const key of keys) {
    const parsed = parseProposalKey(key);
    if (!parsed) { results.push({ proposal_key: key, ok: false, error: "malformed proposal_key" }); continue; }

    // Staging sources (steward / enrichment) — MES-223 E1, only when enabled by AGENT_APPLY_SOURCES.
    if (isStagingSource(parsed.source)) {
      if (!ENABLED_STAGING.has(parsed.source)) {
        results.push({ proposal_key: key, ok: false, error: `source '${parsed.source}' apply not enabled` });
        continue;
      }
      results.push(await applyStagingRow(supabase, parsed.source, parsed.id, key));
      continue;
    }

    if (!isApplyableSource(parsed.source)) {
      results.push({ proposal_key: key, ok: false, error: `source '${parsed.source}' is not directly applyable` });
      continue;
    }

    try {
      const { data: row, error: loadErr } = await supabase
        .from("agent_content_proposals").select("*").eq("id", parsed.id).maybeSingle();
      if (loadErr) throw new Error(loadErr.message);
      if (!row) { results.push({ proposal_key: key, ok: false, error: "proposal not found" }); continue; }
      if (row.status === "applied") { results.push({ proposal_key: key, ok: true, op: "noop" }); continue; }

      const proposal: Proposal = {
        id: row.id, action_type: row.action_type, target_table: row.target_table,
        target_id: row.target_id, payload: row.payload ?? {}, status: row.status as ProposalStatus,
      };

      // Fetch current target row for COALESCE guards (only when there is a concrete target).
      let currentRow: Record<string, unknown> | null = null;
      if (proposal.target_table && proposal.target_id) {
        const { data: cur } = await supabase
          .from(proposal.target_table).select("*").eq("id", proposal.target_id).maybeSingle();
        currentRow = cur ?? null;
      }

      const plan = planApply(proposal, currentRow);
      if (isRefusal(plan)) {
        // A refusal is a validation/precondition issue (e.g. not-yet-approved, bad payload), not an
        // apply-time failure — report it but never corrupt the row's status to apply_failed.
        results.push({ proposal_key: key, ok: false, error: plan.reason });
        continue;
      }

      if (plan.op === "update") {
        const { error } = await supabase.from(plan.table!).update(plan.set!).eq("id", plan.id!);
        if (error) throw new Error(error.message);
      } else if (plan.op === "delete") {
        const { error } = await supabase.from(plan.table!).delete().eq("id", plan.id!);
        if (error) throw new Error(error.message);
      } else if (plan.op === "reembed") {
        const { error } = await supabase.from("mes_knowledge_base")
          .update({ embedded_hash: null, embedding: null }).in("id", plan.kbIds!);
        if (error) throw new Error(error.message);
      } // op 'noop' -> nothing to write, still mark applied below.

      await supabase.from("agent_content_proposals")
        .update({ status: "applied", applied_at: new Date().toISOString(), apply_error: null })
        .eq("id", parsed.id);
      results.push({ proposal_key: key, ok: true, op: plan.op });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logError("apply-proposal", `apply failed for ${key}`, err);
      await supabase.from("agent_content_proposals")
        .update({ status: "apply_failed", apply_error: msg.slice(0, 500) }).eq("id", parsed.id);
      results.push({ proposal_key: key, ok: false, error: msg });
    }
  }

  const applied = results.filter((r) => r.ok).length;
  log("apply-proposal", `applied ${applied}/${results.length}`, { actor: auth.actor });
  return new Response(JSON.stringify({ applied, total: results.length, results }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
