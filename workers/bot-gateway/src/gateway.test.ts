/**
 * Unit tests for the bot-gateway decision logic (MES-83 Phase 2).
 * Run: `npm test` (node --test, Node 22+ strips types natively).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isBotRequest,
  isStaticAsset,
  isPrivatePath,
  wwwRedirectTarget,
  shouldPrerender,
} from "./gateway.ts";

test("isBotRequest: search, AI, and social crawlers are bots", () => {
  const bots = [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; Google-InspectionTool/1.0)", // GSC URL Inspection
    "Mozilla/5.0 (compatible; bingbot/2.0)",
    "GPTBot/1.0 (+https://openai.com/gptbot)",
    "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "Mozilla/5.0 (compatible; PerplexityBot/1.0)",
    "CCBot/2.0 (https://commoncrawl.org/faq/)",
    "Twitterbot/1.0",
    "facebookexternalhit/1.1",
  ];
  for (const ua of bots) assert.equal(isBotRequest(ua), true, ua);
});

test("isBotRequest: real browsers and missing UA are not bots", () => {
  assert.equal(
    isBotRequest(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
    ),
    false,
  );
  assert.equal(isBotRequest(null), false);
  assert.equal(isBotRequest(""), false);
});

test("isBotRequest: Prerender's own renderer is NEVER a bot (loop guard)", () => {
  assert.equal(
    isBotRequest("Mozilla/5.0 HeadlessChrome Prerender (+https://github.com/prerender/prerender)"),
    false,
  );
});

test("isStaticAsset: files yes, SPA routes no", () => {
  assert.equal(isStaticAsset("/og-image.png"), true);
  assert.equal(isStaticAsset("/robots.txt"), true);
  assert.equal(isStaticAsset("/assets/index-xDCyPgyY.js"), true);
  assert.equal(isStaticAsset("/service-providers"), false);
  assert.equal(isStaticAsset("/case-studies/github-australia-market-entry"), false);
  assert.equal(isStaticAsset("/"), false);
});

test("isPrivatePath: mirrors privateRoutes.ts globs exactly", () => {
  // wildcard patterns match children but not lookalike prefixes
  assert.equal(isPrivatePath("/report/shared/some-token"), true);
  assert.equal(isPrivatePath("/report/abc-123"), true);
  assert.equal(isPrivatePath("/report-creator"), false); // NOT /report/*
  assert.equal(isPrivatePath("/admin/submissions"), true);
  assert.equal(isPrivatePath("/auth/callback"), true);
  // exact patterns
  assert.equal(isPrivatePath("/my-reports"), true);
  assert.equal(isPrivatePath("/dashboard"), true);
  assert.equal(isPrivatePath("/bookmarks"), true);
  // public routes stay public
  assert.equal(isPrivatePath("/service-providers"), false);
  assert.equal(isPrivatePath("/"), false);
});

test("wwwRedirectTarget: single-hop 301 preserving path+query", () => {
  assert.equal(
    wwwRedirectTarget(new URL("https://www.marketentrysecrets.com/pricing?ref=x")),
    "https://marketentrysecrets.com/pricing?ref=x",
  );
  assert.equal(wwwRedirectTarget(new URL("https://marketentrysecrets.com/pricing")), null);
});

test("shouldPrerender: full gate", () => {
  const base = {
    method: "GET",
    userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1)",
    pathname: "/service-providers",
    renderingEnabled: true,
  };
  assert.equal(shouldPrerender(base), true);
  assert.equal(shouldPrerender({ ...base, renderingEnabled: false }), false); // kill switch
  assert.equal(shouldPrerender({ ...base, method: "POST" }), false);
  assert.equal(shouldPrerender({ ...base, userAgent: "Chrome/126.0" }), false);
  assert.equal(shouldPrerender({ ...base, pathname: "/og-image.png" }), false);
  assert.equal(shouldPrerender({ ...base, pathname: "/my-reports" }), false); // private
  assert.equal(shouldPrerender({ ...base, pathname: "/report/shared/tok" }), false);
});
