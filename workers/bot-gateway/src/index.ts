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

import {
  isPrivatePath,
  prerenderTarget,
  shouldPrerender,
  wwwRedirectTarget,
} from "./gateway.ts";

interface Env {
  /** Prerender.io token — set via `wrangler secret put PRERENDER_TOKEN`. */
  PRERENDER_TOKEN?: string;
  /** Kill switch for the rendering branch only ("true"/"false"). */
  RENDERING_ENABLED?: string;
  /** The DB-driven sitemap (MES-79). */
  SITEMAP_FUNCTION_URL?: string;
  /**
   * Upstream host the Worker proxies page traffic to — the Lovable project
   * host, NOT the public domain. Lovable's custom-domain edge runs on
   * Cloudflare for SaaS, and an active custom-hostname claim there takes
   * priority over this zone's Workers; the public domain must be released
   * from Lovable's settings and served by this Worker with Lovable as a
   * plain upstream (see README).
   */
  ORIGIN_HOST?: string;
  /**
   * Public hostname crawlers should see. Prerender renders pages on THIS
   * host (its renderer comes back through the Worker with its own UA, which
   * the loop guard sends to the upstream), so snapshots carry the real
   * canonical URLs instead of the lovable.app upstream.
   */
  PUBLIC_HOST?: string;
}

const DEFAULT_ORIGIN_HOST = "market-entry-secrets.lovable.app";
const DEFAULT_PUBLIC_HOST = "marketentrysecrets.com";
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
    const publicHost = env.PUBLIC_HOST || DEFAULT_PUBLIC_HOST;

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
        // Pathname only — the query string never reaches the renderer (one
        // cacheable render per page; quota can't be burned via ?x=1..N spam).
        // Rendered on the PUBLIC host: the renderer's own request re-enters
        // this Worker, where the loop guard routes it to the upstream, so
        // snapshots carry real canonical URLs, not lovable.app ones.
        const rendered = await fetch(prerenderTarget(publicHost, url.pathname), {
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

    // 4. Upstream passthrough — the Worker is the front door for the public
    //    domain, so every non-rendered request is rewritten to the Lovable
    //    project host. redirect:"manual" passes any upstream redirect to the
    //    client untouched instead of chasing it back into this zone (a 302 to
    //    the public domain would otherwise recurse through the Worker).
    const originResp = await fetch(
      `https://${originHost}${url.pathname}${url.search}`,
      {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "manual",
      },
    );

    // 5. Private paths get the header Lovable can't serve (MES-81 gap).
    return isPrivatePath(url.pathname)
      ? withHeader(originResp, "X-Robots-Tag", "noindex, nofollow")
      : originResp;
  },
};
