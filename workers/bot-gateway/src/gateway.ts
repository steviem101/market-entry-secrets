// workers/bot-gateway/src/gateway.ts
//
// Pure decision logic for the MES bot-gateway Worker (MES-83 Phase 2).
// No I/O here — everything is unit-tested by gateway.test.ts and consumed by
// index.ts (the Cloudflare Worker entry).

import { PRIVATE_ROUTE_HEADER_PATHS } from "../../../src/config/privateRoutes.ts";

// Crawlers that should receive prerendered HTML. Case-insensitive substring
// match — the same convention Prerender's own middlewares use. Includes
// Google-InspectionTool so GSC URL Inspection shows the rendered page (the
// MES-83 verification path).
export const BOT_UA_SUBSTRINGS = [
  "googlebot",
  "google-inspectiontool",
  "bingbot",
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "claudebot",
  "anthropic-ai",
  "perplexitybot",
  "ccbot",
  "google-extended",
  "duckduckbot",
  "applebot",
  "baiduspider",
  "yandexbot",
  "twitterbot",
  "facebookexternalhit",
  "linkedinbot",
  "slackbot",
  "whatsapp",
  "telegrambot",
  "discordbot",
] as const;

/**
 * Should this request be served prerendered HTML? False for Prerender's own
 * renderer (its UA contains "prerender") — treating it as a bot would loop the
 * render request back through the gateway forever.
 */
export const isBotRequest = (userAgent: string | null): boolean => {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  if (ua.includes("prerender")) return false;
  return BOT_UA_SUBSTRINGS.some((bot) => ua.includes(bot));
};

/**
 * Static assets are never prerendered — they're already crawler-readable.
 * Anything with a file extension in its last path segment (.js, .png, .xml,
 * .txt, …) counts; SPA routes have extensionless paths.
 */
export const isStaticAsset = (pathname: string): boolean => {
  const lastSegment = pathname.split("/").pop() ?? "";
  return lastSegment.includes(".");
};

/**
 * Trailing slashes are canonical-equivalent (the app 301s them client-side),
 * so classification must treat "/my-reports/" as "/my-reports" — otherwise a
 * trailing slash would bypass the private-path gate (QA finding W2).
 */
export const normalizePathname = (pathname: string): string => {
  const stripped = pathname.replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
};

/**
 * Private paths per src/config/privateRoutes.ts (the MES-81 source of truth,
 * imported — not copied — so the Worker can't drift from the app/_headers).
 * These are never prerendered and get X-Robots-Tag: noindex stamped on the
 * response, which Lovable's origin cannot do (verified 2026-07-06).
 * Normalizes internally so no caller can forget the trailing-slash case.
 */
export const isPrivatePath = (rawPathname: string): boolean => {
  const pathname = normalizePathname(rawPathname);
  return PRIVATE_ROUTE_HEADER_PATHS.some((pattern) =>
    pattern.endsWith("/*")
      ? pathname.startsWith(pattern.slice(0, -1)) // "/report/*" → "/report/" prefix
      : pathname === pattern,
  );
};

/**
 * Single-hop www→apex 301 target (closes the MES-80 runbook item at the
 * Worker layer), preserving path + query. Null when no redirect is needed.
 */
export const wwwRedirectTarget = (url: URL): string | null => {
  if (url.hostname !== "www.marketentrysecrets.com") return null;
  return `https://marketentrysecrets.com${url.pathname}${url.search}`;
};

/** Prerender only makes sense for idempotent page fetches. */
export const isRenderableMethod = (method: string): boolean =>
  method === "GET" || method === "HEAD";

/**
 * The Prerender fetch URL for a page. Takes ONLY the pathname — never the
 * query string — so each page has exactly one cacheable render. Passing the
 * query through would let a spoofed bot UA burn the render quota with
 * ?x=1..N cache misses (QA finding W1), and canonical pages are query-free
 * anyway (the MES-80 canonical policy).
 */
export const prerenderTarget = (originHost: string, rawPathname: string): string =>
  `https://service.prerender.io/https://${originHost}${normalizePathname(rawPathname)}`;

/**
 * The full go/no-go decision for prerendering one request.
 * `renderingEnabled` is the env kill switch (see wrangler.toml / README).
 */
export const shouldPrerender = (opts: {
  method: string;
  userAgent: string | null;
  pathname: string;
  renderingEnabled: boolean;
}): boolean =>
  opts.renderingEnabled &&
  isRenderableMethod(opts.method) &&
  isBotRequest(opts.userAgent) &&
  !isStaticAsset(opts.pathname) &&
  !isPrivatePath(opts.pathname);
