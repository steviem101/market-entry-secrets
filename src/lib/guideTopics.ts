/**
 * Canonical guide topic vocabulary (MES-182).
 *
 * The single frontend source of truth for `content_items.guide_topic` slugs and
 * their display labels. The DB pins the same 8 slugs via the
 * `content_items_guide_topic_check` constraint (migration
 * 20260717050000_mes182_guide_topic.sql) — change both together. Topics apply
 * to guides only; NULL/absent stays reachable via the "All Topics" row.
 *
 * Labels are display-only: filter values and URLs carry the raw slugs, so a
 * label change never breaks a link.
 */
// Relative (not "@/") because this module is unit-tested with node --test, whose
// resolver doesn't understand the Vite alias for runtime (value) imports.
import { humanizeSlug } from "./humanizeSlug.ts";

export interface GuideTopic {
  value: string;
  label: string;
}

/** Array order is the editorial order (journey stage-ish); the filter select
 *  re-ranks by count via `curateValues`, so order here only breaks count ties. */
export const GUIDE_TOPICS: readonly GuideTopic[] = [
  { value: "registration-structure", label: "Registration & Company Structure" },
  { value: "tax-finance", label: "Tax, Finance & Banking" },
  { value: "employment-visas", label: "Employment, Hiring & Visas" },
  { value: "ip-legal", label: "IP & Legal Agreements" },
  { value: "regulation-compliance", label: "Regulation, Privacy & Compliance" },
  { value: "funding-grants-equity", label: "Funding, Grants & Equity" },
  { value: "strategy-gtm", label: "Strategy & Go-to-Market" },
  { value: "sector-corridor-playbooks", label: "Sector & Corridor Playbooks" },
];

export const GUIDE_TOPIC_VALUES: readonly string[] = GUIDE_TOPICS.map((t) => t.value);

const LABEL_BY_SLUG: Readonly<Record<string, string>> = Object.fromEntries(
  GUIDE_TOPICS.map((t) => [t.value, t.label]),
);

/**
 * Display label for a guide topic slug. Falls back to `humanizeSlug` for any
 * value outside the vocabulary (a future addition arriving before this module
 * catches up) so nothing renders as a raw kebab-case value.
 */
export const guideTopicLabel = (slug: string): string =>
  LABEL_BY_SLUG[slug] ?? humanizeSlug(slug);
