// supabase/functions/sitemap/index.ts
//
// DB-driven sitemap for marketentrysecrets.com (MES-79 / SEO-03).
//
// Replaces the hand-maintained public/sitemap.xml, which drifted badly against
// the DB (audit MES-76: events 51% missing, 13 dead mentor URLs, case studies
// double-listed under /content/ AND /case-studies/, redirect aliases included,
// zero lastmod). This function regenerates from the database on every request,
// so it can never drift again.
//
// Shape: a sitemap index (no query param) that points at per-section child
// sitemaps (?s=<section>). Child <loc>s are built from the request's own
// origin+path, so the index stays self-consistent whether it's fetched directly
// at the function URL or proxied behind marketentrysecrets.com/sitemap.xml.
//
// SAFETY (MES-76 guardrail): the client is created with the ANON key only, so
// Postgres RLS decides what is visible — crawlers get exactly what a logged-out
// user gets, and nothing gated or PII-bearing can ever reach a URL list. PII
// tables are read through their anon-safe public views (community_members_public,
// investors_public). verify_jwt = false (config.toml): a sitemap is public.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// The site whose *pages* the sitemap points at (never the Supabase host).
const SITE_ORIGIN = "https://marketentrysecrets.com";

// A single sitemap file may hold at most 50,000 URLs; every section is far
// below this, but set an explicit cap so a growing section can never be
// silently truncated by PostgREST's default 1,000-row limit (drift = bug).
const MAX_ROWS = 50000;

type Row = { slug: string | null; updated_at?: string | null; created_at?: string | null };

interface Section {
  key: string;
  priority: string;
  changefreq: string;
  path: (slug: string) => string;
  fetch: (db: ReturnType<typeof createClient>) => Promise<UrlEntry[]>;
}

interface UrlEntry {
  loc: string; // absolute page URL
  lastmod?: string; // YYYY-MM-DD
}

const isoDate = (v: string | null | undefined): string | undefined =>
  v ? new Date(v).toISOString().slice(0, 10) : undefined;

const xmlEscape = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// Build UrlEntry[] from a simple {slug, updated_at} table read.
async function rowsToEntries(
  rows: Row[] | null,
  path: (slug: string) => string,
): Promise<UrlEntry[]> {
  return (rows ?? [])
    .filter((r) => r.slug && r.slug.trim() !== "")
    .map((r) => ({
      loc: `${SITE_ORIGIN}${path(r.slug as string)}`,
      lastmod: isoDate(r.updated_at ?? r.created_at),
    }));
}

// --- Section definitions -----------------------------------------------------
// Filters mirror the site's RLS + published semantics so the sitemap lists only
// pages that actually render for an anonymous visitor.

const SECTIONS: Section[] = [
  {
    key: "providers",
    priority: "0.8",
    changefreq: "weekly",
    path: (s) => `/service-providers/${s}`,
    fetch: async (db) => {
      const { data, error } = await db
        .from("service_providers")
        .select("slug, updated_at")
        .not("slug", "is", null)
        .limit(MAX_ROWS);
      if (error) throw error;
      return rowsToEntries(data as Row[], (s) => `/service-providers/${s}`);
    },
  },
  {
    key: "mentors",
    priority: "0.7",
    changefreq: "weekly",
    // community_members has no category_slug column, so every mentor resolves
    // under the default "experts" category (matches MentorProfile canonical).
    path: (s) => `/mentors/experts/${s}`,
    fetch: async (db) => {
      const { data, error } = await db
        .from("community_members_public") // anon-safe view (no PII)
        .select("slug, updated_at")
        .eq("is_active", true)
        .not("slug", "is", null)
        .limit(MAX_ROWS);
      if (error) throw error;
      return rowsToEntries(data as Row[], (s) => `/mentors/experts/${s}`);
    },
  },
  {
    key: "events",
    priority: "0.7",
    changefreq: "weekly",
    path: (s) => `/events/${s}`,
    fetch: async (db) => {
      const { data, error } = await db
        .from("events")
        .select("slug, updated_at")
        .eq("status", "approved") // mirrors events_public_read RLS
        .not("slug", "is", null)
        .limit(MAX_ROWS);
      if (error) throw error;
      return rowsToEntries(data as Row[], (s) => `/events/${s}`);
    },
  },
  {
    key: "content",
    priority: "0.7",
    changefreq: "monthly",
    path: (s) => `/content/${s}`,
    fetch: async (db) => {
      // Non-case-study published content only. Case studies are served ONLY
      // under /case-studies/ (audit: they were double-listed here).
      const { data, error } = await db
        .from("content_items")
        .select("slug, updated_at")
        .eq("status", "published")
        .neq("content_type", "case_study")
        .not("slug", "is", null)
        .limit(MAX_ROWS);
      if (error) throw error;
      return rowsToEntries(data as Row[], (s) => `/content/${s}`);
    },
  },
  {
    key: "case-studies",
    priority: "0.8",
    changefreq: "monthly",
    path: (s) => `/case-studies/${s}`,
    fetch: async (db) => {
      const { data, error } = await db
        .from("content_items")
        .select("slug, updated_at")
        .eq("status", "published")
        .eq("content_type", "case_study")
        .not("slug", "is", null)
        .limit(MAX_ROWS);
      if (error) throw error;
      return rowsToEntries(data as Row[], (s) => `/case-studies/${s}`);
    },
  },
  {
    key: "investors",
    priority: "0.6",
    changefreq: "monthly",
    path: (s) => `/investors/${s}`,
    fetch: async (db) => {
      const { data, error } = await db
        .from("investors_public") // anon-safe view (no PII)
        .select("slug, updated_at")
        .not("slug", "is", null)
        .limit(MAX_ROWS);
      if (error) throw error;
      return rowsToEntries(data as Row[], (s) => `/investors/${s}`);
    },
  },
  {
    key: "agencies",
    priority: "0.7",
    changefreq: "monthly",
    path: (s) => `/government-support/${s}`,
    fetch: async (db) => {
      const { data, error } = await db
        .from("trade_investment_agencies")
        .select("slug, updated_at")
        .eq("is_active", true)
        .not("slug", "is", null)
        .limit(MAX_ROWS);
      if (error) throw error;
      return rowsToEntries(data as Row[], (s) => `/government-support/${s}`);
    },
  },
  {
    key: "innovation",
    priority: "0.6",
    changefreq: "monthly",
    path: (s) => `/innovation-ecosystem/${s}`,
    fetch: async (db) => {
      const { data, error } = await db
        .from("innovation_ecosystem")
        .select("slug, updated_at")
        .not("slug", "is", null)
        .limit(MAX_ROWS);
      if (error) throw error;
      return rowsToEntries(data as Row[], (s) => `/innovation-ecosystem/${s}`);
    },
  },
  {
    key: "leads",
    priority: "0.6",
    changefreq: "weekly",
    path: (s) => `/leads/${s}`,
    fetch: async (db) => {
      const { data, error } = await db
        .from("lead_databases")
        .select("slug, updated_at")
        .eq("status", "active")
        .not("slug", "is", null)
        .limit(MAX_ROWS);
      if (error) throw error;
      return rowsToEntries(data as Row[], (s) => `/leads/${s}`);
    },
  },
  {
    key: "taxonomy",
    priority: "0.7",
    changefreq: "weekly",
    path: (s) => s, // mixed prefixes; handled inside fetch
    fetch: async (db) => {
      const [locations, countries, sectors] = await Promise.all([
        db.from("locations").select("slug, updated_at").eq("active", true)
          .not("slug", "is", null).limit(MAX_ROWS),
        db.from("countries").select("slug, updated_at")
          .not("slug", "is", null).limit(MAX_ROWS),
        db.from("industry_sectors").select("slug, updated_at")
          .not("slug", "is", null).limit(MAX_ROWS),
      ]);
      for (const r of [locations, countries, sectors]) {
        if (r.error) throw r.error;
      }
      return [
        ...await rowsToEntries(locations.data as Row[], (s) => `/locations/${s}`),
        ...await rowsToEntries(countries.data as Row[], (s) => `/countries/${s}`),
        ...await rowsToEntries(sectors.data as Row[], (s) => `/sectors/${s}`),
      ];
    },
  },
];

// Static hub + informational pages. Excludes redirect aliases (/community,
// /trade-investment-agencies) and private/auth routes (handled by SEO-05 noindex).
const STATIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/service-providers", priority: "0.9", changefreq: "weekly" },
  { path: "/mentors", priority: "0.8", changefreq: "weekly" },
  { path: "/events", priority: "0.8", changefreq: "weekly" },
  { path: "/leads", priority: "0.8", changefreq: "weekly" },
  { path: "/investors", priority: "0.8", changefreq: "weekly" },
  { path: "/government-support", priority: "0.8", changefreq: "weekly" },
  { path: "/innovation-ecosystem", priority: "0.8", changefreq: "weekly" },
  { path: "/content", priority: "0.8", changefreq: "weekly" },
  { path: "/case-studies", priority: "0.8", changefreq: "weekly" },
  { path: "/locations", priority: "0.7", changefreq: "weekly" },
  { path: "/countries", priority: "0.7", changefreq: "weekly" },
  { path: "/sectors", priority: "0.7", changefreq: "weekly" },
  { path: "/pricing", priority: "0.7", changefreq: "monthly" },
  { path: "/report-creator", priority: "0.7", changefreq: "monthly" },
  { path: "/market-entry-questions", priority: "0.6", changefreq: "monthly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/faq", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/partner", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
];

function renderUrlset(
  entries: { loc: string; lastmod?: string; priority: string; changefreq: string }[],
): string {
  const urls = entries
    .map((e) => {
      const parts = [`<loc>${xmlEscape(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`<lastmod>${e.lastmod}</lastmod>`);
      parts.push(`<changefreq>${e.changefreq}</changefreq>`);
      parts.push(`<priority>${e.priority}</priority>`);
      return `  <url>${parts.join("")}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function renderIndex(
  children: { loc: string; lastmod?: string }[],
): string {
  const sitemaps = children
    .map((c) => {
      const parts = [`<loc>${xmlEscape(c.loc)}</loc>`];
      if (c.lastmod) parts.push(`<lastmod>${c.lastmod}</lastmod>`);
      return `  <sitemap>${parts.join("")}</sitemap>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>\n`;
}

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  // Cache at the CDN for an hour; crawlers don't need second-by-second freshness.
  "Cache-Control": "public, max-age=3600, s-maxage=3600",
  "Access-Control-Allow-Origin": "*",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS" },
    });
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(req.url);
  const section = url.searchParams.get("s");
  // Self URL for the child-sitemap <loc>s in the index — the exact origin+path
  // this request came in on, so proxying at another host stays consistent.
  const selfUrl = `${url.origin}${url.pathname}`;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return new Response("sitemap misconfigured", { status: 500 });
  }
  // ANON key only → RLS decides visibility (never service role here).
  const db = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });

  try {
    // Static child sitemap.
    if (section === "static") {
      const entries = STATIC_PAGES.map((p) => ({
        loc: `${SITE_ORIGIN}${p.path}`,
        priority: p.priority,
        changefreq: p.changefreq,
      }));
      return new Response(req.method === "HEAD" ? null : renderUrlset(entries), { headers: XML_HEADERS });
    }

    // A specific dynamic section.
    if (section) {
      const def = SECTIONS.find((s) => s.key === section);
      if (!def) return new Response("Unknown sitemap section", { status: 404 });
      const entries = (await def.fetch(db)).map((e) => ({
        ...e,
        priority: def.priority,
        changefreq: def.changefreq,
      }));
      return new Response(req.method === "HEAD" ? null : renderUrlset(entries), { headers: XML_HEADERS });
    }

    // No section → the sitemap index. Fetch every section so each child's
    // <lastmod> reflects the freshest row it contains.
    const results = await Promise.all(
      SECTIONS.map(async (s) => {
        const entries = await s.fetch(db);
        const lastmod = entries
          .map((e) => e.lastmod)
          .filter(Boolean)
          .sort()
          .pop();
        return { key: s.key, lastmod };
      }),
    );

    const children = [
      { loc: `${selfUrl}?s=static` },
      ...results.map((r) => ({ loc: `${selfUrl}?s=${r.key}`, lastmod: r.lastmod })),
    ];
    return new Response(req.method === "HEAD" ? null : renderIndex(children), { headers: XML_HEADERS });
  } catch (err) {
    return new Response(
      `sitemap generation failed: ${err instanceof Error ? err.message : String(err)}`,
      { status: 502 },
    );
  }
});
