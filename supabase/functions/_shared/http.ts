// supabase/functions/_shared/http.ts

const ALLOWED_ORIGINS = [
  Deno.env.get("FRONTEND_URL"),
  "https://market-entry-secrets.lovable.app",
  "https://marketentrysecrets.com",
  "https://www.marketentrysecrets.com",
].filter(Boolean) as string[];

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow all Lovable preview/editor subdomains (e.g. id--xhziwveaiuhzdoutpgrh.lovable.app)
  if (/^https:\/\/[a-z0-9._-]+\.lovable\.app$/i.test(origin)) return true;
  return false;
}

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  // Only reflect the origin if it's in the allowlist.
  // For non-browser clients (no Origin header) or server-to-server (Stripe webhooks),
  // we still need to return a valid header, so fall back to the first allowed origin.
  const allowedOrigin = isAllowedOrigin(origin)
    ? origin
    : origin === ""
      ? ALLOWED_ORIGINS[0] || "https://market-entry-secrets.lovable.app"
      : "null";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  };
}
