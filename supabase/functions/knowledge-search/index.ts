// supabase/functions/knowledge-search/index.ts
//
// Canonical search entry point for MCPs / AI agents. Takes a text `query` (+ optional `filter`,
// `top_k`, `match_threshold`), embeds it with OpenAI, calls match_knowledge(), and returns ranked
// cross-entity results. Visibility (public/member/paid) is derived from the caller's auth/plan and
// passed as allowed_visibility; anonymous callers get public only. match_knowledge enforces
// visibility internally regardless, so this is defence-in-depth, not the sole gate.
//
// Auth: verify_jwt=false so anonymous agents can call it; a bearer token (if present) widens
// visibility based on the user's subscription tier.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, hashToUuid } from "../_shared/rateLimit.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_ENV_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const EMBED_MODEL = "text-embedding-3-small";
// Abuse caps (AUD-030): this endpoint is anonymous and fires a paid OpenAI
// embedding per call. Cap the embedded text, and rate-limit BEFORE embedding so
// throttled calls cost nothing. Anonymous callers are keyed by IP (stricter);
// authenticated callers by user id (looser) so a real agent isn't starved.
const MAX_QUERY_CHARS = 2000;
const ANON_RATE_MAX = 20;   // requests
const AUTH_RATE_MAX = 60;   // requests
const RATE_WINDOW_MIN = 1;  // per minute

const ALLOWED_ORIGINS = [
  Deno.env.get("FRONTEND_URL"),
  "https://marketentrysecrets.com",
  "https://www.marketentrysecrets.com",
  "https://market-entry-secrets.lovable.app",
].filter(Boolean) as string[];

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const ok = ALLOWED_ORIGINS.includes(origin)
    || /^https:\/\/[a-z0-9._-]+\.lovable\.(app|dev)$/i.test(origin)
    || /^https:\/\/[a-z0-9._-]+\.lovableproject\.com$/i.test(origin)
    || origin === "https://lovable.dev";
  const allowOrigin = ok ? origin : (origin === "" ? (ALLOWED_ORIGINS[0] ?? "*") : "null");
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, x-supabase-api-version, x-session-id, prefer",
    "Access-Control-Max-Age": "86400",
  };
}

function jlog(level: string, msg: string, meta: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ fn: "knowledge-search", level, msg, ...meta }));
}

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  // Parse input
  let query = ""; let filter: Record<string, unknown> = {}; let topK = 10; let threshold = 0.5;
  try {
    const b = await req.json();
    query = typeof b?.query === "string" ? b.query.trim() : "";
    if (b?.filter && typeof b.filter === "object") filter = b.filter;
    if (Number.isFinite(b?.top_k)) topK = Math.min(Math.max(1, Math.trunc(b.top_k)), 50);
    // Clamp to match_knowledge's valid cosine range (AUD-030): an out-of-range
    // threshold (negative, >1, NaN-adjacent) could return everything or nothing.
    if (Number.isFinite(b?.match_threshold)) threshold = Math.min(Math.max(b.match_threshold, 0), 1);
  } catch (_) { /* bad body */ }
  if (!query) return json({ error: "query (string) is required" }, 400);
  // Cap the embedded text so an oversized paste can't inflate embedding cost.
  if (query.length > MAX_QUERY_CHARS) query = query.slice(0, MAX_QUERY_CHARS);

  // Visibility from caller auth/plan (anonymous => public only)
  let allowed = ["public"];
  let userId: string | null = null;
  const authz = req.headers.get("Authorization") ?? "";
  if (authz.toLowerCase().startsWith("bearer ")) {
    const token = authz.slice(7);
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
        allowed = ["public", "member"];
        const { data: sub } = await supabase.from("user_subscriptions").select("tier").eq("user_id", user.id).maybeSingle();
        const tier = (sub?.tier ?? "free") as string;
        if (tier && tier !== "free") allowed = ["public", "member", "paid"];
      }
    } catch (_) { /* anon fallback */ }
  }

  // Rate limit BEFORE the paid embed (AUD-030). Authenticated callers key on
  // their user id (looser); anonymous callers on a hash of their IP (stricter).
  // Fails open on a limiter DB error (checkRateLimit) — availability over strict
  // enforcement, matching scrape-company.
  const rateMax = userId ? AUTH_RATE_MAX : ANON_RATE_MAX;
  const rateKey = userId
    ? userId
    : await hashToUuid(`ks:${(req.headers.get("x-forwarded-for") || "0.0.0.0").split(",")[0].trim()}`);
  const limited = await checkRateLimit(rateKey, "knowledge-search", rateMax, RATE_WINDOW_MIN);
  if (limited) { jlog("warn", "rate limited", { authed: !!userId }); return json({ error: "rate_limited", detail: limited }, 429); }

  // OpenAI key (env first, Vault fallback)
  let openaiKey = OPENAI_ENV_KEY;
  if (!openaiKey) {
    const { data: vk } = await supabase.rpc("kb_get_openai_key");
    openaiKey = typeof vk === "string" ? vk : "";
  }
  if (!openaiKey) { jlog("warn", "no OpenAI key"); return json({ error: "embeddings_unavailable" }, 503); }

  // Embed the query
  let embedding: number[] | undefined;
  try {
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({ model: EMBED_MODEL, input: query }),
    });
    if (!resp.ok) { jlog("error", "openai failed", { status: resp.status }); return json({ error: "embedding_failed" }, 502); }
    const j = await resp.json();
    embedding = j.data?.[0]?.embedding;
  } catch (e) {
    jlog("error", "openai threw", { err: e instanceof Error ? e.message : String(e) });
    return json({ error: "embedding_failed" }, 502);
  }
  if (!embedding) return json({ error: "embedding_failed" }, 502);

  // Retrieve (visibility enforced inside match_knowledge)
  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: `[${embedding.join(",")}]`,
    query_text: query,
    match_count: topK,
    match_threshold: threshold,
    filter,
    allowed_visibility: allowed,
  });
  if (error) { jlog("error", "match_knowledge failed", { err: error.message }); return json({ error: "search_failed" }, 500); }

  return json({ query, count: data?.length ?? 0, allowed_visibility: allowed, results: data ?? [] });
});
