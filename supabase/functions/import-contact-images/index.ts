// MES-123 — import-contact-images
//
// Admin-invoked pipeline that turns a Lemlist/PhantomBuster CSV export of LinkedIn profile
// photos into permanent Supabase-Storage-hosted avatars on MES directory records.
//
// CRITICAL: media.licdn.com URLs are signed and EXPIRE (the `e=` param is a Unix timestamp,
// sometimes < 24h out). We NEVER store or hotlink them — we download at import time, re-encode
// (which strips EXIF), and store the permanent Storage URL. Run imports promptly after export.
//
// Flow (resumable): INGEST a CSV from the private `imports` bucket into contact_image_imports
// as `pending`, then PROCESS pending rows in bounded batches (match -> fetch -> resize -> upload
// -> write). Re-invoke with the same batchId until no `pending` rows remain. --dry-run reports
// matches without touching Storage or directory records; --overwrite replaces existing avatars.
//
// Auth: admin only (requireAdmin). CSV download + all writes use the service role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import { buildCorsHeaders } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { log, logError } from "../_shared/log.ts";
import { isPrivateOrReservedUrl } from "../_shared/url.ts";
import { normalizeLinkedInUrl, normalizeKey } from "./linkedin.ts";
import { buildContactRows } from "./csv.ts";
import { matchRow, type Candidate } from "./matching.ts";
import { decideDisposition } from "./disposition.ts";

const PREFIX = "import-contact-images";
const AVATARS_BUCKET = "avatars";
const IMPORTS_BUCKET = "imports";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const TARGET_PX = 256;
const JPEG_QUALITY = 82;
const DEFAULT_BATCH = 30;
const MAX_BATCH = 50;
const FETCH_TIMEOUT_MS = 15000;
const MAX_REDIRECTS = 3;
const DEFAULT_MAX_RUN_MS = 90_000; // stop pulling new rows past this; remaining stay pending (resumable)
const URL_PROBE_SAMPLE = 5;

/**
 * SSRF-safe fetch: follows redirects MANUALLY and re-validates every hop against the private/
 * reserved-address guard, so a public URL that 30x-redirects to an internal host is still blocked.
 * Each hop is independently timed out. Deno exposes the Location header in manual-redirect mode.
 */
async function safeFetch(rawUrl: string, init: RequestInit = {}): Promise<Response> {
  let current = rawUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!current || isPrivateOrReservedUrl(current)) {
      throw new Error("image_url missing or targets a private/reserved address");
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    let resp: Response;
    try {
      resp = await fetch(current, { ...init, redirect: "manual", signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
    if (resp.status >= 300 && resp.status < 400) {
      const loc = resp.headers.get("location");
      if (!loc) return resp; // no Location — hand back the 3xx as-is
      current = new URL(loc, current).toString(); // resolve relative → absolute, re-guard next loop
      continue;
    }
    return resp;
  }
  throw new Error("too many redirects");
}


// ─── helpers ────────────────────────────────────────────────────────────────

/** A stored image counts as "already set" for skip-unless-overwrite. Placeholders don't. */
function hasRealAvatar(v: string | null | undefined): boolean {
  if (!v) return false;
  const s = v.trim();
  if (!s) return false;
  if (s === "/placeholder.svg") return false;
  if (s.startsWith("https://images.unsplash.com")) return false; // legacy random-face placeholder
  return true;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  // Copy into a fresh ArrayBuffer-backed view: TS 5.7+ types digest()'s
  // BufferSource over ArrayBuffer, rejecting Uint8Array<ArrayBufferLike>.
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface ProcessedImage { bytes: Uint8Array; hash8: string; }

/** Fetch (SSRF-guarded incl. redirects, timed out, size-capped), decode, square-crop, re-encode JPEG (EXIF-stripped). */
async function fetchAndProcess(imageUrl: string): Promise<ProcessedImage> {
  const resp = await safeFetch(imageUrl);
  if (!resp.ok) throw new Error(`fetch failed: HTTP ${resp.status}${resp.status === 403 ? " (URL likely expired — re-export)" : ""}`);
  const ctype = resp.headers.get("content-type") ?? "";
  if (!ctype.startsWith("image/")) throw new Error(`not an image (content-type: ${ctype || "unknown"})`);

  const buf = new Uint8Array(await resp.arrayBuffer());
  if (buf.byteLength === 0) throw new Error("empty image body");
  if (buf.byteLength > MAX_IMAGE_BYTES) throw new Error(`image too large (${buf.byteLength} bytes > ${MAX_IMAGE_BYTES})`);

  let image: Image;
  try {
    image = await Image.decode(buf);
  } catch {
    throw new Error("could not decode image (unsupported format?)");
  }
  // cover() resizes + centre-crops to a filled square; re-encoding drops all EXIF metadata.
  image.cover(TARGET_PX, TARGET_PX);
  const out = await image.encodeJPEG(JPEG_QUALITY);
  const bytes = out instanceof Uint8Array ? out : new Uint8Array(out);
  const hash8 = (await sha256Hex(bytes)).slice(0, 8);
  return { bytes, hash8 };
}

/** Storage path for a target. JSONB targets carry a "parentId:contactId" recordId. The id
 *  segment is sanitised to a safe charset (record ids are uuids / small ints, but this blocks
 *  any path traversal from a malformed contact id). */
function storagePath(table: string, recordId: string, hash8: string): string {
  const idPart = recordId.replace(/:/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
  return `${table}/${idPart}-${hash8}.jpg`;
}

// ─── candidate loading (all people surfaces, service role, base tables incl. PII) ──────────

// Await a query builder and throw on error (a silently-empty candidate set would make every
// row fail as no_match and mask the real cause — fail the batch loudly instead).
async function must(builder: any, what: string): Promise<any[]> {
  const { data, error } = await builder;
  if (error) throw new Error(`load ${what} failed: ${error.message ?? error}`);
  return data ?? [];
}

async function loadCandidates(supabase: any): Promise<Candidate[]> {
  const candidates: Candidate[] = [];

  // Mentors — skip anonymous (their photo must never be published). community_members has no
  // email column (contact info lives in `contact`, freeform), so mentors match on linkedin_url
  // (once backfilled) or name+company only — email is intentionally null here.
  const mentors = await must(
    supabase.from("community_members").select("id,name,company,linkedin_url,avatar_url,is_anonymous"),
    "community_members",
  );
  for (const m of mentors) {
    if (m.is_anonymous) continue;
    candidates.push({
      surface: "mentor", table: "community_members", recordId: m.id,
      name: m.name, org: m.company ?? null, email: null,
      linkedinNormalized: normalizeLinkedInUrl(m.linkedin_url), existingAvatar: m.avatar_url ?? null,
    });
  }

  // Agency name lookup (org context for agency + JSONB contacts).
  const agencies = await must(supabase.from("trade_investment_agencies").select("id,name"), "trade_investment_agencies");
  const agencyName = new Map<string, string>(agencies.map((a: any) => [a.id, a.name]));

  const agencyContacts = await must(
    supabase.from("agency_contacts").select("id,full_name,email,linkedin_url,avatar_url,agency_id").eq("is_archived", false),
    "agency_contacts",
  );
  for (const c of agencyContacts) {
    candidates.push({
      surface: "agency_contact", table: "agency_contacts", recordId: c.id,
      name: c.full_name, org: agencyName.get(c.agency_id) ?? null, email: c.email ?? null,
      linkedinNormalized: normalizeLinkedInUrl(c.linkedin_url), existingAvatar: c.avatar_url ?? null,
    });
  }

  // Provider name lookup + junction contacts (currently empty, supported for the future).
  const providers = await must(supabase.from("service_providers").select("id,name,contact_persons"), "service_providers");
  const providerName = new Map<string, string>(providers.map((p: any) => [p.id, p.name]));

  const spContacts = await must(
    supabase.from("service_provider_contacts").select("id,full_name,email,linkedin_url,avatar_url,service_provider_id"),
    "service_provider_contacts",
  );
  for (const c of spContacts) {
    candidates.push({
      surface: "service_provider_contact", table: "service_provider_contacts", recordId: c.id,
      name: c.full_name, org: providerName.get(c.service_provider_id) ?? null, email: c.email ?? null,
      linkedinNormalized: normalizeLinkedInUrl(c.linkedin_url), existingAvatar: c.avatar_url ?? null,
    });
  }

  // Provider JSONB contact_persons {id,name,role,image} — no linkedin/email → name+org matching only.
  for (const p of providers) {
    for (const person of Array.isArray(p.contact_persons) ? p.contact_persons : []) {
      if (!person?.id || !person?.name) continue;
      candidates.push({
        surface: "service_provider_contact_json", table: "service_providers",
        recordId: `${p.id}:${person.id}`, name: person.name, org: p.name ?? null,
        email: null, linkedinNormalized: normalizeLinkedInUrl(person.linkedin_url),
        existingAvatar: person.image ?? null,
      });
    }
  }

  // Innovation ecosystem JSONB contact_persons — same shape.
  const ecosystems = await must(supabase.from("innovation_ecosystem").select("id,name,contact_persons"), "innovation_ecosystem");
  for (const e of ecosystems) {
    for (const person of Array.isArray(e.contact_persons) ? e.contact_persons : []) {
      if (!person?.id || !person?.name) continue;
      candidates.push({
        surface: "innovation_contact_json", table: "innovation_ecosystem",
        recordId: `${e.id}:${person.id}`, name: person.name, org: e.name ?? null,
        email: null, linkedinNormalized: normalizeLinkedInUrl(person.linkedin_url),
        existingAvatar: person.image ?? null,
      });
    }
  }

  // Investors — the contact person is contact_name; org context is the fund name.
  const investors = await must(
    supabase.from("investors").select("id,name,contact_name,contact_email,linkedin_url,avatar_url"),
    "investors",
  );
  for (const inv of investors) {
    if (!inv.contact_name) continue;
    candidates.push({
      surface: "investor", table: "investors", recordId: inv.id,
      name: inv.contact_name, org: inv.name ?? null, email: inv.contact_email ?? null,
      linkedinNormalized: normalizeLinkedInUrl(inv.linkedin_url), existingAvatar: inv.avatar_url ?? null,
    });
  }

  return candidates;
}

// ─── writing an avatar URL onto a matched record ──────────────────────────────

const JSONB_TABLES = new Set(["service_providers", "innovation_ecosystem"]);

/** Returns 'written' | 'skipped' (already had a real avatar and !overwrite). Throws on error. */
async function writeAvatar(
  supabase: any, target: Candidate, url: string, overwrite: boolean,
): Promise<"written" | "skipped"> {
  if (!overwrite && hasRealAvatar(target.existingAvatar)) return "skipped";

  if (JSONB_TABLES.has(target.table)) {
    const [parentId, contactId] = target.recordId.split(":");
    const { data: row, error: selErr } = await supabase
      .from(target.table).select("contact_persons").eq("id", parentId).maybeSingle();
    if (selErr) throw selErr;
    const persons = Array.isArray(row?.contact_persons) ? row.contact_persons : [];
    let found = false;
    const next = persons.map((p: any) => {
      if (String(p?.id) !== String(contactId)) return p;
      found = true;
      if (!overwrite && hasRealAvatar(p?.image)) return p; // already real
      return { ...p, image: url };
    });
    if (!found) throw new Error(`contact ${contactId} not found in ${target.table} ${parentId}`);
    const { error: updErr } = await supabase.from(target.table).update({ contact_persons: next }).eq("id", parentId);
    if (updErr) throw updErr;
    return "written";
  }

  // Row-based tables use a consistent avatar_url column.
  const { error } = await supabase.from(target.table).update({ avatar_url: url }).eq("id", target.recordId);
  if (error) throw error;
  return "written";
}

// ─── ingest ──────────────────────────────────────────────────────────────────

async function ingestCsv(
  supabase: any, path: string, source: string, batchId: string,
): Promise<{ inserted: number; skippedExisting: boolean }> {
  // Idempotency: don't re-ingest a batch that already has rows.
  const { count } = await supabase
    .from("contact_image_imports").select("id", { count: "exact", head: true }).eq("batch_id", batchId);
  if ((count ?? 0) > 0) return { inserted: 0, skippedExisting: true };

  const { data: file, error: dlErr } = await supabase.storage.from(IMPORTS_BUCKET).download(path);
  if (dlErr || !file) throw new Error(`could not download ${IMPORTS_BUCKET}/${path}: ${dlErr?.message ?? "not found"}`);
  const text = await file.text();
  const { rows } = buildContactRows(text);

  const records = rows.map((r) => {
    const norm = normalizeLinkedInUrl(r.linkedinUrl);
    const missingImage = !r.imageUrl;
    return {
      batch_id: batchId,
      source,
      photo_source: `linkedin:${source}`,
      raw_row: r.raw,
      full_name: r.fullName || null,
      email: r.email || null,
      company: r.company || null,
      linkedin_url: r.linkedinUrl || null,
      linkedin_url_normalized: norm,
      image_url: r.imageUrl || null,
      status: missingImage ? "failed" : "pending",
      error: missingImage ? "no_image_url" : null,
    };
  });

  // Insert in chunks to stay well under statement limits.
  let inserted = 0;
  for (let i = 0; i < records.length; i += 500) {
    const chunk = records.slice(i, i + 500);
    const { error } = await supabase.from("contact_image_imports").insert(chunk);
    if (error) throw error;
    inserted += chunk.length;
  }
  return { inserted, skippedExisting: false };
}

// ─── process one batch ─────────────────────────────────────────────────────────

interface ProcessOpts {
  batchId?: string;
  batchSize: number;
  dryRun: boolean;
  overwrite: boolean;
  applyNameMatches: boolean;   // opt-in to apply name-only (no linkedin/email) matches
  includeColdContacts: boolean; // opt-in to write cold-scraped surfaces (agency/investor)
}

async function processBatch(supabase: any, opts: ProcessOpts): Promise<Record<string, number>> {
  const candidates = await loadCandidates(supabase);

  // Held rows (needs_review) are only re-processed when the matching approval flag is set.
  const statuses = ["pending"];
  if (opts.applyNameMatches || opts.includeColdContacts) statuses.push("needs_review");

  let q = supabase.from("contact_image_imports").select("*").in("status", statuses).order("created_at").limit(opts.batchSize);
  if (opts.batchId) q = q.eq("batch_id", opts.batchId);
  const { data: pending, error } = await q;
  if (error) throw error;

  const tally: Record<string, number> = { matched: 0, needs_review: 0, uploaded: 0, skipped: 0, failed: 0 };
  const probeUrls: string[] = [];
  const startedAt = Date.now();

  for (const row of pending ?? []) {
    // Wall-clock guard: stop pulling new rows before the function's execution limit. Unprocessed
    // rows stay `pending`, so the caller just re-invokes to finish the batch (dry-run rows are
    // cheap and never fetch, so only the live path can realistically approach this).
    if (!opts.dryRun && Date.now() - startedAt > DEFAULT_MAX_RUN_MS) {
      tally.stopped_early = 1;
      break;
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    try {
      const result = matchRow(
        { fullName: row.full_name ?? "", linkedinUrl: row.linkedin_url ?? "", email: row.email ?? "", company: row.company ?? "" },
        candidates,
      );

      if (result.status === "failed") {
        patch.status = "failed"; patch.error = result.reason ?? "no_match";
        patch.match_method = null; tally.failed++;
        await supabase.from("contact_image_imports").update(patch).eq("id", row.id);
        continue;
      }

      patch.match_method = result.method;
      patch.matched_table = result.targets.map((t) => t.table).join(",");
      patch.matched_record_id = result.targets.map((t) => `${t.table}:${t.recordId}`).join(",");

      // Safety gates: name-only matches and cold-scraped surfaces are held (needs_review), never
      // auto-written, unless explicitly approved (applyNameMatches / includeColdContacts).
      const disposition = decideDisposition(result, {
        applyNameMatches: opts.applyNameMatches, includeColdContacts: opts.includeColdContacts,
      });
      if (disposition.action === "needs_review") {
        patch.status = "needs_review"; patch.error = disposition.reason;
        tally.needs_review++;
        await supabase.from("contact_image_imports").update(patch).eq("id", row.id);
        if (row.image_url) probeUrls.push(row.image_url);
        continue;
      }
      // `failed` is already handled above via result.status; this narrows the union to `write`.
      if (disposition.action !== "write") continue;
      const writable = disposition.targets;
      const heldCold = disposition.heldCold;

      if (opts.dryRun) {
        patch.status = "matched";
        patch.error = heldCold > 0 ? `${heldCold} cold target(s) gated` : null;
        tally.matched++;
        await supabase.from("contact_image_imports").update(patch).eq("id", row.id);
        if (row.image_url) probeUrls.push(row.image_url);
        continue;
      }

      // Live: fetch + process once, then fan out the write to every writable target.
      const img = await fetchAndProcess(row.image_url ?? "");
      let wrote = 0, skipped = 0;
      for (const target of writable) {
        if (!opts.overwrite && hasRealAvatar(target.existingAvatar)) { skipped++; continue; }
        const path = storagePath(target.table, target.recordId, img.hash8);
        const { error: upErr } = await supabase.storage.from(AVATARS_BUCKET).upload(path, img.bytes, {
          contentType: "image/jpeg", upsert: true,
        });
        if (upErr) throw upErr;
        const publicUrl = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path).data.publicUrl;
        const w = await writeAvatar(supabase, target, publicUrl, opts.overwrite);
        if (w === "written") { wrote++; patch.storage_path = path; patch.storage_url = publicUrl; patch.content_hash = img.hash8; }
        else skipped++;
      }

      const note = heldCold > 0 ? ` (${heldCold} cold target(s) gated)` : "";
      if (wrote > 0) { patch.status = "uploaded"; patch.error = note.trim() || null; tally.uploaded++; }
      else { patch.status = "skipped"; patch.error = `already had avatar (use overwrite)${note}`; tally.skipped++; }
      await supabase.from("contact_image_imports").update(patch).eq("id", row.id);
    } catch (e) {
      patch.status = "failed";
      patch.error = (e instanceof Error ? e.message : String(e)).slice(0, 500);
      tally.failed++;
      await supabase.from("contact_image_imports").update(patch).eq("id", row.id);
      logError(PREFIX, `row ${row.id} failed`, e);
    }
  }

  // Dry-run: probe a sample of image URLs so expiry (403) is caught BEFORE the live run, not
  // silently on every row. LinkedIn CDN URLs die fast — this fails loudly with "re-export needed".
  if (opts.dryRun && probeUrls.length > 0) {
    const sample = probeUrls.slice(0, URL_PROBE_SAMPLE);
    let ok = 0, expired = 0, other = 0;
    for (const url of sample) {
      try {
        const resp = await safeFetch(url, { headers: { Range: "bytes=0-0" } });
        if (resp.status === 403) expired++;
        else if (resp.ok || resp.status === 206) ok++;
        else other++;
      } catch { other++; }
    }
    tally.probe_checked = sample.length;
    tally.probe_ok = ok;
    tally.probe_expired = expired;
    if (expired > 0) logError(PREFIX, `URL expiry probe: ${expired}/${sample.length} returned 403 — export is stale, re-export before the live run`, {});
  }

  return tally;
}

// ─── handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const auth = await requireAdmin(req);
  if ("error" in auth) {
    return new Response(JSON.stringify({ error: auth.error.message }), { status: auth.error.status, headers: { ...cors, "Content-Type": "application/json" } });
  }

  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  const action: string = body.action ?? (body.path ? "ingest_and_process" : "process");
  const source: string = (body.source ?? "auto").toString().toLowerCase();
  const dryRun = body.dryRun === true;
  const overwrite = body.overwrite === true;
  const applyNameMatches = body.applyNameMatches === true;
  const includeColdContacts = body.includeColdContacts === true;
  const batchSize = Math.min(Math.max(Number(body.batchSize) || DEFAULT_BATCH, 1), MAX_BATCH);
  const path: string | undefined = body.path;
  // Derive a stable batchId from the file path when not provided (keeps re-invocations idempotent).
  const batchId: string | undefined = body.batchId ?? (path ? `csv:${path}` : undefined);

  const summary: Record<string, unknown> = { action, source, dryRun, overwrite, applyNameMatches, includeColdContacts, batchId };

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (action === "ingest" || action === "ingest_and_process") {
      if (!path || !batchId) throw new Error("`path` (CSV in the imports bucket) is required to ingest");
      log(PREFIX, "ingest", { path, batchId, source });
      summary.ingest = await ingestCsv(supabase, path, source, batchId);
    }

    if (action === "process" || action === "ingest_and_process") {
      log(PREFIX, "process", { batchId, batchSize, dryRun, overwrite, applyNameMatches, includeColdContacts });
      summary.processed = await processBatch(supabase, { batchId, batchSize, dryRun, overwrite, applyNameMatches, includeColdContacts });
    }

    // Remaining counts so the caller knows whether to re-invoke and what is held for review.
    const countByStatus = async (status: string) => {
      let cq = supabase.from("contact_image_imports").select("id", { count: "exact", head: true }).eq("status", status);
      if (batchId) cq = cq.eq("batch_id", batchId);
      const { count } = await cq;
      return count ?? 0;
    };
    summary.remaining_pending = await countByStatus("pending");
    summary.needs_review = await countByStatus("needs_review");

    return new Response(JSON.stringify({ ok: true, ...summary }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    logError(PREFIX, "unhandled", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Internal error", ...summary }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
