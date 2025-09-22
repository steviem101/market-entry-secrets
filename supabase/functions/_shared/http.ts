// // supabase/functions/_shared/http.ts
export function buildCorsHeaders(req: Request): Record<string, string> {
  // Read allowed origins from env (comma-separated)
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map(s => s.trim());
  const origin = req.headers.get("origin") ?? "";

  let allowOrigin = "";

  // If request origin matches one of the allowed origins, echo it back
  if (allowed.includes(origin)) {
    allowOrigin = origin;
  } else {
    // Fallback for local dev without an Origin header
    allowOrigin = "http://localhost:8080";
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  };
}
