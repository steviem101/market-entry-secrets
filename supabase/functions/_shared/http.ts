// // supabase/functions/_shared/http.ts
export function buildCorsHeaders(req: Request): Record<string, string> {
  // Echo back the requesting origin (same as all other edge functions using '*').
  // Actual security is enforced by JWT auth in each function, not CORS.
  const origin = req.headers.get("origin") || "*";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  };
}
