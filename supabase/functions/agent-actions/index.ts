// agent-actions — the admin endpoint the dashboard (and the Slack buttons) call to approve / reject
// / retry proposals across every loop. It writes the proposal's native review status to its source
// table and, for applyable sources (agent_content_proposals), invokes apply-proposal — the single
// production writer. Slack and the dashboard therefore share one apply path.
//
// Auth: admin JWT (requireAdmin) OR x-internal-secret == AGENT_ACTIONS_SECRET (fallback
// EMAIL_INTERNAL_SECRET) for the Slack server-to-server path. verify_jwt is false in config.toml
// (in-code auth). Bulk cap 100; per-row {ok,error} results so a bulk action never silently drops.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { log, logError } from "../_shared/log.ts";
import {
  MAX_KEYS, parseProposalKey, resolveAction, isActionRefusal, enabledApplySources,
  type CanonicalAction,
} from "./agentActions.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const AGENT_SECRET = Deno.env.get("AGENT_ACTIONS_SECRET") ?? Deno.env.get("EMAIL_INTERNAL_SECRET") ?? "";
const APPLY_SECRET = Deno.env.get("APPLY_PROPOSAL_SECRET") ?? Deno.env.get("EMAIL_INTERNAL_SECRET") ?? "";

// Staging sources whose approve should also apply (MES-223 E1). Env-gated; unset => none, so the
// default behaviour is unchanged. apply-proposal enforces the same gate independently.
const ENABLED_APPLY = enabledApplySources(Deno.env.get("AGENT_APPLY_SOURCES"));

interface RowResult { proposal_key: string; ok: boolean; applied?: boolean; error?: string }

async function authorize(req: Request): Promise<{ actor: string } | { error: { status: number; message: string } }> {
  const secret = req.headers.get("x-internal-secret");
  if (AGENT_SECRET && secret && secret === AGENT_SECRET) return { actor: "internal" };
  const r = await requireAdmin(req);
  return "error" in r ? { error: r.error } : { actor: r.user.id };
}

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const auth = await authorize(req);
  if ("error" in auth) {
    return new Response(JSON.stringify({ error: auth.error.message }), { status: auth.error.status, headers: { ...cors, "Content-Type": "application/json" } });
  }
  const reviewerId = auth.actor === "internal" ? null : auth.actor;

  let body: { action?: CanonicalAction; proposal_keys?: string[] };
  try { body = await req.json(); } catch { return bad(cors, "invalid JSON body"); }
  const action = body.action;
  if (action !== "approve" && action !== "reject" && action !== "retry") return bad(cors, "action must be approve|reject|retry");
  const keys = body.proposal_keys ?? [];
  if (!Array.isArray(keys) || keys.length === 0) return bad(cors, "proposal_keys (non-empty array) required");
  if (keys.length > MAX_KEYS) return bad(cors, `too many keys (max ${MAX_KEYS})`);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const nowISO = new Date().toISOString();
  const results = new Map<string, RowResult>();
  const applyKeys: string[] = [];

  // 1. Status writes.
  for (const key of keys) {
    const parsed = parseProposalKey(key);
    if (!parsed) { results.set(key, { proposal_key: key, ok: false, error: "malformed proposal_key" }); continue; }
    const plan = resolveAction(parsed.source, action, parsed.id, nowISO, reviewerId);
    if (isActionRefusal(plan)) { results.set(key, { proposal_key: key, ok: false, error: plan.reason }); continue; }
    try {
      // Compare-and-swap: never overwrite a row that is already applied (production already
      // mutated), so a stray reject/approve/retry can't corrupt terminal state or force a re-apply.
      const { data: upd, error } = await supabase.from(plan.table)
        .update(plan.set).eq("id", parsed.id).neq("status", plan.guardStatus).select("id");
      if (error) throw new Error(error.message);
      if (!upd || upd.length === 0) {
        results.set(key, { proposal_key: key, ok: false, error: "already applied or not found; no change made" });
        continue;
      }
      results.set(key, { proposal_key: key, ok: true });
      // Content proposals apply via plan.applyAfter. Enabled staging sources apply on approve too,
      // gated by AGENT_APPLY_SOURCES (SOURCE_CONFIG.applyable stays false for them by design).
      if (plan.applyAfter || (action === "approve" && ENABLED_APPLY.has(parsed.source))) applyKeys.push(key);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.set(key, { proposal_key: key, ok: false, error: msg });
    }
  }

  // 2. Apply the applyable ones through the single choke point (apply-proposal).
  if (applyKeys.length > 0) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/apply-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-secret": APPLY_SECRET },
        body: JSON.stringify({ proposal_keys: applyKeys }),
      });
      const applyJson = await resp.json().catch(() => ({ results: [] }));
      const applyResults: Array<{ proposal_key: string; ok: boolean; error?: string }> = applyJson.results ?? [];
      for (const ar of applyResults) {
        const cur = results.get(ar.proposal_key);
        if (cur) { cur.applied = ar.ok; if (!ar.ok) { cur.ok = false; cur.error = ar.error ?? "apply failed"; } }
      }
    } catch (err) {
      logError("agent-actions", "apply-proposal invocation failed", err);
      for (const k of applyKeys) { const cur = results.get(k); if (cur) { cur.ok = false; cur.applied = false; cur.error = "apply-proposal unreachable"; } }
    }
  }

  const out = Array.from(results.values());
  const ok = out.filter((r) => r.ok).length;
  log("agent-actions", `${action}: ${ok}/${out.length} ok`, { actor: auth.actor, sources: keys.map((k) => k.split(":")[0]) });
  return new Response(JSON.stringify({ action, ok, total: out.length, results: out }), { headers: { ...cors, "Content-Type": "application/json" } });
});

function bad(cors: Record<string, string>, message: string): Response {
  return new Response(JSON.stringify({ error: message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
}
