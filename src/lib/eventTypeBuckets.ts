/**
 * Events type canonicalisation (MES-130, owned classification).
 *
 * The raw `events.type` column is free-text with 20 compound near-duplicates
 * ("Conference + Exhibition", "Summit + Pitch Night", …). This maps every value
 * to a small canonical bucket so the Type filter is usable.
 *
 * INTERIM, frontend-only: this constant is the reviewed value→canonical mapping
 * from docs/audits/mes-130/events-type-value-to-canonical.csv. Phase B ships an
 * additive `events.type_canonical` column (approval-gated) that supersedes this
 * at the read path; until then the mapping runs here. Reversible by config.
 *
 * Rule: exact match → synonym → lead-token (the first dominant format word in a
 * compound decides the bucket). Aligned with MES-108's event-bucket direction.
 */

export interface EventTypeBucket {
  value: string;
  label: string;
}

/** Canonical buckets, in a stable display order. `webinar` is reserved for
 *  online events (no rows today — hidden by the zero-count curation rule). */
export const EVENT_TYPE_BUCKETS: EventTypeBucket[] = [
  { value: "conference", label: "Conference" },
  { value: "networking", label: "Networking" },
  { value: "expo-trade-show", label: "Expo & Trade Show" },
  { value: "pitch-demo-day", label: "Pitch & Demo Day" },
  { value: "festival-showcase", label: "Festival & Showcase" },
  { value: "workshop-training", label: "Workshop & Training" },
  { value: "webinar", label: "Webinar" },
  { value: "other", label: "Other" },
];

export const EVENT_TYPE_BUCKET_LABEL: Record<string, string> = Object.fromEntries(
  EVENT_TYPE_BUCKETS.map((b) => [b.value, b.label]),
);

/** Explicit mapping of every raw value present in prod (2026-07-13). */
const EXACT: Record<string, string> = {
  "Networking": "networking",
  "Conference": "conference",
  "Conference + Exhibition": "conference",
  "Conference + Expo": "conference",
  "Conference + Investor Presentation": "conference",
  "Conference + Networking": "conference",
  "Summit": "conference",
  "Summit + Exhibition": "conference",
  "Summit + Pitch Night": "conference",
  "Pitch Night": "pitch-demo-day",
  "Trade Show + Conference": "expo-trade-show",
  "Trade Show": "expo-trade-show",
  "Trade Exhibition": "expo-trade-show",
  "Expo": "expo-trade-show",
  "Airshow + Trade Exhibition": "expo-trade-show",
  "Workshop": "workshop-training",
  "Festival + Conference": "festival-showcase",
  "Festival + Conference + Exhibition": "festival-showcase",
  "Festival + Conference + Startup Expo": "festival-showcase",
  "Showcase + Networking": "festival-showcase",
};

/**
 * Lead-token heuristic for any value not in the explicit map (keeps future
 * ingested types from silently falling into a raw dropdown). Order encodes the
 * documented priority: Conference/Summit > Expo/Trade/Exhibition/Airshow >
 * Pitch > Networking > Workshop > Festival/Showcase > Webinar.
 */
function heuristicBucket(raw: string): string {
  const t = raw.toLowerCase();
  if (t.includes("conference") || t.includes("summit")) return "conference";
  if (t.includes("expo") || t.includes("trade") || t.includes("exhibition") || t.includes("airshow"))
    return "expo-trade-show";
  if (t.includes("pitch") || t.includes("demo")) return "pitch-demo-day";
  if (t.includes("network")) return "networking";
  if (t.includes("workshop") || t.includes("training") || t.includes("masterclass")) return "workshop-training";
  if (t.includes("festival") || t.includes("showcase")) return "festival-showcase";
  if (t.includes("webinar") || t.includes("online") || t.includes("virtual")) return "webinar";
  return "other";
}

/** Map a raw `events.type` value to its canonical bucket value. */
export function bucketForEventType(raw: string | null | undefined): string {
  if (!raw) return "other";
  return EXACT[raw] ?? heuristicBucket(raw);
}

/**
 * Resolve an event's canonical bucket: prefer the DB `type_canonical` column
 * (MES-130 backfill) when present, else compute from the raw `type`. Keeps the
 * UI correct whether or not the backfill has landed / a row is freshly ingested.
 */
export function resolveEventBucket(e: { type_canonical?: string | null; type?: string | null }): string {
  return e.type_canonical || bucketForEventType(e.type);
}
