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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APPLY_SECRET = Deno.env.get("APPLY_PROPOSAL_SECRET") ?? Deno.env.get("EMAIL_INTERNAL_SECRET") ?? "";
const MAX_KEYS = 100; // bulk cap (matches the dashboard 100-per-action cap)

interface RowResult { proposal_key: string; ok: boolean; op?: string; error?: string }

function authorize(req: Request): Promise<{ actor: string } | { error: { status: number; message: string } }> {
  const secret = req.headers.get("x-internal-secret");
  if (APPLY_SECRET && secret && secret === APPLY_SECRET) {
    return Promise.resolve({ actor: "internal" });
  }
  return requireAdmin(req).then((r) =>
    "error" in r ? { error: r.error } : { actor: r.user.id },
  );
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
        await markFailed(supabase, parsed.id, plan.reason);
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
      await markFailed(supabase, parsed.id, msg);
      results.push({ proposal_key: key, ok: false, error: msg });
    }
  }

  const applied = results.filter((r) => r.ok).length;
  log("apply-proposal", `applied ${applied}/${results.length}`, { actor: auth.actor });
  return new Response(JSON.stringify({ applied, total: results.length, results }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});

async function markFailed(supabase: ReturnType<typeof createClient>, id: string, reason: string) {
  await supabase.from("agent_content_proposals")
    .update({ status: "apply_failed", apply_error: reason.slice(0, 500) }).eq("id", id);
}
