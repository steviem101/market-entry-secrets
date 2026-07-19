/**
 * Prompt builder for AI-generated anonymous mentor copy (MES-208).
 *
 * Pure module (no Deno APIs) so the prompt contract is unit-testable.
 *
 * Design (value-first, MES-208 follow-up):
 *   - The copy answers "why would *I* want this intro?" for the mentor's
 *     audience(s) — an international entrant landing in ANZ, or a scaling
 *     ANZ startup/company (from persona_fit).
 *   - Anonymity and specificity are separate axes. ATTRIBUTES (sector,
 *     corridor, seniority, company TYPE, kind of achievement, services,
 *     stage, location, who they help) never identify anyone and should be
 *     rich — generic copy is the failure mode. IDENTIFIERS (name, exact
 *     employer, a one-of-a-kind role/org, named clients/deals, org-fingerprint
 *     figures) resolve to one person and are the only things abstracted.
 *   - The line is *resolvability*, not vocabulary: a phrase leaks only if it
 *     (plus the visible facts) points to one findable person/org.
 *   - Grounded strictly in the record (MES-174); Australian English.
 */

export interface MentorSourceRecord {
  archetype: string | null;
  origin_country: string | null;
  location: string | null;         // city/region base, e.g. "Melbourne, Victoria, Australia"
  description: string;             // real bio (admin-only) — the primary fuel
  experience: string | null;
  specialties: string[] | null;
  sector_tags: string[] | null;
  persona_fit: string[] | null;    // international_entrant | local_startup | both | functional_expert
  market_corridors: string[] | null;
  tile_companies: string[];        // experience-tile company names (to generalise, never repeat)
  real_name: string;               // supplied so the model knows what it must never echo
  real_company: string | null;
}

export interface GeneratedDraft {
  alias: string;
  headline: string;
  company_label: string | null;
  bio: string;
  best_for: string;
  claims: { claim: string; source: string }[];
}

export const DRAFT_JSON_KEYS = [
  "alias",
  "headline",
  "company_label",
  "bio",
  "best_for",
  "claims",
] as const;

export const SYSTEM_PROMPT = `You write anonymous mentor profiles for Market Entry Secrets (MES), a platform helping companies enter the Australian/NZ (ANZ) market. MES protects some mentors' identities and concierges a warm introduction. The reader is deciding whether to request that intro. Your ONE job: make a specific, credible case for why THIS mentor is worth it — to a specific kind of reader — without letting anyone work out who the mentor is.

TWO THINGS AT ONCE, ON DIFFERENT AXES — do not confuse them:
- Be RICH on ATTRIBUTES. These never identify anyone, and the more concrete they are the more likely the reader picks this mentor: what they do and how deep, sector(s), the market corridor(s) they work, seniority/years, the TYPE of company they've operated in, the KIND of achievement, the services they can give you, the stage they suit, and where they're based. Generic, could-be-anyone copy is a FAILURE.
- Be SURGICAL on IDENTIFIERS. Only these resolve to one real person: the mentor's name; their exact employer; a one-of-a-kind role or organisation ("the CEO of the single body that does X"); named clients, products or deals; and pinpoint figures that fingerprint one organisation. Abstract ONLY these — turn a named employer into a company TYPE, soften a unique role.

THE TEST for every clause: could a reader, using this phrase plus the visible facts (sector, corridor, location), find the real person or company in two web searches? If NO, keep it — however specific. If YES, generalise just that clause and nothing else. Superlatives are fine when many organisations fit ("a national trade agency", "a Big 4 firm", "an ASX-listed fintech"); they leak only when exactly one fits ("the peak body for X in Australia", "the largest Y in Z"). Lead with the achievement, not the job title — never open with "CEO of…" / "Leads…".

VALUE-FIRST — the profile answers "why would I want this intro?". MES serves two audiences; the mentor's persona_fit says which:
- international_entrant: an overseas company entering the ANZ market. Needs: market entry, procurement, regulatory navigation, first local hires, government/channel access, corridor sequencing.
- local_startup: an Australian/NZ founder scaling locally or abroad. Needs: fundraising, go-to-market, partnerships, scaling operations, international expansion.
- both: address both audiences briefly. functional_expert or empty: infer the fit from the record.

WRITE:
- alias: a short label positioning them by the VALUE they bring, not archetype+sector. e.g. "US → Australia Landing Advocate", "ANZ Fintech Investor & Operator".
- headline: one achievement-led line, pointed at the outcome the reader wants.
- bio: 70-100 words, three beats — (1) a concrete, generalised achievement (institution abstracted, achievement kept vivid); (2) the experience that transfers to the reader's journey; (3) an explicit value beat: "If you're a [their audience], …" naming the services and stage they help with. The first sentence carries the strongest hook — directory cards truncate near 120 characters.
- company_label: a company TYPE if one is clearly derivable, else null.
- best_for: the value beat as one standalone sentence.

GROUNDING (MES-174): use ONLY the supplied record. Never invent achievements, clients, figures, credentials or years; a number appears only if it is in the record. Thin record → write less, never pad. For every factual claim, add a "claims" entry naming the record field it came from (e.g. "description", "experience", "specialties", "market_corridors", "location").

STYLE: Australian English (personalise, organisation, specialises), sentence case, confident and concrete, no hype adjectives.

Return ONLY a JSON object with keys: alias, headline, company_label, bio, best_for, claims. No markdown fences, no commentary.`;

// Value-first exemplars — fictional composites that set the bar. They show the
// shape (achievement-led, institution abstracted, persona-aligned value beat),
// not content to copy: real copy is grounded only in the record supplied.
export const EXEMPLARS = `Quality bar (fictional exemplars — match the shape and specificity, but ground YOUR copy only in the record):

1. persona_fit international_entrant → alias "UK → ANZ Govtech Founder"; headline "Has taken two govtech companies into new markets, including Australia"; bio "Founded and scaled two B2B govtech companies in the UK, taking one from its first overseas customer to a multi-country footprint including Australia — selling directly to national and state government buyers and raising institutional funding along the way. If you're an overseas founder entering ANZ in government or a regulated sector, expect hands-on help with public-sector procurement, sequencing the UK → Australia corridor and your first local hires, from someone who has already made those mistakes."; best_for "Best for overseas founders entering ANZ in government or regulated sectors — on procurement, corridor sequencing and first hires."

2. persona_fit both → alias "APAC Market-Entry & Government Access"; headline "A decade inside a national trade agency landing companies in new markets"; bio "Spent 10+ years inside a national trade agency helping hundreds of technology and consumer companies expand across APAC, and knows how grants, landing pads and agency introductions actually get used versus where founders waste months. Whether you're entering Australia from overseas or an ANZ company pushing into Asia, expect a candid read on which government channels are worth it and warm routes into the ones that are."; best_for "Best for companies weighing an ANZ or APAC entry who want government channels to be a real GTM lever, not a box-tick."

3. persona_fit local_startup → alias "ANZ Fintech Investor & Operator"; headline "Has raised, invested and advised across dozens of ANZ fintechs"; bio "Co-founded a venture network and has backed or advised dozens of fintech and financial-services startups across ANZ and Asia — sitting on both sides of the table, raising rounds and writing cheques. If you're an Australian founder preparing a raise or building financial-services partnerships, expect direct feedback on your deck, your round and which local investors actually follow through, plus warm introductions to the ones who fit."; best_for "Best for ANZ founders preparing a raise or financial-services partnerships — on deck, round strategy and investor fit."`;

export const buildUserPrompt = (record: MentorSourceRecord): string => {
  const lines = [
    EXEMPLARS,
    "",
    "Mentor record (the ONLY permitted source of facts):",
    JSON.stringify(
      {
        archetype: record.archetype,
        origin_country: record.origin_country,
        location: record.location,
        description: record.description,
        experience: record.experience,
        specialties: record.specialties,
        sector_tags: record.sector_tags,
        persona_fit: record.persona_fit,
        market_corridors: record.market_corridors,
        experience_tile_companies: record.tile_companies,
      },
      null,
      2,
    ),
    "",
    `NEVER-ECHO LIST — these exact words identify the mentor and must not appear in any output field: ${[
      record.real_name,
      record.real_company,
      ...record.tile_companies,
    ]
      .filter(Boolean)
      .join("; ")}. Generalise each employer in the record and this list to a company type. Location and corridor ARE allowed and encouraged.`,
    "",
    "Write the anonymous profile JSON now.",
  ];
  return lines.join("\n");
};

/**
 * Feedback prompt for the automatic retry after a leak / resolvability hit.
 * `offending` are the exact terms or phrases that must be removed/generalised.
 */
export const buildRetryPrompt = (offending: string[]): string =>
  `Your previous draft failed the anonymity check: it would let a reader identify the real person or organisation via ${offending
    .map((t) => `"${t}"`)
    .join(", ")}. Rewrite the profile so those are removed or generalised to a company TYPE or a plural category (keep it specific and compelling on sector, corridor, seniority, services and location — only the identifying phrases change). Return the same JSON shape.`;

/** Parse the model's reply into a draft; tolerates accidental code fences. */
export const parseDraft = (text: string): GeneratedDraft | null => {
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(stripped.slice(start, end + 1));
    if (typeof obj.alias !== "string" || typeof obj.bio !== "string") return null;
    return {
      alias: obj.alias,
      headline: typeof obj.headline === "string" ? obj.headline : "",
      company_label:
        typeof obj.company_label === "string" && obj.company_label.trim()
          ? obj.company_label
          : null,
      bio: obj.bio,
      best_for: typeof obj.best_for === "string" ? obj.best_for : "",
      claims: Array.isArray(obj.claims)
        ? obj.claims
            .filter(
              (c: unknown): c is { claim: string; source: string } =>
                !!c &&
                typeof (c as { claim?: unknown }).claim === "string" &&
                typeof (c as { source?: unknown }).source === "string",
            )
            .slice(0, 20)
        : [],
    };
  } catch {
    return null;
  }
};
