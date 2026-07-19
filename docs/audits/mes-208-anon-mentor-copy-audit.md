# MES-208 — Anonymous Mentor Copy: Audit + Recommended Plan (Phase 1)

**Date:** 2026-07-19 · **Status:** plan approved 2026-07-19 (drafts table + RLS: approved;
provider: Anthropic direct; best-for: embedded in bio) — implemented per Part C below
**Branch:** `claude/anonymous-mentor-profiles-6zsg88` (harness-assigned; maps to the ticket's
`mes-208-mentor-anon-copy`)

**Objective:** make anonymous mentor profiles compelling without revealing identity —
AI-generated, identity-safe copy (generalised achievements, sectors, company types, "best for"
relevance), admin-reviewed before publish. This document is the Phase 1 deliverable: an audit of
the existing anonymisation architecture and a recommended implementation plan.

---

## Part A — Audit

### A1. Data model (verified against the live migration ledger + prod)

| Piece | Location |
|---|---|
| Flag | `community_members.is_anonymous` (boolean, NOT NULL, default false) |
| Copy override columns | `anonymous_alias`, `anonymous_headline`, `anonymous_company_label`, `anonymous_bio` (all nullable text on `community_members`) |
| Masking view | `community_members_public` — current definition is migration `20260709120000_mes123_avatar_url_on_public_view.sql` (24 cols + `avatar_url`), owner-executed (`security_invoker = false`) |
| Write path | `admin-mentor-anonymity` edge function only (`verify_jwt = true` + `requireAdmin()` + service role); client write grants on `community_members` are revoked (SEC-02). The function whitelists exactly the flag + the four override columns; empty string clears a value back to NULL |

**View masking for `is_anonymous` rows (per column):**
- `name` → `COALESCE(anonymous_alias, archetype, 'Verified Expert')`
- `title` → `COALESCE(anonymous_headline, archetype, 'Verified Expert')`
- `description` → `COALESCE(anonymous_bio, <composed template>)` where the template is
  `'Senior ' || archetype || ' with <n>+ years … across <sector_tags> . Specialises in <specialties>.'`
  — built ONLY from structured fields; this is the "too anonymous" copy the ticket targets
- `company` → `COALESCE(anonymous_company_label, 'Undisclosed')`
- `location` → `origin_country` (coarse), `experience` → regex-sanitised `"<n>+ years"` token only
- `image`/`avatar_url` → NULL, `experience_tiles` → `[]`, `slug` → `anon-<first 8 of id>`
- `website`, `contact`, `linkedin_photo_url` are never in the view for anyone

**Key architectural fact:** the *published* home for anonymous copy already exists (the four
`anonymous_*` columns), and its publish path (edge function → columns → view) is already
identity-safe and MES-106-verified. Richer copy does **not** require touching the view, the
grants, or RLS — it only needs better *content* in those columns, plus somewhere non-public to
hold drafts.

### A2. Admin flow (`/admin/mentors`, `src/pages/AdminMentors.tsx`)

- Table of all mentors (admin-only base-table SELECT policy shows real identity), per-row
  anonymity `Switch`. Toggling ON opens the "Anonymize" dialog.
- Dialog fields: public alias, headline, company label, anonymous bio, each with:
  - pre-fill from existing overrides or `suggestAnonymousAlias()` (taxonomy-derived),
  - a live "What the public will see" preview mirroring the view's composer
    (`suggestAnonymousBio()` in `src/lib/mentorDisplay.ts` is the client twin of the SQL),
  - a **"Use suggested"** button (the upgrade point named in the ticket) that fills the bio with
    the same template string,
  - an advisory **identity-leak guard** (`identityLeak()` — token-aware, stopword- and
    country-word-filtered check against the mentor's real name + company) that **blocks save**.
- Save → `admin-mentor-anonymity` → updates flag + overrides → returns the masked public row for
  the toast. Public query caches are invalidated.

### A3. Render surfaces for anonymous mentors (all read `community_members_public`)

| Surface | File | What renders |
|---|---|---|
| Directory card | `src/components/mentors/MentorCard.tsx` | Alias heading, "Anonymous mentor" chip (EyeOff), Globe avatar, **description excerpt truncated at 120 chars**, specialties padded with sector tags, corridor chips, CardCTA "Get warm intro" |
| Profile page | `src/pages/MentorProfile.tsx` (`/mentors/:categorySlug/anon-<id8>`) | Masked H1 + Anonymous badge, headline as title, About = `bio_full \|\| description` (for anon: the view's `description`), Specialties chips, sanitised Experience line, Quick Facts (Who they help / From / Market Corridors / Sectors), warm-intro CTA; SEO title/JSON-LD/breadcrumb/bookmark all use masked name |
| Sector pages | `src/components/sectors/CommunityMembersSection.tsx` + `PersonCard`/`PersonModal` | Masked, Globe avatar, no company |
| Search | `src/hooks/useMasterSearch.ts` | Masked view rows |
| Sitemap | `sitemap` edge function | Emits masked `anon-*` slug automatically (MES-79) |
| Country pages | `get_country_page(slug)` RPC | Joins `community_members_public` — masked |
| MCP / KB | `search-mentors` tool, `mes_knowledge_base` | View-sourced |
| Report pipeline | `generate-report`, `generate-plan` | Anonymous mentors **excluded** from matching (`.eq("is_anonymous", false)`, test-asserted) — no change needed |

**Client payload check:** anonymous identity is withheld server-side (anon role has zero base-table
grants; the only base-table SELECT policy is admin-only), so richer copy cannot regress MES-106 as
long as it ships through the existing columns/view. Verified the view definition is unchanged by
later migrations (20260711*, 20260714*, 20260718* only *read* the view).

**Freemium note:** `MentorProfile` is wrapped in `FreemiumGate` (3 free views for anonymous
visitors); mentor matching remains Growth+ elsewhere. Richer copy strengthens the teaser without
touching gating — no gating code in scope.

### A4. Source data available to fuel richer copy (prod, 2026-07-19, read-only)

134 mentors, 132 active. **7 flagged anonymous; 5 active** (2 are deactivated legacy
placeholders). Of the 5: all have an admin alias, 4 have headlines, 1 has a company label,
**0 have an admin-authored `anonymous_bio`** — all five serve the composed template string
today. Archetypes: Trade & Government (48), International Founder (47), Active Advisor (22),
Scaled Founder (15).

Fill rates across the 132 active mentors (and the 5 active anonymous specifically):

| Field | Coverage (active) | Notes for generation |
|---|---|---|
| `description` (real bio, admin-only) | 132/132, avg ~495 chars; anon 5: 372–588 chars | **Primary fuel.** Names real employers — must be generalised, never quoted |
| `experience` | 132/132 but avg 56 chars — essentially just a "<n>+ years" phrase | Seniority signal only |
| `experience_tiles` (company logos jsonb) | 132/132 (anon 5: 2 tiles each) | Company names → generalise to **company types** |
| `specialties` | 132/132, avg 2.8 | Service relevance (e.g. Sales / GTM, Fundraising) |
| `sector_tags` | 121/132 (anon 5: 1 each) | Sector framing |
| `archetype` | 132/132 (text column — the MES-170 reference table does **not** exist yet) | Copy angle per archetype |
| `persona_fit` | 132/132 | "Who they help" |
| `market_corridors` | 98/132 (anon 5: only 2 have one) | Corridor framing where present |
| `origin_country` | 101/132 (anon 5: 3 have it) | Alias + corridor framing |

**Gap flags:** (1) no per-mentor quantified achievements exist anywhere — the exemplars' numbers
("two govtech companies", "10+ years") must come only from `description`/`experience`, or be
omitted; thin-data mentors get honestly thinner copy per MES-174. (2) `market_corridors`/
`origin_country` are missing for some anonymous mentors — copy degrades gracefully. (3) The
current 5 anonymous mentors all have usable ~400-char real bios + 2 experience tiles: enough for
exemplar-grade copy.

### A5. Existing plumbing reusable for generation

- **Admin AI precedent:** `classify-personas` — `requireAdmin()` + service-role read + Anthropic
  batch classification over `community_members`. Same shape as what MES-208 needs.
- **Leak lint:** `identityLeak()` in `src/lib/mentorDisplay.ts` (unit-tested) — portable to a
  shared module for server-side use; currently checks name + company only (not tile companies).
- **Deploy:** `admin-mentor-anonymity` is in the auto-deploy GitHub Action; a new function must be
  added there (or deployed manually).
- **Secrets:** `ANTHROPIC_API_KEY` and `LOVABLE_API_KEY` already provisioned — **no new env vars**.

---

## Part B — Recommended plan (Phase 2, on approval)

### B1. Design principle: publish through the existing pipe

Generated copy is a **draft proposal for the existing four columns** (alias, headline, company
label, bio). Approval = writing those columns via the existing `admin-mentor-anonymity` function.
This means **zero changes to the public view, grants, or RLS on `community_members`** — the
MES-106 masking chain is untouched by construction. The only new storage is a non-public drafts
table.

### B2. Copy framework (the generation contract)

Each draft targets the ticket's gold-standard exemplars, structured as:
1. **Alias** — distinguishing, taxonomy-plus ("UK Govtech Founder", not "UK International Founder").
2. **Headline** — one achievement-led line ("Founder who has taken two govtech companies into new markets").
3. **Bio (About)** — 3 movements in ~80–120 words: *generalised achievement(s)* (companies →
   company types; numbers only if present in stored data) → *what they've done/for whom* (sectors,
   corridor, buyer types) → *explicit "Best for …"* sentence naming persona, stage, and services
   (drawn from `persona_fit` + `specialties`).
4. **Company label** — a company *type* ("ASX-listed fintech"), only when derivable; else blank → "Undisclosed".

Grounding rules baked into the prompt: use ONLY the supplied record; never name a person,
employer, product, or place of work; generalise employers to categories; no invented figures,
clients, or credentials (MES-174); if the record is thin, write less rather than pad; Australian
English; ticket exemplars included as few-shot targets.

### B3. Generation architecture

- **New edge function `admin-mentor-anon-copy`** (`verify_jwt = true` + `requireAdmin()` +
  service role — the `classify-personas` pattern). Modes: `{ mentor_id }` (single) and
  `{ batch: true }` (all `is_anonymous` mentors without a pending/approved draft; ~5 rows —
  synchronous is fine, capped batch size).
- **Provider: Anthropic Claude direct** (`ANTHROPIC_API_KEY`, model overridable via env, matching
  `RQ_LOOP_MODEL` convention). Rationale: tiny corpus (≤134 lifetime, 5 today) so cost is
  negligible, and this is a judgement-heavy identity-safety task — the same reason MES already
  routes classification/adjudication to Anthropic rather than the Gemini gateway. (Gateway remains
  the documented alternative if preferred.)
- **Server-side leak lint** on every draft before storing: port `identityLeak()` to
  `supabase/functions/_shared/` (or a shared pure module), extended to also check
  **`experience_tiles` company names** — a real gap in the current client-only guard. On a hit:
  one automatic regeneration with the offending term fed back; still dirty → draft stored as
  `flagged` (never auto-fillable without the admin seeing the warning).
- Output JSON additionally carries a **claims trace** (each factual claim → the source field it
  came from), stored with the draft and shown in review — makes the MES-174 check one glance.

### B4. Draft storage (the only schema change — additive)

New table `mentor_anon_copy_drafts`: `id`, `mentor_id` FK, the four draft fields, `best_for`
(kept inside the bio for rendering, stored separately for future structured use), `claims` jsonb,
`leak_flags` jsonb, `status` (`draft` | `approved` | `rejected` | `flagged`), `model`,
`generated_at`, `reviewed_by`, `reviewed_at`. **RLS: admin-only SELECT; writes service-role only.
No anon/authenticated grants — drafts are never publicly readable.** Reversible; no destructive
change. *(RLS-touching → approval-gated: this table is the reason Phase 2 needs sign-off.)*

### B5. Admin workflow (upgrade of the existing dialog — kept one-click-fast)

- `/admin/mentors` rows gain a draft-status chip; header gains **"Generate drafts for all
  anonymous mentors"** (batch).
- In the Anonymize dialog, **"Use suggested" becomes "Generate AI copy"** (template composer stays
  as offline fallback). Latest draft pre-fills the four fields; admin edits inline (existing
  inputs), sees claims trace + leak warnings (existing `LeakWarning`, now also fed by server
  flags), then the existing **Anonymize/Save = approve** → columns updated via
  `admin-mentor-anonymity`, draft marked `approved`. **Regenerate** re-runs generation. Unapproved
  drafts change nothing publicly — the view keeps serving current copy.

### B6. Rendering

No new surfaces needed: bio ships as `description` (profile About + card excerpt — prompt
instructs an achievement-led first sentence so the 120-char card truncation still sells),
headline as `title`, alias as `name`, Quick Facts unchanged. Verify at 390px. Non-anonymous
mentors untouched.

### B7. Testing

- Unit: prompt-builder + leak-lint pure modules (`node --test`, incl. tile-company leakage and
  thin-record degradation); existing `mentorDisplay` tests untouched.
- Manual/QA: generate for all 5 active anonymous mentors across their 3 archetypes; verify zero
  leakage (automated + eyeball against real bios), claims all trace, approve/edit/regenerate flows,
  network payloads clean (no MES-106 regression), mobile 390px, freemium gate unchanged.
- Full `mes-qa` exam before the PR (mandatory).

### B8. Rollout & rollback

Batch-generate drafts for the 5 active anonymous mentors → admin reviews/approves individually →
spot-check surfaces. Rollback: don't approve (nothing changes publicly); revert PR removes
feature; drafts table is additive and droppable. No feature flag needed — the only entry point is
the admin page.

### B9. Estimated scope

~1 migration (drafts table + RLS), 1 new edge function (+ config.toml + deploy workflow entry),
1 shared leak-lint module + tests, AdminMentors dialog upgrade, no public-surface code changes.

### B10. Decision points for approval

1. **Drafts table + RLS** (B4) — the one approval-gated item. Alternative zero-migration MVP:
   generate on demand in the dialog only (no batch persistence, no status chips).
2. **Provider** — recommendation: Anthropic direct (B3); Lovable gateway/Gemini is the alternative.
3. **Structured `best_for` column now vs. bio-embedded only** — recommendation: bio-embedded now,
   structured later if a dedicated render block is wanted.

---

## Part C — Implementation notes (Phase 2, as shipped)

- **Migration** `20260719010000_mes208_mentor_anon_copy_drafts.sql`: `mentor_anon_copy_drafts`
  (drafts + claims + leak_flags + status), RLS on, default grants stripped, admin-only SELECT,
  service-role-only writes; one pending row per mentor via a partial unique index. Additive and
  reversible (drop the table).
- **Edge function** `supabase/functions/admin-mentor-anon-copy/` — `verify_jwt = true` +
  `requireAdmin()` + service role. Actions: generate (`{mentor_id}` | `{batch: true[, force]}`,
  batch capped at 20) and review (`{draft_id, status: approved|rejected}`). Anthropic direct
  (`claude-sonnet-4-6`, overridable via **`ANON_COPY_MODEL`** — the only new env name, optional),
  60s timeout, 1200 max_tokens, at most 2 calls per mentor (one leak-lint retry). Pure modules
  `prompt.ts` (system prompt, exemplars, never-echo list, JSON parsing) and `leakCheck.ts`
  (leak terms from real name + company + experience-tile companies) are unit-tested via `npm test`.
- **Publishing path unchanged:** approval still writes `community_members.anonymous_*` via
  `admin-mentor-anonymity`; the public view/grants are untouched (no MES-106 surface change).
- **Admin UI** (`/admin/mentors`): "Generate AI drafts" batch button; per-row "AI draft ready /
  flagged" chips and an "Edit copy" action for already-anonymous mentors; the dialog pre-fills
  from the pending draft, offers Generate/Regenerate AI copy (template composer retained as
  "Use template"), shows the claims trace + server leak flags, and Discard draft (reject).
  Saving publishes and marks the draft approved.
- **Deploy:** function added to `supabase/config.toml` and the deploy-edge-functions workflow.
- **Follow-ups:** regenerate Supabase types to drop the `(supabase as any)` cast for the drafts
  table; MES-170 archetype vocabulary can later enrich the prompt; optional structured
  `best_for` render block if wanted.

---

## Part D — Copy-quality + anonymity follow-up (post-merge iteration)

Reviewing the first generated drafts (April Palmerlee, Alan Tsen) surfaced two things the
initial version got wrong, fixed here:

1. **Semantic identity leak the token lint can't see.** "CEO of Australia's largest US–Australia
   business organisation" names no one but resolves to exactly one org (→ one person). The token
   lint only catches literal name/company echoes, so it passed. **Root reframe:** anonymity and
   specificity are separate axes. *Attributes* (sector, corridor, seniority, company TYPE, kind of
   achievement, services, stage, location) never identify anyone and should be rich — generic copy
   is the real failure. *Identifiers* (name, exact employer, a one-of-a-kind role/org, named
   clients/deals, org-fingerprint figures) resolve to one person and are the only things abstracted.
   The line is **resolvability, not vocabulary** — superlatives are fine when many orgs fit
   ("a national trade agency"), a leak only when one fits ("the peak body for X").

2. **Copy read as an anonymised résumé, not a value case.** Rewritten **value-first**: every draft
   answers "why would *I* want this intro?" for the mentor's `persona_fit` audience (international
   entrant landing in ANZ vs scaling ANZ startup), leads with a generalised achievement, and ends
   with an explicit "If you're a … expect …" value beat naming services + stage.

Changes shipped:
- **`prompt.ts`** rewritten to the value-first / attributes-vs-identifiers / resolvability model,
  with persona definitions inline and value-first exemplars; `location` added to the record.
- **`reviewer.ts`** — a new semantic *resolvability reviewer*: a second AI pass that judges whether
  a draft (plus the visible sector/corridor/location) resolves to one real person/org, returning
  the exact giveaway phrases. Runs after a clean token lint; a hit feeds one retry, else the draft
  ships `flagged`. Fails safe (unparseable ⇒ treat as needs-review). Admin review stays mandatory.
- **Location mask** (`20260719140000`): `community_members_public` now shows anonymous mentors'
  real city/region base (metro-level, identity-safe — verified against live rows) instead of the
  coarse origin country, so profiles carry the "based in Sydney, came from Singapore" corridor
  signal that drives pickability. Every other mask preserved byte-for-byte + regression guards;
  `mentorLocationLabel` simplified accordingly.
- Cost: ≤4 Anthropic calls per mentor worst case (2 generation + up to 2 reviewer); batch cap 10,
  resumable. Negligible on the ~5-mentor corpus.
