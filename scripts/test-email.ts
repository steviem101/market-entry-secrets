// scripts/test-email.ts
//
// Offline regression + bug tests for the transactional email module and the
// send-email routing decision. Run with:
//   node --experimental-strip-types scripts/test-email.ts
//
// Covers: route selection (code vs legacy Resend template vs reject) for every
// email_type, welcome render correctness, HTML escaping / header-injection
// safety, brand invariants (azure present, no teal, no long dashes), and basic
// HTML tag-balance. Exits non-zero on any failure.

import { renderEmail } from "../supabase/functions/_shared/email/render.ts";
import { resolveTemplateId } from "../supabase/functions/_shared/email/resend-templates.ts";

let failures = 0;
const results: string[] = [];
function check(name: string, cond: boolean, detail = "") {
  results.push(`${cond ? "PASS" : "FAIL"}  ${name}${detail && !cond ? `  -> ${detail}` : ""}`);
  if (!cond) failures++;
}

// Mirror of send-email/index.ts routing decision.
function route(emailType: string, data: Record<string, unknown>): "code" | "legacy" | "reject" {
  const rendered = renderEmail(emailType, data);
  const templateId = rendered ? null : resolveTemplateId(emailType, data || {});
  if (!rendered && !templateId) return "reject";
  return rendered ? "code" : "legacy";
}

// ── 1. Routing regression: every known type keeps working ──────────────
const routeCases: Array<[string, Record<string, unknown>, "code" | "legacy" | "reject"]> = [
  ["welcome", { first_name: "Sam" }, "code"],
  ["nurture_ecosystem", { provider_count: "240" }, "legacy"],
  ["nurture_case_studies", {}, "legacy"],
  ["nurture_ai_report", {}, "legacy"],
  ["nurture_events", {}, "legacy"],
  ["nurture_upgrade", { current_tier: "free" }, "legacy"],
  ["nurture_upgrade", { current_tier: "growth" }, "legacy"],
  ["report_completed", { company_name: "X" }, "legacy"],
  ["payment_confirmation", { tier: "Growth" }, "legacy"],
  ["totally_unknown_type", {}, "reject"],
];
for (const [type, data, expect] of routeCases) {
  const got = route(type, data);
  check(`route ${type} (${JSON.stringify(data)}) -> ${expect}`, got === expect, `got ${got}`);
}

// Legacy variant resolution still distinguishes free/paid template IDs.
check(
  "nurture_upgrade free/paid resolve to different Resend template IDs",
  resolveTemplateId("nurture_upgrade", { current_tier: "free" }) !==
    resolveTemplateId("nurture_upgrade", { current_tier: "growth" })
);

// ── 2. Welcome render correctness ──────────────────────────────────────
const named = renderEmail("welcome", { first_name: "Sarah" })!;
check("welcome returns subject+html", !!named && !!named.subject && !!named.html);
check("welcome subject personalised", named.subject === "Welcome to Market Entry Secrets, Sarah", named.subject);
check("welcome greets by name", named.html.includes("Hi Sarah,"));

const unnamed = renderEmail("welcome", {})!;
check("welcome subject falls back when no name", unnamed.subject === "Welcome to Market Entry Secrets", unnamed.subject);
check("welcome greets 'there' when no name", unnamed.html.includes("Hi there,"));

const legacyVar = renderEmail("welcome", { USER_NAME: "Lee" })!;
check("welcome accepts legacy USER_NAME var", legacyVar.subject.includes("Lee"));

// Required CTAs / links present
for (const path of ["/report-creator", "/service-providers", "/events", "/case-studies"]) {
  check(`welcome links to ${path}`, named.html.includes(`marketentrysecrets.com${path}`));
}
check("welcome has logo URL", named.html.includes("https://marketentrysecrets.com/email/logo.png"));
check("welcome has preheader", named.html.includes("Your shortcut to the Australian and ANZ market"));
check("welcome has footer brand", named.html.includes("Helping global companies enter the Australian and ANZ market."));
check("welcome has middle-dot microcopy", named.html.includes("No credit card required &middot; Ready in minutes"));

// ── 3. Brand invariants ────────────────────────────────────────────────
for (const [label, html] of [["named", named.html], ["unnamed", unnamed.html]] as const) {
  check(`[${label}] contains azure #1AA3E0`, html.includes("#1AA3E0"));
  check(`[${label}] NO teal #2B7A8C`, !/2B7A8C/i.test(html));
  check(`[${label}] NO old generic blue #2563eb`, !/2563eb/i.test(html));
  check(`[${label}] NO em/en dash`, !/[–—]/.test(html));
  check(`[${label}] dark-mode block present`, html.includes("prefers-color-scheme: dark"));
  check(`[${label}] bulletproof button VML present`, html.includes("v:roundrect"));
  check(`[${label}] 600px width`, html.includes("max-width:600px"));
}
// Subject must never contain a long dash either
check("subject has no em/en dash", !/[–—]/.test(named.subject));

// ── 4. Security: HTML escaping + header-injection safety ────────────────
const evil = renderEmail("welcome", { first_name: `<script>alert('x')</script>&"'` })!;
check("XSS: no raw <script> in body", !evil.html.includes("<script>"));
check("XSS: escaped &lt;script&gt; present", evil.html.includes("&lt;script&gt;"));
check("XSS: quotes/amp escaped in greeting", evil.html.includes("&amp;") && evil.html.includes("&#39;"));

const injSubject = renderEmail("welcome", { first_name: "Bad\r\nBcc: victim@example.com" })!;
check("header-injection: no CR/LF in subject", !/[\r\n]/.test(injSubject.subject), JSON.stringify(injSubject.subject));

const longName = renderEmail("welcome", { first_name: "Q".repeat(500) })!;
check("long name does not throw and renders", longName.html.length > 1000);

// ── 5. Basic HTML tag-balance (gross malformation guard) ───────────────
function balanced(html: string, tag: string): boolean {
  const open = (html.match(new RegExp(`<${tag}(\\s|>)`, "g")) || []).length;
  const close = (html.match(new RegExp(`</${tag}>`, "g")) || []).length;
  return open === close;
}
for (const tag of ["html", "head", "body", "table", "tr", "td", "h1", "p", "a", "ul"]) {
  check(`tag balance <${tag}>`, balanced(named.html, tag));
}
check("has DOCTYPE", named.html.startsWith("<!DOCTYPE html>"));
check("html size sane (<102KB Gmail clip)", Buffer.byteLength(named.html, "utf8") < 102000);

// ── Report ─────────────────────────────────────────────────────────────
console.log(results.join("\n"));
console.log(`\n${failures === 0 ? "ALL PASS" : failures + " FAILURE(S)"}  (${results.length} checks)`);
process.exit(failures === 0 ? 0 : 1);
