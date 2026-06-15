/**
 * Semantic directory-matching helpers for generate-report, backed by the unified
 * `mes_knowledge_base` RAG layer (match_knowledge RPC).
 *
 * Pure module — NO Deno globals, NO I/O — so it can be imported by the Deno edge
 * function AND unit-tested under Node (`node --test`), exactly like goalServiceTags.ts.
 * The actual embedding + RPC + row hydration (I/O) live in index.ts.
 *
 * Why: the legacy path matches each source table with brittle Postgres array-overlap
 * (`.cs.{}`) on sector_tags/services + location ilike. This recall-upgrades it to
 * semantic retrieval over the KB while preserving the exact downstream render/enrich
 * contract (full source rows + the same link/subtitle/tags decoration).
 */

import { expandGoalsToServiceTags } from "./goalServiceTags.ts";

export interface SemanticTypeConfig {
  /** source table to hydrate full rows from */
  table: string;
  /** column list to select (mirrors the legacy overlap query for render parity) */
  select: string;
  /** max rows surfaced for this entity type */
  cap: number;
  /** attach the link/subtitle/tags display fields the report renderer expects */
  decorate: (r: any) => any;
}

/**
 * Entity types that are BOTH covered by the KB AND consumed by report sections.
 * `leads` + `lemlist_contacts` are intentionally absent (not in the KB) and stay
 * on the array-overlap path in index.ts.
 */
export const SEMANTIC_CFG: Record<string, SemanticTypeConfig> = {
  service_providers: {
    table: "service_providers",
    select: "id, name, slug, location, services, description, website, website_url, is_verified, tagline, logo_url, category_slug, sector_tags, sector_agnostic",
    cap: 10,
    decorate: (p: any) => ({
      ...p,
      link: p.slug ? `/service-providers/${p.slug}` : "/service-providers",
      linkLabel: "View Profile",
      subtitle: p.location,
      tags: (p.services || []).slice(0, 3),
    }),
  },
  community_members: {
    table: "community_members",
    select: "id, name, title, location, specialties, company, website, description, origin_country, sector_tags, sector_agnostic",
    cap: 5,
    decorate: (m: any) => ({
      ...m,
      link: "/community",
      linkLabel: "View Profile",
      subtitle: [m.title, m.company].filter(Boolean).join(", "),
      tags: (m.specialties || []).slice(0, 3),
    }),
  },
  events: {
    table: "events",
    select: "id, title, slug, date, location, category, type, organizer, sector, sector_tags, sector_agnostic",
    cap: 5,
    decorate: (e: any) => ({
      ...e,
      name: e.title,
      link: e.slug ? `/events/${e.slug}` : "/events",
      linkLabel: "View Event",
      subtitle: `${e.date} · ${e.location}`,
      tags: [e.category, e.type].filter(Boolean),
    }),
  },
  content_items: {
    table: "content_items",
    select: "id, title, slug, content_type, sector_tags, meta_description, sector_agnostic",
    cap: 5,
    decorate: (c: any) => ({
      ...c,
      name: c.title,
      link: `/content/${c.slug}`,
      linkLabel: "Read More",
      subtitle: c.content_type,
      tags: (c.sector_tags || []).slice(0, 2),
    }),
  },
  innovation_ecosystem: {
    table: "innovation_ecosystem",
    select: "id, slug, name, location, services, description, website, sector_tags, sector_agnostic",
    cap: 5,
    decorate: (o: any) => ({
      ...o,
      link: o.slug ? `/innovation-ecosystem/${o.slug}` : "/innovation-ecosystem",
      linkLabel: "View Hub",
      subtitle: o.location,
      tags: (o.services || []).slice(0, 3),
    }),
  },
  trade_investment_agencies: {
    table: "trade_investment_agencies",
    select: "id, name, slug, location, services, description, website, tagline, target_company_origin, sector_tags, sector_agnostic",
    cap: 5,
    decorate: (a: any) => ({
      ...a,
      link: a.slug ? `/government-support/${a.slug}` : "/government-support",
      linkLabel: "View Organisation",
      subtitle: a.location,
      tags: (a.services || []).slice(0, 3),
    }),
  },
  investors: {
    table: "investors",
    select: "id, slug, name, investor_type, location, country, sector_focus, stage_focus, check_size_min, check_size_max, website, description, sector_tags, sector_agnostic",
    cap: 8,
    decorate: (i: any) => ({
      ...i,
      link: i.slug ? `/investors/${i.slug}` : "/investors",
      linkLabel: "View Investor",
      subtitle: `${i.investor_type} · ${i.location}`,
      tags: (i.stage_focus || []).slice(0, 3),
    }),
  },
};

/** Build a compact natural-language query from the intake's structured fields. */
export function buildMatchQueryText(intake: any): string {
  let serviceTags: string[] = [];
  try {
    serviceTags = expandGoalsToServiceTags({ goal_ids: intake.goal_ids, services_needed: intake.services_needed }) || [];
  } catch {
    serviceTags = [];
  }
  const parts = [
    (intake.industry_sector || []).join(", "),
    serviceTags.length ? `services needed: ${serviceTags.join(", ")}` : (intake.services_needed || []).join(", "),
    (intake.target_regions || []).length ? `entering market: ${(intake.target_regions || []).join(", ")}` : "",
    intake.country_of_origin ? `company from ${intake.country_of_origin}` : "",
    (intake.end_buyer_industries || []).length ? `selling to: ${(intake.end_buyer_industries || []).join(", ")}` : "",
  ];
  return parts.filter(Boolean).join(". ").slice(0, 1000);
}

/**
 * Group match_knowledge rows by source_table, dedupe by source_id keeping the best
 * (first-seen, already score-ordered) hit — content_items is chunked, so one source
 * row yields many KB rows — and drop tables the report doesn't consume.
 */
export function groupRankedBySource(
  rows: Array<{ source_table: string; source_id: string; score?: number; similarity?: number }>,
  allowed: Record<string, unknown> = SEMANTIC_CFG,
): Record<string, Array<{ id: string; score: number }>> {
  const ranked: Record<string, Array<{ id: string; score: number }>> = {};
  const seen: Record<string, Set<string>> = {};
  for (const row of rows || []) {
    const tbl = row.source_table;
    if (!(tbl in allowed)) continue;
    (seen[tbl] ??= new Set<string>());
    if (seen[tbl].has(row.source_id)) continue;
    seen[tbl].add(row.source_id);
    (ranked[tbl] ??= []).push({ id: row.source_id, score: row.score ?? row.similarity ?? 0 });
  }
  return ranked;
}
