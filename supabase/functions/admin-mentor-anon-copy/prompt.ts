/**
 * Prompt builder for AI-generated anonymous mentor copy (MES-208).
 *
 * Pure module (no Deno APIs) so the prompt contract is unit-testable. The
 * grounding + identity rules here are the ticket's non-negotiables: copy is
 * built ONLY from the supplied record, employers become company types, no
 * invented figures/clients/credentials (MES-174), Australian English, and the
 * gold-standard exemplars from the ticket set the quality bar as few-shot
 * targets.
 */

export interface MentorSourceRecord {
  archetype: string | null;
  origin_country: string | null;
  description: string;           // real bio (admin-only) — the primary fuel
  experience: string | null;
  specialties: string[] | null;
  sector_tags: string[] | null;
  persona_fit: string[] | null;
  market_corridors: string[] | null;
  tile_companies: string[];      // experience-tile company names (to generalise, never repeat)
  real_name: string;             // supplied so the model knows what it must never echo
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

export const SYSTEM_PROMPT = `You write anonymous mentor profiles for Market Entry Secrets (MES), a platform helping companies enter the Australian/NZ market. MES protects some mentors' identities: users see the TYPE of mentor they could be introduced to (via a concierge warm intro) without discovering who they are. Your copy must make users actively want the introduction — while making the mentor untraceable.

HARD RULES (identity):
- Never include the mentor's name, their employers' or clients' names, product names, or any uniquely identifying title or claim (no "CEO of Australia's only X" giveaways).
- Generalise every employer/client to a company TYPE (e.g. "a national trade agency", "an ASX-listed fintech", "two B2B govtech companies").
- Coarse geography is welcome (origin country, corridors); cities, suburbs and named institutions are not.

HARD RULES (grounding — MES-174):
- Use ONLY the record supplied. Never invent achievements, clients, figures, credentials or years. A number may appear only if it is present in the record.
- If the record is thin, write less rather than pad. Honest and shorter beats impressive and invented.
- For every factual claim in the copy, add an entry to "claims" naming the record field it came from (e.g. "description", "experience", "experience_tiles", "specialties").

STYLE:
- Australian English (personalise, organisation, specialises). Sentence case. Confident, concrete, no hype adjectives.
- alias: a short distinguishing label, not a sentence (e.g. "UK Govtech Founder").
- headline: one achievement-led line.
- bio: 80–120 words, three movements — (1) generalised achievement(s), (2) what they have done and for whom (sectors, corridor, buyer types), (3) a final sentence starting "Best for" naming who they help, at what stage, and for which services. The first sentence must carry the strongest achievement: directory cards truncate at ~120 characters.
- best_for: repeat the "Best for …" sentence on its own.
- company_label: a company type only if one is clearly derivable from the record, else null.

Return ONLY a JSON object with keys: alias, headline, company_label, bio, best_for, claims. No markdown fences, no commentary.`;

// The ticket's gold-standard exemplars — fictional composites that set the bar.
export const EXEMPLARS = `Quality bar (fictional exemplars — match their specificity and shape, but ground YOUR copy only in the record supplied):

1. International Founder → alias "UK Govtech Founder"; headline "Founder who has taken two govtech companies into new markets"; bio "Founded and scaled two B2B govtech companies in the UK, taking one from its first overseas customer to a multi-country footprint including Australia. Has sold directly to national and state government buyers, navigated public-sector procurement on both sides of the deal, and raised institutional funding along the way. Best for early-stage founders selling into government or regulated sectors who are planning their first ANZ landing — especially on procurement, early hires, and sequencing the UK → Australia corridor."

2. Trade & Government → alias "APAC Trade & Government Insider"; headline "A decade inside a national trade agency helping companies land in new markets"; bio "Spent 10+ years inside a major Asian national trade agency supporting hundreds of technology and consumer companies through market expansion across APAC. Knows how grants, landing pads, trade missions and agency introductions actually get used — and where founders waste months. Best for companies weighing Australia against other APAC options, or wanting to turn government channels into a genuine GTM lever rather than a box-tick."

3. Active Advisor → alias "Fintech Investor & Operator"; headline "Has raised, invested and advised across dozens of ANZ fintechs"; bio "Co-founded a venture network and has backed or advised dozens of fintech and financial-services startups across ANZ and Asia, having sat on both sides of the table — raising rounds and writing cheques. Best for founders preparing an Australian raise or building financial-services partnerships: expect direct feedback on your deck, your round, and which local investors actually follow through."`;

export const buildUserPrompt = (record: MentorSourceRecord): string => {
  const lines = [
    EXEMPLARS,
    "",
    "Mentor record (the ONLY permitted source of facts):",
    JSON.stringify(
      {
        archetype: record.archetype,
        origin_country: record.origin_country,
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
      .join("; ")}. Generalise each employer in the record and this list to a company type instead.`,
    "",
    "Write the anonymous profile JSON now.",
  ];
  return lines.join("\n");
};

/**
 * Feedback prompt for the single automatic retry after a leak-lint hit.
 */
export const buildRetryPrompt = (offendingTerms: string[]): string =>
  `Your previous draft failed the identity-leakage check: it contained ${offendingTerms
    .map((t) => `"${t}"`)
    .join(", ")}. Rewrite the profile with those terms fully removed and generalised to company types or roles. Return the same JSON shape.`;

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
