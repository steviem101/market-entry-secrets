// supabase/functions/_shared/http.ts

const ALLOWED_ORIGINS = [
  Deno.env.get("FRONTEND_URL"),
  "https://market-entry-secrets.lovable.app",
  "https://marketentrysecrets.com",
  "https://www.marketentrysecrets.com",
].filter(Boolean) as string[];

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  // Only reflect origins that are in the allowlist; fall back to first allowed origin
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0] ?? "*";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  };
}
