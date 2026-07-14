// MES-148 Phase 5 (P5-3) — source-reachability classification (pure, node --test).
//
// The steward fetches each directory row's source URL and turns the outcome into a
// three-state verdict the health scorer consumes:
//   true  = alive (2xx/3xx served content)
//   false = genuinely dead — the ONLY signal that stages a row as "source_unreachable"
//   null  = not checkable / alive-but-blocked — neutral half-health, never staged.
//
// Why this exists: the first cut treated ANY status >= 400 (and any fetch error) as
// dead. That false-flagged live sources that merely bot-block an automated request —
// LinkedIn serves HTTP 999, and Cloudflare/Akamai/Imperva WAFs on law-firm/gov hosts
// serve 403/429 OR reject a non-browser client at the CONNECTION layer (reset / TLS /
// HTTP-2 handshake — observed on mckinsey.com and .gov WAFs). Staging a live mentor/
// provider as dead is worse than missing a truly dead link (the loop is propose-only,
// and FRESHNESS_RANKING would down-rank a false-dead row), so we bias hard toward
// false-negatives. Only two signals count as dead: an HTTP 404/410, or a DNS-resolution
// failure (the domain is genuinely gone). Every other status AND every other fetch
// error (403/999/429/5xx, timeout, connection reset, TLS/cert, HTTP-2, refused) is null
// — re-checked next run. Pure + total so it's unit-tested under Node and reused by the
// edge function.

/** Map an HTTP status to a reachability verdict.
 *  - `< 400` → true (served content, including redirects the client followed).
 *  - `404` / `410` → false — the ONLY statuses we treat as definitively gone.
 *  - anything else `>= 400` → null: 403/999 (WAF / LinkedIn bot-block), 401 (auth wall),
 *    405/406 (method/accept quirks), 429 (rate-limit), 5xx (transient server error).
 *    None prove the listing is gone, so they must not stage a live row. */
export function classifyReachabilityStatus(status: number): boolean | null {
  if (!Number.isFinite(status)) return null;
  if (status < 400) return true;
  if (status === 404 || status === 410) return false;
  return null;
}

/** True when a fetch rejection is our own abort/timeout rather than a connection
 *  failure. A timeout is ambiguous (a slow origin or a bot-tarpit that stalls
 *  non-browser clients), so it must not read as dead; a DNS/connection/TLS failure
 *  genuinely is the source being unreachable. Deno raises AbortError on abort();
 *  TimeoutError covers runtimes that surface signal timeouts under that name. */
export function isTimeoutError(err: unknown): boolean {
  const name = (err as { name?: unknown } | null)?.name;
  return name === "AbortError" || name === "TimeoutError";
}

/** Flatten an error (and its cause chain) to a lowercase string for marker matching. */
function errorText(err: unknown): string {
  const parts: string[] = [];
  // deno-lint-ignore no-explicit-any
  let cur: any = err;
  for (let i = 0; i < 4 && cur != null; i++) {
    if (typeof cur === "string") { parts.push(cur); break; }
    if (cur.message) parts.push(String(cur.message));
    cur = cur.cause;
  }
  return parts.join(" | ").toLowerCase();
}

/** Whether a fetch rejection is a DNS-resolution failure — the domain doesn't resolve,
 *  the one UNAMBIGUOUS "genuinely gone" network signal. Deno surfaces this inside the
 *  TypeError message ("dns error: failed to lookup address information: ..."); we also
 *  match the common libc/getaddrinfo phrasings for resilience across runtimes. */
const DNS_FAILURE = /dns error|failed to lookup address|name or service not known|nodename nor servname|no such host|could not resolve host|name resolution/;
export function isDnsError(err: unknown): boolean {
  return DNS_FAILURE.test(errorText(err));
}

/** Verdict for a fetch that THREW (no HTTP status). Timeout → null (ambiguous: a slow
 *  origin or a bot-tarpit). DNS-resolution failure → false (the domain is genuinely
 *  gone). Everything else — connection reset, TLS/cert error, HTTP/2 protocol error,
 *  connection refused → null: these are commonly a LIVE host's WAF/CDN rejecting a
 *  non-browser client at the connection layer (observed on mckinsey.com, gov WAFs),
 *  so they must NOT stage a live row. Only DNS-gone + HTTP 404/410 read as dead. */
export function classifyReachabilityError(err: unknown): boolean | null {
  if (isTimeoutError(err)) return null;
  return isDnsError(err) ? false : null;
}

/** A browser-like UA + Accept for the reachability probe. The original
 *  "MES-DirectorySteward/1.0" UA was itself the trigger for many WAF 403s; a
 *  realistic UA gets a truthful status from far more origins. This is a benign
 *  uptime check of the organisation's OWN listed URL, not evasion. */
export const PROBE_HEADERS: Record<string, string> = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};
