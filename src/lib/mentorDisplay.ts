/**
 * Pure display helpers for mentor identity masking.
 *
 * Identity data for anonymous mentors is already withheld server-side by the
 * community_members_public view (alias name, masked headline, "Undisclosed"
 * company, NULL image, empty experience_tiles, anon-<id> slug). These helpers
 * cover the presentation layer on top of that: which heading to show and
 * whether initials may be derived, so cards and the profile page mask
 * consistently and never leak identity through a fallback path.
 */
// Relative (not "@/") because this module is unit-tested with node --test, whose
// resolver doesn't understand the Vite alias for runtime (value) imports.
import { sectorLabel } from "./sectorLabels.ts";

export interface MentorIdentity {
  name: string;
  title: string;
  is_anonymous: boolean;
}

/**
 * Card/profile heading. For anonymous mentors the view already masks `name` to
 * the admin alias (falling back to archetype / "Verified Expert"), so it is
 * always the safe, most descriptive label — use it directly. Real names only
 * ever reach here for non-anonymous mentors.
 */
export const mentorDisplayName = (m: MentorIdentity): string => m.name;

/**
 * Avatar initials. Returns null for anonymous mentors — callers render a
 * neutral glyph (Globe) instead, never initials derived from any field.
 */
export const mentorInitials = (m: MentorIdentity): string | null => {
  if (m.is_anonymous) return null;
  return m.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Origin-country and market-corridor codes are stored as snake_case slugs
 * ("uk", "usa", "hong_kong", "other_asia"; corridors "uk-to-australia").
 * These map them to presentable labels so the coarse geography we DO show
 * for anonymous mentors doesn't read as raw database codes.
 */
const COUNTRY_LABELS: Record<string, { label: string; flag: string }> = {
  australia: { label: "Australia", flag: "🇦🇺" },
  new_zealand: { label: "New Zealand", flag: "🇳🇿" },
  uk: { label: "UK", flag: "🇬🇧" },
  usa: { label: "USA", flag: "🇺🇸" },
  ireland: { label: "Ireland", flag: "🇮🇪" },
  singapore: { label: "Singapore", flag: "🇸🇬" },
  canada: { label: "Canada", flag: "🇨🇦" },
  france: { label: "France", flag: "🇫🇷" },
  germany: { label: "Germany", flag: "🇩🇪" },
  china: { label: "China", flag: "🇨🇳" },
  korea: { label: "South Korea", flag: "🇰🇷" },
  japan: { label: "Japan", flag: "🇯🇵" },
  india: { label: "India", flag: "🇮🇳" },
  hong_kong: { label: "Hong Kong", flag: "🇭🇰" },
  south_africa: { label: "South Africa", flag: "🇿🇦" },
  other_asia: { label: "Asia", flag: "🌏" },
  other_eu: { label: "Europe", flag: "🇪🇺" },
};

const countryKey = (raw: string): string =>
  raw.trim().toLowerCase().replace(/[\s-]+/g, "_");

/** "uk" → "🇬🇧 UK". Unknown values pass through untouched. */
export const countryLabel = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  const hit = COUNTRY_LABELS[countryKey(raw)];
  return hit ? `${hit.flag} ${hit.label}` : raw;
};

/** Country name without the flag, for prose like alias suggestions. */
export const countryName = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  return COUNTRY_LABELS[countryKey(raw)]?.label ?? null;
};

/** "uk-to-australia" → "🇬🇧 UK → 🇦🇺 Australia". */
export const corridorLabel = (corridor: string): string | null => {
  const [from, to] = corridor.split("-to-");
  if (!from || !to) return null;
  return `${countryLabel(from)} → ${countryLabel(to)}`;
};

/**
 * Sector-tag label for mentor cards/profile. Delegates to the shared
 * `sectorLabel` so canonical slugs render identically to the directory's sector
 * dropdown (e.g. "hospitals-and-health-care" → "Healthcare"); non-canonical
 * values fall back to plain humanisation.
 */
export const sectorTagLabel = (tag: string): string => sectorLabel(tag);

/**
 * Location label for a mentor card/profile. Since MES-208 the public view serves
 * anonymous mentors their real city/region base ("Melbourne, Victoria, Australia",
 * "Greater Sydney Area") — metro-level and identity-safe — rather than the coarse
 * origin-country slug. `countryLabel` prettifies bare country slugs/values (e.g.
 * "uk" → "🇬🇧 UK", "Australia" → "🇦🇺 Australia") and passes richer location text
 * through untouched, so the same call is correct for anonymous and named mentors.
 */
export const mentorLocationLabel = (m: {
  location: string | null;
  is_anonymous: boolean;
}): string | null =>
  countryLabel(m.location);

/**
 * Suggested anonymous alias for the admin marking UI, built only from
 * non-identifying taxonomy: "UK International Founder", "Fintech Active
 * Advisor". Keeps concurrently-anonymous mentors distinguishable without
 * an admin having to invent a label from scratch.
 */
export const suggestAnonymousAlias = (m: {
  archetype: string | null;
  origin_country: string | null;
  sector_tags: string[] | null;
}): string => {
  const base = m.archetype || "Verified Expert";
  const origin = countryName(m.origin_country);
  if (origin) return `${origin} ${base}`;
  const sector = m.sector_tags?.[0];
  if (sector) return `${sectorTagLabel(sector)} ${base}`;
  return base;
};

/**
 * persona_fit codes → human "who they help" phrases. These are audience tags,
 * not identity, so they are safe to show for anonymous mentors.
 */
const PERSONA_LABELS: Record<string, string> = {
  international_entrant: "International companies entering ANZ",
  local_startup: "Local startups scaling up",
  functional_expert: "Teams needing functional expertise",
  both: "International entrants & local startups",
};

export const personaFitLabel = (persona: string): string =>
  PERSONA_LABELS[persona.trim().toLowerCase()] ??
  persona.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Distinct "who they help" labels for a mentor's persona_fit array. */
export const personaFitLabels = (personaFit: string[] | null | undefined): string[] =>
  Array.from(new Set((personaFit || []).map(personaFitLabel)));

/**
 * Extract a sanitised seniority phrase ("20+ years") from arbitrary experience
 * text — digits + "years" only, never surrounding words that could name an
 * employer. Mirrors the SQL regex in the community_members_public view so the
 * admin dialog preview matches what the public will actually see. Returns null
 * when no such token exists.
 */
export const seniorityPhrase = (experience: string | null | undefined): string | null => {
  if (!experience) return null;
  const m = experience.match(/[0-9]+\+?\s*years?/i);
  return m ? m[0].replace(/\s+/g, " ").trim() : null;
};

/**
 * Client-side twin of the view's composed anonymous bio, built ONLY from
 * structured/public fields (archetype, sanitised seniority, sectors,
 * specialties). Used to preview and pre-fill the admin dialog; the server view
 * is the source of truth for what ships. Never consumes free text verbatim.
 */
export const suggestAnonymousBio = (m: {
  archetype: string | null;
  experience?: string | null;
  sector_tags: string[] | null;
  specialties: string[] | null;
}): string => {
  const years = seniorityPhrase(m.experience);
  const sectors = (m.sector_tags || []).filter(Boolean);
  const specialties = (m.specialties || []).filter(Boolean);
  let bio = `Senior ${m.archetype || "operator"}`;
  if (years) bio += ` with ${years} of experience`;
  if (sectors.length) bio += ` across ${sectors.map(sectorTagLabel).join(", ")}`;
  bio += ".";
  if (specialties.length) bio += ` Specialises in ${specialties.join(", ")}.`;
  return bio;
};

/**
 * Guard for the admin dialog: flag anonymous copy that would defeat the mask by
 * containing the mentor's real name or company. Returns the offending term, or
 * null when the text is clean. Case-insensitive, token-aware (won't false-fire
 * on short substrings). Advisory only — the server view never emits these
 * free-text fields, but the admin-authored overrides go out verbatim.
 *
 * Country/place names are deliberately NOT treated as leaks: a mentor's origin
 * is a welcomed, non-identifying signal (e.g. "Singapore Trade & Government"),
 * even when the country word also appears in their employer's name ("Enterprise
 * Singapore"). Only the distinctive company/person tokens trip the guard.
 */
export const identityLeak = (
  text: string,
  realName: string | null | undefined,
  realCompany: string | null | undefined,
): string | null => {
  const haystack = ` ${text.toLowerCase()} `;
  const terms: string[] = [];
  for (const source of [realName, realCompany]) {
    if (!source) continue;
    const full = source.trim().toLowerCase();
    if (full.length >= 3 && !COUNTRY_WORDS.has(full)) terms.push(full);
    // Also catch each significant word (e.g. surname, distinctive company word),
    // but never a country name — origin is welcomed, not identifying.
    for (const word of full.split(/\s+/)) {
      if (word.length >= 4 && !STOPWORDS.has(word) && !COUNTRY_WORDS.has(word)) {
        terms.push(word);
      }
    }
  }
  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|\\W)${escaped}(\\W|$)`).test(haystack)) return term;
  }
  return null;
};

const STOPWORDS = new Set([
  "group", "global", "ventures", "capital", "partners", "advisory",
  "consulting", "services", "company", "limited", "pty", "the", "and",
]);

// Country name tokens (from COUNTRY_LABELS keys + labels) that are welcomed in
// anonymous aliases and must not trip identityLeak, even when they also appear
// in an employer name. e.g. "singapore", "ireland", "new", "zealand", "hong".
const COUNTRY_WORDS = new Set(
  Object.entries(COUNTRY_LABELS).flatMap(([key, { label }]) => [
    ...key.split("_"),
    ...label.toLowerCase().split(/\s+/),
  ]),
);
