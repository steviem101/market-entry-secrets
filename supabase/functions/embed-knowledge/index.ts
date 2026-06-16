// supabase/functions/embed-knowledge/index.ts
//
// Drains the mes_knowledge_base embedding queue. Cron-driven (every 2 min) via pg_net,
// authenticated with an internal secret stored in Vault (mirrors process-email-queue).
// Selects up to batch_size stale rows (embedding null OR embedded_hash != content_hash),
// embeds `content` with OpenAI text-embedding-3-small, writes embedding + embedded_hash,
// and logs the run to knowledge_embed_log. Idempotent + resumable; hard-capped per call.
//
// Auth: verify_jwt=false; guarded in-code by x-internal-secret (verified against Vault).
// OpenAI key: prefers OPENAI_API_KEY env, falls back to Vault secret `openai_api_key`.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_ENV_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const EMBED_MODEL = "text-embedding-3-small";
const HARD_CAP = 100;

function jlog(level: string, msg: string, meta: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ fn: "embed-knowledge", level, msg, ...meta }));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  // 1. Internal-secret auth (Vault-backed)
  const presented = req.headers.get("x-internal-secret") ?? "";
  const { data: secretOk, error: secErr } = await supabase.rpc("kb_check_secret", { p_candidate: presented });
  if (secErr) {
    jlog("error", "secret check failed", { err: secErr.message });
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
  if (secretOk !== true) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  // 2. Batch size (hard-capped)
  let batchSize = HARD_CAP;
  try {
    const body = await req.json();
    if (body && Number.isFinite(body.batch_size)) {
      batchSize = Math.min(Math.max(1, Math.trunc(body.batch_size)), HARD_CAP);
    }
  } catch (_) { /* no body */ }

  // 3. Stale rows
  const { data: rows, error: selErr } = await supabase.rpc("kb_stale_rows", { p_limit: batchSize });
  if (selErr) {
    jlog("error", "stale fetch failed", { err: selErr.message });
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
  if (!rows || rows.length === 0) {
    return new Response(JSON.stringify({ embedded: 0, message: "queue empty" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // 4. OpenAI key (env first, Vault fallback)
  let openaiKey = OPENAI_ENV_KEY;
  if (!openaiKey) {
    const { data: vk } = await supabase.rpc("kb_get_openai_key");
    openaiKey = typeof vk === "string" ? vk : "";
  }
  if (!openaiKey) {
    jlog("warn", "no OpenAI key (env OPENAI_API_KEY or Vault openai_api_key); skipping", { pending: rows.length });
    return new Response(JSON.stringify({ embedded: 0, pending: rows.length, reason: "missing_openai_key" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  const runStarted = new Date().toISOString();
  let embedded = 0;
  let failed = 0;
  let errText: string | null = null;

  try {
    // 5. Embed the batch in a single OpenAI request
    const inputs = rows.map((r: { content: string }) => r.content);
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: EMBED_MODEL, input: inputs }),
    });
    if (!resp.ok) {
      errText = `openai ${resp.status}: ${(await resp.text()).slice(0, 300)}`;
      jlog("error", "openai embeddings failed", { status: resp.status });
      failed = rows.length;
    } else {
      const json = await resp.json();
      const vectors: { index: number; embedding: number[] }[] = json.data ?? [];
      // 6. Write back, matching by index
      for (const item of vectors) {
        const row = rows[item.index];
        if (!row) { failed++; continue; }
        const vecStr = `[${item.embedding.join(",")}]`;
        const { error: upErr } = await supabase.rpc("kb_set_embedding", {
          p_id: row.id, p_embedding: vecStr, p_embedded_hash: row.content_hash, p_model: EMBED_MODEL,
        });
        if (upErr) { failed++; jlog("error", "writeback failed", { id: row.id, err: upErr.message }); }
        else embedded++;
      }
    }
  } catch (e) {
    errText = e instanceof Error ? e.message : String(e);
    failed = rows.length - embedded;
    jlog("error", "embedding run threw", { err: errText });
  }

  // 7. Observability
  await supabase.from("knowledge_embed_log").insert({
    run_started: runStarted, batch_size: batchSize,
    embedded_count: embedded, failed_count: failed,
    error: errText, finished: new Date().toISOString(),
  });

  jlog("info", "run complete", { embedded, failed, batch: rows.length });
  return new Response(JSON.stringify({ embedded, failed, batch: rows.length }), { status: 200, headers: { "Content-Type": "application/json" } });
});
