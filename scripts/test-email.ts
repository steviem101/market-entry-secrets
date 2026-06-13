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
import { theme } from "../supabase/functions/_shared/email/theme.ts";

let failures = 0;
const results: string[] = [];
function check(name: string, cond: boolean, detail = "") {
  results.push(`${cond ? "PASS" : "FAIL"}  ${name}${detail && !cond ? `  -> ${detail}` : ""}`);
  if (!cond) failures++;
}

// Mirror of send-email/index.ts routing decision (code template, else reject).
function route(emailType: string, data: Record<string, unknown>): "code" | "reject" {
  return renderEmail(emailType, data) ? "code" : "reject";
}

// ── 1. Routing regression: every known type renders, unknown is rejected ──
const routeCases: Array<[string, Record<string, unknown>, "code" | "reject"]> = [
  ["welcome", { first_name: "Sam" }, "code"],
  ["nurture_ecosystem", { provider_count: "240" }, "code"],
  ["nurture_case_studies", {}, "code"],
  ["nurture_ai_report", {}, "code"],
  ["nurture_events", {}, "code"],
  ["nurture_upgrade", { current_tier: "free" }, "code"],
  ["nurture_upgrade", { current_tier: "growth" }, "code"],
  ["report_completed", { company_name: "X" }, "code"],
  ["payment_confirmation", { tier: "Growth" }, "code"],
  ["totally_unknown_type", {}, "reject"],
];
for (const [type, data, expect] of routeCases) {
  const got = route(type, data);
  check(`route ${type} (${JSON.stringify(data)}) -> ${expect}`, got === expect, `got ${got}`);
}

// nurture_upgrade resolves free vs paid to distinct rendered subjects/CTAs.
check(
  "nurture_upgrade free vs paid render differently",
  renderEmail("nurture_upgrade", { current_tier: "free" })!.subject !==
    renderEmail("nurture_upgrade", { current_tier: "growth" })!.subject
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
check("welcome has logo URL (theme.logoUrl)", named.html.includes(theme.logoUrl));
check("logo URL is an absolute https URL", /^https:\/\//.test(theme.logoUrl));
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

// ── 6. All migrated templates: brand + structure + unsubscribe policy ──
// [email_type, sample data, isNurture (expects an unsubscribe link)]
const MIGRATED: Array<[string, Record<string, unknown>, boolean]> = [
  ["welcome", { first_name: "Sam" }, false],
  ["payment_confirmation", { tier: "growth", amount: "490.00", currency: "AUD" }, false],
  ["report_completed", { first_name: "Sam", company_name: "Nimbus Robotics", report_url: "https://marketentrysecrets.com/report/abc" }, false],
  ["nurture_ecosystem", { first_name: "Sam", provider_count: "240" }, true],
  ["nurture_case_studies", { first_name: "Sam", featured_case_study_company: "Atlassian" }, true],
  ["nurture_ai_report", { first_name: "Sam", report_count: "1,200" }, true],
  ["nurture_events", { first_name: "Sam", upcoming_event_title: "SouthStart 2026", upcoming_event_date: "Wednesday, 9 September 2026" }, true],
  ["nurture_upgrade", { first_name: "Sam", current_tier: "free" }, true],
  ["nurture_upgrade", { first_name: "Sam", current_tier: "growth" }, true],
];
for (const [type, data, isNurture] of MIGRATED) {
  const r = renderEmail(type, data);
  if (!r) { check(`${type} renders`, false, "renderEmail returned null"); continue; }
  const label = `${type}(${(data as any).current_tier ?? ""})`;
  check(`${label}: subject non-empty`, r.subject.length > 0);
  check(`${label}: no em/en dash`, !/[–—]/.test(r.subject) && !/[–—]/.test(r.html));
  check(`${label}: no teal/old-blue`, !/2B7A8C/i.test(r.html) && !/2563eb/i.test(r.html));
  check(`${label}: azure present`, r.html.includes("#1AA3E0"));
  check(`${label}: DOCTYPE + 600px`, r.html.startsWith("<!DOCTYPE html>") && r.html.includes("max-width:600px"));
  check(`${label}: under Gmail clip`, Buffer.byteLength(r.html, "utf8") < 102000);
  check(`${label}: unsubscribe policy (${isNurture ? "present" : "absent"})`, r.html.includes(">Unsubscribe</a>") === isNurture);
  check(`${label}: greeting present`, /Hi (Sam|there),/.test(r.html));
}
// Variable interpolation spot-checks
check("payment: tier capitalised in subject", renderEmail("payment_confirmation", { tier: "growth" })!.subject.includes("Growth"));
check("payment: amount + currency shown", renderEmail("payment_confirmation", { tier: "growth", amount: "490.00", currency: "AUD" })!.html.includes("490.00 AUD"));
check("report: company in subject", renderEmail("report_completed", { company_name: "Nimbus Robotics" })!.subject.includes("Nimbus Robotics"));
check("report: links specific report_url", renderEmail("report_completed", { report_url: "https://marketentrysecrets.com/report/abc" })!.html.includes("/report/abc"));
check("ecosystem: provider_count shown", renderEmail("nurture_ecosystem", { provider_count: "240" })!.html.includes("240"));
check("events: title+date in subject", renderEmail("nurture_events", { upcoming_event_title: "SouthStart 2026", upcoming_event_date: "9 September" })!.subject.includes("SouthStart 2026"));
check("upgrade_free: lists Growth + Scale", (() => { const h = renderEmail("nurture_upgrade", { current_tier: "free" })!.html; return h.includes("Growth") && h.includes("Scale"); })());
// XSS through a nurture variable (company name) must be escaped
check("nurture XSS escaped", !renderEmail("nurture_case_studies", { featured_case_study_company: "<script>x</script>" })!.html.includes("<script>x"));

// ── Report ─────────────────────────────────────────────────────────────
console.log(results.join("\n"));
console.log(`\n${failures === 0 ? "ALL PASS" : failures + " FAILURE(S)"}  (${results.length} checks)`);
process.exit(failures === 0 ? 0 : 1);
