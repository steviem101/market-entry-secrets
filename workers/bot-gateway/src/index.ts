// workers/bot-gateway/src/index.ts
//
// MES bot-gateway — Cloudflare Worker (MES-83 Phase 2, Prerender trial).
//
// Runs on the marketentrysecrets.com/* route. For every request:
//   1. www.* → single-hop 301 to the apex (closes the MES-80 runbook item).
//   2. /sitemap.xml → proxied to the DB-driven sitemap edge function
//      (finishes MES-79's best-effort _redirects rule; kills the stale cache).
//   3. Known crawler UAs on public pages → cached rendered HTML from
//      Prerender.io. Fail-open: any renderer error/timeout falls through to
//      the SPA exactly as served today. Users are NEVER intercepted.
//   4. Private paths → X-Robots-Tag: noindex stamped on the response
//      (closes the MES-81 gap — Lovable's origin ignores public/_headers).
//
// SAFETY (MES-76/83 invariant): the renderer browses anonymously — this
// Worker forwards no cookies, tokens, or auth to Prerender, so RLS decides
// exactly what crawlers see. Kill switch: see README (route removal is
// instant; RENDERING_ENABLED=false keeps the HTTP fixes but stops rendering).

import { isPrivatePath, shouldPrerender, wwwRedirectTarget } from "./gateway.ts";

interface Env {
  /** Prerender.io token — set via `wrangler secret put PRERENDER_TOKEN`. */
  PRERENDER_TOKEN?: string;
  /** Kill switch for the rendering branch only ("true"/"false"). */
  RENDERING_ENABLED?: string;
  /** The DB-driven sitemap (MES-79). */
  SITEMAP_FUNCTION_URL?: string;
  /**
   * Canonical origin host. On the production route this equals the request
   * host; on a workers.dev staging URL it makes passthrough + rendering test
   * against the real site instead of recursing into the Worker.
   */
  ORIGIN_HOST?: string;
}

const DEFAULT_ORIGIN_HOST = "marketentrysecrets.com";
const DEFAULT_SITEMAP_URL =
  "https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/sitemap";
const PRERENDER_TIMEOUT_MS = 10_000;

const withHeader = (resp: Response, name: string, value: string): Response => {
  const headers = new Headers(resp.headers);
  headers.set(name, value);
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const originHost = env.ORIGIN_HOST || DEFAULT_ORIGIN_HOST;

    // 1. Single-hop www → apex 301, preserving path + query.
    const redirect = wwwRedirectTarget(url);
    if (redirect) return Response.redirect(redirect, 301);

    // 2. Apex sitemap → the DB-driven edge function (bypasses the origin's
    //    stale static-file cache entirely).
    if (url.pathname === "/sitemap.xml") {
      const upstream = new URL(env.SITEMAP_FUNCTION_URL || DEFAULT_SITEMAP_URL);
      upstream.search = url.search; // pass ?s=<section> through for children
      return fetch(upstream.toString(), { method: request.method });
    }

    // 3. Crawlers on public pages → prerendered HTML (fail-open).
    const wantsRender = shouldPrerender({
      method: request.method,
      userAgent: request.headers.get("user-agent"),
      pathname: url.pathname,
      renderingEnabled: (env.RENDERING_ENABLED ?? "true") === "true",
    });
    if (wantsRender && env.PRERENDER_TOKEN) {
      try {
        const target = `https://service.prerender.io/https://${originHost}${url.pathname}${url.search}`;
        const rendered = await fetch(target, {
          headers: {
            "X-Prerender-Token": env.PRERENDER_TOKEN,
            "User-Agent": request.headers.get("user-agent") ?? "",
          },
          signal: AbortSignal.timeout(PRERENDER_TIMEOUT_MS),
        });
        // Pass real statuses through (200s, and 404s once the app emits
        // prerender-status-code meta). Renderer-side 5xx falls open to the SPA.
        if (rendered.status < 500) {
          return withHeader(rendered, "x-mes-rendered", "1");
        }
      } catch {
        // timeout / network error → fail open to the SPA below
      }
    }

    // 4. Origin passthrough. On the production zone route the request host IS
    //    the origin host, so fetch(request) reaches Lovable; on workers.dev
    //    staging we rewrite to the real origin to avoid recursion.
    const originResp =
      url.hostname === originHost
        ? await fetch(request)
        : await fetch(`https://${originHost}${url.pathname}${url.search}`, {
            method: request.method,
            headers: request.headers,
          });

    // 5. Private paths get the header Lovable can't serve (MES-81 gap).
    return isPrivatePath(url.pathname)
      ? withHeader(originResp, "X-Robots-Tag", "noindex, nofollow")
      : originResp;
  },
};
