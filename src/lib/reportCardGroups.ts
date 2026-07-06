/**
 * Group a report section's match cards by entity type so a section that mixes
 * types renders one sub-headed grid per type instead of a single jumbled grid
 * (Stage 5 render bug B9). Supersedes the old events-only `splitEventsAndResources`.
 *
 * New reports tag each card with `card_group` (set in generate-report's
 * getMatchesForSection). Older reports predate the tag, so we fall back to a
 * heuristic on linkLabel/link — the same signals the previous events split used —
 * so both surfaces group correctly regardless of when the report was generated.
 *
 * Pure module — no DOM — unit-tested under `node --test`.
 */

export interface SectionCard {
  link?: string;
  linkLabel?: string;
  card_group?: string;
  [key: string]: unknown;
}

export interface CardGroup<T extends SectionCard> {
  key: string;
  label: string;
  items: T[];
}

// Display order + heading per section. First entry is the primary type.
const SECTION_GROUP_ORDER: Record<string, Array<[string, string]>> = {
  service_providers: [
    ["providers", "Service Providers"],
    ["agencies", "Government & Trade Bodies"],
    ["innovation", "Innovation Hubs & Accelerators"],
  ],
  events_resources: [
    ["events", "Upcoming Events"],
    ["resources", "Case Studies & Resources"],
  ],
  lead_list: [
    ["leads", "Lead Databases"],
    ["contacts", "Industry Contacts"],
  ],
};

/** Resolve a card's group: explicit tag first, else a linkLabel/link heuristic. */
function groupKeyOf(sectionId: string, c: SectionCard): string {
  if (typeof c.card_group === "string" && c.card_group) return c.card_group;
  switch (sectionId) {
    case "service_providers":
      if (c.linkLabel === "View Organisation") return "agencies";
      if (c.linkLabel === "View Hub") return "innovation";
      return "providers";
    case "lead_list":
      if (c.linkLabel === "Locked" || c.link === "#") return "contacts";
      return "leads";
    case "events_resources":
      if (c.linkLabel === "Read More" || (typeof c.link === "string" && c.link.startsWith("/content/"))) return "resources";
      return "events";
    default:
      return "";
  }
}

/** Title-case an unrecognised group key so a novel tag still gets a readable heading. */
function humanizeKey(key: string): string {
  return key.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

/**
 * Bucket a section's cards into ordered, non-empty groups. Returns null when the
 * section has no multi-type grouping defined (caller renders a flat grid).
 * Unknown/novel group keys are appended after the known ones, original order kept.
 */
export function groupSectionCards<T extends SectionCard>(sectionId: string, items: T[]): CardGroup<T>[] | null {
  const order = SECTION_GROUP_ORDER[sectionId];
  if (!order) return null;

  const buckets = new Map<string, T[]>();
  const seenOrder: string[] = [];
  for (const it of items || []) {
    const key = groupKeyOf(sectionId, it) || "other";
    if (!buckets.has(key)) {
      buckets.set(key, []);
      seenOrder.push(key);
    }
    buckets.get(key)!.push(it);
  }

  const labelFor = new Map(order.map(([k, l]) => [k, l]));
  const orderedKeys = [
    ...order.map(([k]) => k).filter((k) => buckets.has(k)),
    ...seenOrder.filter((k) => !labelFor.has(k)), // novel keys after the known set
  ];

  return orderedKeys.map((k) => ({ key: k, label: labelFor.get(k) || humanizeKey(k), items: buckets.get(k)! }));
}
