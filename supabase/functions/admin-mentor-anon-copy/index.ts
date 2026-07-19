// MES-208: AI-generated anonymous mentor copy — admin-only draft generation +
// review. Generates identity-safe copy (alias, headline, company label, bio)
// for anonymised mentors, grounded strictly in the mentor's stored record, and
// stores it in mentor_anon_copy_drafts for admin review in /admin/mentors.
//
// Publishing is NOT this function's job: approval writes the existing
// community_members.anonymous_* columns via admin-mentor-anonymity, so the
// MES-106 masking chain (view + grants) is untouched.
//
// Auth: verify_jwt (config.toml) + requireAdmin() + service role — the
// classify-personas pattern. Cost caps: MAX_BATCH mentors per invocation,
// MAX_GENERATIONS_PER_MENTOR Anthropic calls (1 + 1 leak-retry), 60s timeout,
// bounded max_tokens. Safe to invoke twice: regeneration updates the single
// pending draft row in place (unique partial index).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { log, logError } from "../_shared/log.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { leakTerms, lintDraft, tileCompanyNames, type LeakFlag } from "./leakCheck.ts";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  buildRetryPrompt,
  parseDraft,
  type GeneratedDraft,
  type MentorSourceRecord,
} from "./prompt.ts";

const PREFIX = "admin-mentor-anon-copy";

// Model override mirrors the RQ_LOOP_MODEL convention; default matches generate-plan.
const MODEL = Deno.env.get("ANON_COPY_MODEL") || "claude-sonnet-4-6";
// Per invocation. Worst case is 2 Anthropic calls × MAX_BATCH mentors run
// sequentially, so this stays small to keep the function well inside its
// wall-clock limit; batch skips mentors with a pending draft, so re-invoking
// simply continues where the last run stopped. Corpus is ~5 today.
const MAX_BATCH = 10;
const MAX_TOKENS = 1200;
const ANTHROPIC_TIMEOUT_MS = 60_000;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MENTOR_COLUMNS =
  "id, name, company, description, experience, specialties, sector_tags, archetype, persona_fit, market_corridors, origin_country, experience_tiles, is_anonymous, is_active";

interface MentorRow {
  id: string;
  name: string;
  company: string | null;
  description: string;
  experience: string | null;
  specialties: string[] | null;
  sector_tags: string[] | null;
  archetype: string | null;
  persona_fit: string[] | null;
  market_corridors: string[] | null;
  origin_country: string | null;
  experience_tiles: unknown;
  is_anonymous: boolean;
  is_active: boolean;
}

const json = (cors: Record<string, string>, status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

async function callAnthropic(
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      logError(PREFIX, "Anthropic call failed", { status: res.status });
      return null;
    }
    const data = await res.json();
    return typeof data?.content?.[0]?.text === "string" ? data.content[0].text : null;
  } catch (err) {
    logError(PREFIX, "Anthropic call errored", err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generate a draft for one mentor: one Anthropic call, leak-lint, at most one
 * automatic retry with the offending terms fed back, then upsert the mentor's
 * single pending draft row.
 */
// deno-lint-ignore no-explicit-any -- untyped client, house pattern for function helpers
async function generateForMentor(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped client, house pattern for function helpers
  supabase: any,
  mentor: MentorRow,
): Promise<
  | { mentor_id: string; status: string; draft: Record<string, unknown> }
  | { mentor_id: string; error: string }
> {
  const tiles = tileCompanyNames(mentor.experience_tiles);
  const record: MentorSourceRecord = {
    archetype: mentor.archetype,
    origin_country: mentor.origin_country,
    description: mentor.description,
    experience: mentor.experience,
    specialties: mentor.specialties,
    sector_tags: mentor.sector_tags,
    persona_fit: mentor.persona_fit,
    market_corridors: mentor.market_corridors,
    tile_companies: tiles,
    real_name: mentor.name,
    real_company: mentor.company,
  };
  const terms = leakTerms([mentor.name, mentor.company, ...tiles]);
  const userPrompt = buildUserPrompt(record);

  let draft: GeneratedDraft | null = null;
  let flags: LeakFlag[] = [];
  const messages: { role: "user" | "assistant"; content: string }[] = [
    { role: "user", content: userPrompt },
  ];

  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await callAnthropic(messages);
    if (!text) return { mentor_id: mentor.id, error: "generation_failed" };
    const parsed = parseDraft(text);
    if (!parsed) return { mentor_id: mentor.id, error: "unparseable_output" };

    draft = parsed;
    flags = lintDraft(
      {
        alias: parsed.alias,
        headline: parsed.headline,
        company_label: parsed.company_label,
        bio: parsed.bio,
        best_for: parsed.best_for,
      },
      terms,
    );
    if (flags.length === 0) break;
    // One retry with the offending terms named; a second failure ships as `flagged`.
    messages.push({ role: "assistant", content: text });
    messages.push({ role: "user", content: buildRetryPrompt(flags.map((f) => f.term)) });
  }

  const status = flags.length === 0 ? "draft" : "flagged";
  const row = {
    mentor_id: mentor.id,
    alias: draft!.alias,
    headline: draft!.headline,
    company_label: draft!.company_label,
    bio: draft!.bio,
    best_for: draft!.best_for,
    claims: draft!.claims,
    leak_flags: flags,
    status,
    model: MODEL,
    generated_at: new Date().toISOString(),
    reviewed_by: null,
    reviewed_at: null,
  };

  // Update-in-place the single pending row, else insert (unique partial index
  // on mentor_id where status in draft/flagged makes this race-safe).
  const { data: pending } = await supabase
    .from("mentor_anon_copy_drafts")
    .select("id")
    .eq("mentor_id", mentor.id)
    .in("status", ["draft", "flagged"])
    .maybeSingle();

  const write = pending
    ? supabase
        .from("mentor_anon_copy_drafts")
        .update(row)
        .eq("id", pending.id)
        .select("id, mentor_id, alias, headline, company_label, bio, best_for, claims, leak_flags, status, generated_at")
        .maybeSingle()
    : supabase
        .from("mentor_anon_copy_drafts")
        .insert(row)
        .select("id, mentor_id, alias, headline, company_label, bio, best_for, claims, leak_flags, status, generated_at")
        .maybeSingle();
  const { data: saved, error: writeError } = await write;
  if (writeError || !saved) {
    logError(PREFIX, "Draft write failed", { mentorId: mentor.id, code: writeError?.code });
    return { mentor_id: mentor.id, error: "draft_write_failed" };
  }

  // No PII in logs — ids, status, flag count only.
  log(PREFIX, "Draft generated", { mentorId: mentor.id, status, leakFlags: flags.length });
  return { mentor_id: mentor.id, status, draft: saved };
}

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json(cors, 405, { error: "Method not allowed" });

  const auth = await requireAdmin(req);
  if ("error" in auth) return json(cors, auth.error.status, { error: auth.error.message });

  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action === "review" ? "review" : "generate";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (action === "review") {
      const draftId = body?.draft_id;
      const status = body?.status;
      if (typeof draftId !== "string" || !UUID_RE.test(draftId)) {
        return json(cors, 400, { error: "draft_id must be a UUID" });
      }
      if (status !== "approved" && status !== "rejected") {
        return json(cors, 400, { error: "status must be 'approved' or 'rejected'" });
      }
      const { data: updated, error } = await supabase
        .from("mentor_anon_copy_drafts")
        .update({
          status,
          reviewed_by: auth.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", draftId)
        .in("status", ["draft", "flagged"])
        .select("id, mentor_id, status")
        .maybeSingle();
      if (error) throw error;
      if (!updated) return json(cors, 404, { error: "Pending draft not found" });
      log(PREFIX, "Draft reviewed", { draftId, status, byAdmin: auth.user.id });
      return json(cors, 200, { ok: true, draft: updated });
    }

    // action === "generate"
    let mentors: MentorRow[] = [];
    if (body?.batch === true) {
      // All active anonymous mentors; skip those with a pending draft unless forced.
      const { data, error } = await supabase
        .from("community_members")
        .select(MENTOR_COLUMNS)
        .eq("is_anonymous", true)
        .eq("is_active", true)
        .limit(MAX_BATCH);
      if (error) throw error;
      mentors = (data || []) as unknown as MentorRow[];
      if (body?.force !== true && mentors.length > 0) {
        const { data: pendingRows } = await supabase
          .from("mentor_anon_copy_drafts")
          .select("mentor_id")
          .in("status", ["draft", "flagged"])
          .in("mentor_id", mentors.map((m) => m.id));
        const pendingIds = new Set((pendingRows || []).map((r: { mentor_id: string }) => r.mentor_id));
        mentors = mentors.filter((m) => !pendingIds.has(m.id));
      }
    } else {
      const mentorId = body?.mentor_id;
      if (typeof mentorId !== "string" || !UUID_RE.test(mentorId)) {
        return json(cors, 400, { error: "mentor_id must be a UUID (or pass batch: true)" });
      }
      const { data, error } = await supabase
        .from("community_members")
        .select(MENTOR_COLUMNS)
        .eq("id", mentorId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return json(cors, 404, { error: "Mentor not found" });
      mentors = [data as unknown as MentorRow];
    }

    if (mentors.length === 0) {
      return json(cors, 200, { ok: true, generated: [], skipped: "no mentors needing drafts" });
    }

    log(PREFIX, "Generating drafts", { count: mentors.length, byAdmin: auth.user.id });

    // Sequential, small corpus — keeps the function well inside limits and the
    // Anthropic call count bounded at 2 × MAX_BATCH worst case.
    const results = [];
    for (const mentor of mentors) {
      results.push(await generateForMentor(supabase, mentor));
    }

    return json(cors, 200, { ok: true, generated: results });
  } catch (err) {
    logError(PREFIX, "Unexpected error", err);
    return json(cors, 500, { error: "Internal error" });
  }
});
