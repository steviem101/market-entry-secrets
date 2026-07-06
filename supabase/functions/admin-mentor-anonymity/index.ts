// Admin-only toggle for mentor anonymity. Clients cannot write to
// community_members (SEC-02 revoked the grants), so the /admin/mentors UI
// calls this function, which verifies the admin role in-code and applies the
// update with the service role. It only ever touches the anonymity columns —
// no other mentor field is writable through this path.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { log, logError } from "../_shared/log.ts";
import { requireAdmin } from "../_shared/auth.ts";

const PREFIX = "admin-mentor-anonymity";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Optional masked-presentation overrides. Empty strings clear a value back
// to NULL so the view falls back to its auto-derived safe defaults.
const OVERRIDE_KEYS = [
  "anonymous_alias",
  "anonymous_headline",
  "anonymous_company_label",
  "anonymous_bio",
] as const;

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const auth = await requireAdmin(req);
  if ("error" in auth) {
    return new Response(JSON.stringify({ error: auth.error.message }), {
      status: auth.error.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const mentorId = body?.mentor_id;
    const isAnonymous = body?.is_anonymous;

    if (typeof mentorId !== "string" || !UUID_RE.test(mentorId)) {
      return new Response(JSON.stringify({ error: "mentor_id must be a UUID" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (typeof isAnonymous !== "boolean") {
      return new Response(JSON.stringify({ error: "is_anonymous must be a boolean" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const updates: Record<string, unknown> = { is_anonymous: isAnonymous };
    for (const key of OVERRIDE_KEYS) {
      if (key in (body ?? {})) {
        const raw = body[key];
        if (raw !== null && typeof raw !== "string") {
          return new Response(JSON.stringify({ error: `${key} must be a string or null` }), {
            status: 400,
            headers: { ...cors, "Content-Type": "application/json" },
          });
        }
        const trimmed = typeof raw === "string" ? raw.trim() : null;
        updates[key] = trimmed || null;
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: updated, error: updateError } = await supabase
      .from("community_members")
      .update(updates)
      .eq("id", mentorId)
      .select("id, is_anonymous")
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updated) {
      return new Response(JSON.stringify({ error: "Mentor not found" }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Return the masked public representation so the admin UI can show
    // exactly what visitors will see.
    const { data: publicRow } = await supabase
      .from("community_members_public")
      .select("id, name, title, description, company, location, slug, is_anonymous")
      .eq("id", mentorId)
      .maybeSingle();

    // No PII in logs — ids and the flag only.
    log(PREFIX, "Anonymity updated", {
      mentorId,
      isAnonymous,
      byAdmin: auth.user.id,
    });

    return new Response(JSON.stringify({ ok: true, public_view: publicRow }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    logError(PREFIX, "Update failed", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
