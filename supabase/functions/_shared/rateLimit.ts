import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Check and enforce rate limits for edge functions.
 * Uses the edge_function_rate_limits table (service_role only).
 *
 * @param failClosed when true, a limiter DB error blocks the request instead of
 *   allowing it. Use for endpoints where the throttle guards paid spend (e.g.
 *   knowledge-search's OpenAI embed) — a limiter outage must not become an
 *   uncapped-cost window. Defaults to false (fail open) so latency-sensitive
 *   guards like scrape-company keep prioritising availability.
 * @returns null if within limits, or an error message string if rate limited.
 */
export async function checkRateLimit(
  userId: string,
  functionName: string,
  maxRequests: number,
  windowMinutes: number,
  failClosed = false
): Promise<string | null> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  // Count recent invocations
  const { count, error: countError } = await supabase
    .from("edge_function_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("function_name", functionName)
    .gte("invoked_at", windowStart);

  if (countError) {
    console.error("Rate limit check failed:", countError);
    // Fail open by default; fail closed when the caller guards paid spend.
    return failClosed
      ? `Rate limit check unavailable: max ${maxRequests} requests per ${windowMinutes} minutes`
      : null;
  }

  if ((count ?? 0) >= maxRequests) {
    return `Rate limit exceeded: max ${maxRequests} requests per ${windowMinutes} minutes`;
  }

  // Record this invocation
  const { error: insertError } = await supabase
    .from("edge_function_rate_limits")
    .insert({ user_id: userId, function_name: functionName });

  if (insertError) {
    console.error("Rate limit record insert failed:", insertError);
  }

  return null;
}

/**
 * Derive a deterministic v4-shaped UUID from an arbitrary string, so a non-UUID
 * rate-limit subject (e.g. a client IP) can key the uuid `user_id` column of
 * edge_function_rate_limits. Namespace the input (e.g. `ks:${ip}`) to keep
 * per-function keyspaces distinct. Mirrors the inline helper in scrape-company
 * (kept there to avoid churning that live SSRF-guarded function).
 */
export async function hashToUuid(input: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)));
  const b = Array.from(bytes.slice(0, 16));
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant
  const hex = b.map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
