// // supabase/functions/_shared/http.ts
export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  const allowed = raw ? raw.split(",").map(s => s.trim()).filter(Boolean) : [];

  let allowOrigin: string;

  if (allowed.length > 0 && allowed.includes(origin)) {
    // Strict mode: env var is set and origin is in the allow-list
    allowOrigin = origin;
  } else if (allowed.length === 0 && origin) {
    // No ALLOWED_ORIGINS configured — echo back the requesting origin
    // (matches the behaviour of all other edge functions that use '*')
    allowOrigin = origin;
  } else {
    // Fallback for local dev / curl (no Origin header)
    allowOrigin = "http://localhost:8080";
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  };
}
