import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AdminAuthError {
  status: number;
  message: string;
}

interface AdminAuthSuccess {
  user: { id: string; email?: string };
}

/**
 * Extracts the JWT from the Authorization header, validates it against
 * Supabase Auth, then checks the user_roles table for the 'admin' role.
 *
 * Returns the authenticated admin user on success, or an error object
 * with the appropriate HTTP status code and message.
 */
export async function requireAdmin(
  req: Request
): Promise<AdminAuthSuccess | { error: AdminAuthError }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { error: { status: 401, message: "Missing authorization" } };
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: { status: 401, message: "Unauthorized" } };
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    return {
      error: { status: 403, message: "Forbidden: admin access required" },
    };
  }

  return { user: { id: user.id, email: user.email ?? undefined } };
}
