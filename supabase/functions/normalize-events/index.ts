import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { log, logError } from "../_shared/log.ts";

const PREFIX = "normalize-events";
const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const CONCURRENCY = 5;

// Focused MES sector vocabulary (the industry axis). Kept concise so the
// classifier stays consistent run to run. The event function/type axis
// (Pitch Night, Networking, Product, etc) lives in `tags`, carried from the actor.
const MES_SECTORS = [
  "Technology & Innovation", "Fintech & Financial Services", "AI & Data",
  "SaaS & Software", "Health & MedTech", "Climate & Energy",
  "Retail & eCommerce", "Manufacturing & Industry", "Property & Construction",
  "Food & Agriculture", "Logistics & Supply Chain", "Professional Services",
  "Marketing & Growth", "Founders & Startups", "Investing & Capital",
].join(", ");

function buildSystemPrompt(currentDate: string): string {
  return `You normalise raw scraped event data into clean structured JSON for an Australian and New Zealand events calendar serving two audiences: international companies entering or expanding in ANZ, and local ANZ founders building and scaling their startups. Today is ${currentDate}.

Rules:
- Parse the real start datetime. Eventbrite rows hide the date inside "description" (for example "Fri, Jun 19, 7:20 PM"). Output ISO 8601 with the correct timezone offset for the event city. If the parsed month and day are before today, the year is next year.
- Timezone offsets in June (ANZ winter, no daylight saving): Sydney, Melbourne, Brisbane, Canberra, Hobart are +10:00; Adelaide is +09:30; Perth is +08:00; Auckland and Wellington are +12:00.
- Collapse repeated whitespace in titles. Strip "Save this event" and "Share this event" junk from descriptions.
- Write editorial_description as 1 to 2 plain, factual sentences. Professional but human. No marketing fluff, no exclamation marks.
- Determine is_anz: false if the event is physically overseas, or an online event run from outside ANZ (for example a US Meetup with an EDT timezone). Set is_online from the provided isOnline value.
- Map sector to the closest one of: ${MES_SECTORS}. Map persona to one of: international_entrant, local_founder, both. Use local_founder for events aimed at people building or scaling a startup in ANZ, including product, engineering, design, growth, AI and founder community meetups, peer groups, accelerator events, and early-stage gatherings. Use international_entrant for market entry, expansion, and trade or investment events. Use both when it serves either. Do NOT score down builder-focused meetups or early-stage events: they are core to the local_founder audience, not noise.
- venue_name from the description if present, else null.
- Add flags from this set when relevant: date_inferred_year, venue_missing, date_unparseable, possible_non_anz, low_signal_title.
- confidence is 0 to 1 reflecting how sure you are of the parsed date and ANZ relevance.

Return ONLY this JSON object, no prose, no markdown fences:
{"clean_title": string, "event_start": string|null, "event_end": string|null, "venue_name": string|null, "city": string|null, "country": "AU"|"NZ"|string|null, "is_anz": boolean, "is_online": boolean, "editorial_description": string, "sector": string, "persona": string, "flags": string[], "confidence": number}`;
}

// Robustly pull the JSON object out of the model text, tolerating stray prose or fences.
function extractJson(text: string): any {
  let t = (text || "").trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first === -1 || last === -1 || last < first) throw new Error("no JSON object in model output");
  return JSON.parse(t.slice(first, last + 1));
}

// Light heuristic for the legacy `type` column. The page's Type filter reads `tags`,
// so this is only a sensible non-null fallback.
function deriveEventType(title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("summit")) return "Summit";
  if (t.includes("conference") || t.includes("expo")) return "Conference";
  if (t.includes("workshop") || t.includes("masterclass")) return "Workshop";
  if (t.includes("webinar")) return "Webinar";
  if (t.includes("pitch")) return "Pitch Night";
  return "Networking";
}

function composeLocation(venue: string | null, city: string | null): string | null {
  const parts = [venue, city].filter((p) => p && String(p).trim().length > 0);
  return parts.length ? parts.join(", ") : null;
}

async function normaliseOne(supabase: any, system: string, row: any): Promise<"upserted" | "failed"> {
  const raw = row.raw ?? {};
  try {
    // Compact the raw item to the fields the model needs (the date hides in `description`).
    const userPayload = {
      title: raw.title ?? null,
      description: typeof raw.description === "string" ? raw.description.slice(0, 2500) : (raw.description ?? null),
      url: raw.url ?? row.source_url ?? null,
      city: raw.city ?? null,
      isOnline: raw.isOnline ?? null,
      startsAt: raw.startsAt ?? null,
      timezone: raw.timezone ?? null,
      source: raw.source ?? null,
      tags: raw.tags ?? null,
    };

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 700,
        system,
        messages: [{ role: "user", content: `Normalise this scraped event. Return only the JSON object.\n\n${JSON.stringify(userPayload)}` }],
      }),
    });

    if (!aiRes.ok) {
      logError(PREFIX, `Anthropic error ${aiRes.status} for staging ${row.id}`, await aiRes.text());
      return "failed"; // leave row unprocessed for the next run
    }

    const aiJson = await aiRes.json();
    let m: any;
    try {
      m = extractJson(aiJson?.content?.[0]?.text ?? "");
    } catch (parseErr) {
      logError(PREFIX, `JSON parse failure for staging ${row.id}`, aiJson?.content?.[0]?.text ?? aiJson);
      return "failed"; // do not crash the batch
    }

    const flagsArr: string[] = Array.isArray(m.flags) ? m.flags : (m.flags ? [String(m.flags)] : []);
    const city = m.city ?? raw.city ?? null;
    const e = {
      source_url: raw.url ?? row.source_url ?? null,
      source_platform: raw.source ?? null,
      title: m.clean_title ?? raw.title ?? null,
      editorial_description: m.editorial_description ?? null,
      event_date: m.event_start ?? null,
      venue: m.venue_name ?? null,
      city,
      country: m.country ?? null,
      is_anz: m.is_anz,
      is_online: m.is_online ?? raw.isOnline ?? false,
      sector: m.sector ?? null,
      persona: m.persona ?? null,
      image_url: raw.imageUrl ?? null,
      relevance_score: raw.score ?? null,
      match_reasons: Array.isArray(raw.matchReasons) ? raw.matchReasons.join("||") : null,
      tags: Array.isArray(raw.tags) ? raw.tags.join("||") : null,
      flags: flagsArr.join(","),
      confidence: m.confidence ?? null,
      location: composeLocation(m.venue_name ?? null, city),
      event_type: deriveEventType(m.clean_title ?? raw.title ?? ""),
    };

    const { data: upsertId, error: rpcError } = await supabase.rpc("upsert_normalized_event", { e });
    if (rpcError) {
      logError(PREFIX, `upsert_normalized_event failed for staging ${row.id}`, rpcError);
      return "failed";
    }

    await supabase
      .from("events_staging")
      .update({ processed: true, processed_at: new Date().toISOString(), target_event_id: upsertId })
      .eq("id", row.id);

    return "upserted";
  } catch (rowErr) {
    logError(PREFIX, `Unexpected error for staging ${row.id}`, rowErr);
    return "failed"; // leave unprocessed
  }
}

Deno.serve(async (req: Request) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Internal auth: only callers holding the service role key (ingest-events,
  // a scheduled job, or manual ops) may trigger normalisation.
  const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim();
  if (!token || token !== Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const batch = Math.min(Math.max(Number(body?.batch) || 25, 1), 100);
    const currentDate = new Date().toISOString().slice(0, 10);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rows, error: fetchError } = await supabase
      .from("events_staging")
      .select("id, source_url, run_id, raw")
      .eq("processed", false)
      .order("ingested_at", { ascending: true })
      .limit(batch);

    if (fetchError) {
      logError(PREFIX, "Failed to fetch staging rows", fetchError);
      return new Response(JSON.stringify({ error: "fetch_failed", details: fetchError.message }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (!rows?.length) {
      return new Response(JSON.stringify({ scanned: 0, upserted: 0, failed: 0, message: "no unprocessed rows" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const system = buildSystemPrompt(currentDate);
    let upserted = 0;
    let failed = 0;

    // Bounded concurrency so a full batch finishes well inside the function time limit.
    for (let i = 0; i < rows.length; i += CONCURRENCY) {
      const chunk = rows.slice(i, i + CONCURRENCY);
      const settled = await Promise.all(chunk.map((r) => normaliseOne(supabase, system, r)));
      for (const s of settled) s === "upserted" ? upserted++ : failed++;
    }

    log(PREFIX, "Normalisation batch complete", { scanned: rows.length, upserted, failed });
    return new Response(JSON.stringify({ scanned: rows.length, upserted, failed }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    logError(PREFIX, "Unexpected error", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
