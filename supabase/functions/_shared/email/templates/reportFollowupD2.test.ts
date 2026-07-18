/**
 * Tests for the D2 report follow-up email (conversion plan step 4). Run:
 * `npm test`. Counts-only locked findings (never names), graceful degradation
 * without findings, unsubscribe present (marketing-class), report link carried.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { render } from "./reportFollowupD2.ts";

const base = {
  first_name: "Aoife",
  company_name: "Acme Pty",
  report_url: "https://marketentrysecrets.com/report/rep-1",
  locked_findings: [
    { key: "mentor_recommendations", count: 5 },
    { key: "lead_list", count: 12 },
  ],
};

test("teases locked findings by count with the shared phrasing", () => {
  const { html } = render(base);
  assert.match(html, /5 mentors matched to your situation/);
  assert.match(html, /12 lead sources for your target buyers/);
});

test("never leaks names — only the count phrasing appears", () => {
  const { html } = render({
    ...base,
    locked_findings: [{ key: "mentor_recommendations", count: 2, name: "Jane Doe" }],
  });
  assert.ok(!html.includes("Jane Doe"), "sample names must never render");
});

test("degrades gracefully with no findings and defaults", () => {
  const { subject, html } = render({});
  assert.equal(subject, "Your report found more than you have unlocked");
  assert.match(html, /locked sections hold the mentor, customer and lead-list matches/);
  assert.match(html, /my-reports/); // report_url fallback
});

test("is marketing-class: unsubscribe link present", () => {
  const { html } = render(base);
  assert.match(html, /Unsubscribe/i);
});

test("links back to the member's report", () => {
  const { html } = render(base);
  assert.ok(html.includes(base.report_url));
});

test("escapes HTML in user-influenced fields", () => {
  const { html } = render({ ...base, first_name: '<img src=x onerror=alert(1)>' });
  assert.ok(!html.includes('<img src=x'), 'first_name must be escaped');
});
