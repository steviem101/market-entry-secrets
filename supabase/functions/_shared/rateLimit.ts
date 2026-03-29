import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Check and enforce rate limits for edge functions.
 * Uses the edge_function_rate_limits table (service_role only).
 *
 * @returns null if within limits, or an error message string if rate limited.
 */
export async function checkRateLimit(
  userId: string,
  functionName: string,
  maxRequests: number,
  windowMinutes: number
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
    // Fail open — don't block the request if the check itself fails
    return null;
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
