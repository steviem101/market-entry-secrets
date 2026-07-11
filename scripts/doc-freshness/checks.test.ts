import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extractSection,
  backtickTokens,
  checkEdgeFunctionInventory,
  checkSecrets,
  checkSectionConfig,
  checkMigrationBaseline,
  checkClaudeReviewAge,
  checkSkillFreshness,
  checkRoutes,
  runAllChecks,
  sortFindings,
  type CheckInputs,
} from "./checks.ts";

// A minimal CLAUDE.md fixture that mirrors the real section structure.
const MD = [
  "# CLAUDE.md",
  "> **Last reviewed: 2026-07-07 (MES-115).**",
  "",
  "## 6. Edge functions (`supabase/functions/`, 2 total)",
  "| Function | Purpose |",
  "|---|---|",
  "| `generate-report` | pipeline |",
  "| `scrape-company` | prefill |",
  "",
  "## 7. AI report pipeline",
  "- **Sections (2):** `executive_summary`, `lead_list`** — (**scale, rest free).",
  "",
  "## 10. Migrations",
  "active dir starts at `20260704095538_remote_baseline.sql`.",
  "",
  "## 12. Environment secrets",
  "| `STRIPE_SECRET` | Checkout |",
  "| `PERPLEXITY_API_KEY` | Research |",
].join("\n");

test("extractSection isolates a numbered section", () => {
  const s6 = extractSection(MD, 6);
  assert.match(s6, /Edge functions/);
  assert.doesNotMatch(s6, /report pipeline/);
});

test("backtickTokens collects code spans", () => {
  assert.deepEqual(backtickTokens("a `x` b `y`"), ["x", "y"]);
});

test("edge-function inventory: clean when count + names match", () => {
  const f = checkEdgeFunctionInventory(MD, ["generate-report", "scrape-company", "_shared"]);
  assert.equal(f.length, 0);
});

test("edge-function inventory: flags count mismatch and undocumented dir", () => {
  const f = checkEdgeFunctionInventory(MD, ["generate-report", "scrape-company", "new-func", "_shared"]);
  assert.ok(f.some((x) => /says 2 edge functions; repo has 3/.test(x.summary)));
  assert.ok(f.some((x) => /not named in CLAUDE.md/.test(x.summary) && x.detail === "new-func"));
});

test("secrets: flags used-but-undocumented and documented-but-unused", () => {
  const f = checkSecrets(MD, ["STRIPE_SECRET", "OPENAI_API_KEY", "SUPABASE_URL"]);
  assert.ok(f.some((x) => x.severity === "high" && /OPENAI_API_KEY/.test(x.detail ?? "")));
  assert.ok(f.some((x) => x.severity === "low" && /PERPLEXITY_API_KEY/.test(x.detail ?? "")));
  // SUPABASE_URL is auto-provided → never flagged.
  assert.ok(!f.some((x) => /SUPABASE_URL/.test(x.detail ?? "")));
});

test("section-config: flags count + missing section", () => {
  const f = checkSectionConfig(MD, ["executive_summary", "lead_list", "swot_analysis"], { swot_analysis: "growth" });
  assert.ok(f.some((x) => /says 2 report sections; reportSectionConfig has 3/.test(x.summary)));
  assert.ok(f.some((x) => /absent from CLAUDE.md/.test(x.summary) && /swot_analysis/.test(x.detail ?? "")));
});

test("section-config: clean when doc matches config", () => {
  const f = checkSectionConfig(MD, ["executive_summary", "lead_list"], { lead_list: "scale" });
  assert.equal(f.length, 0);
});

test("migration-baseline: flags an earlier-sorting file", () => {
  const f = checkMigrationBaseline(MD, ["20260704095538_remote_baseline.sql", "20260101000000_old.sql"]);
  assert.ok(f.some((x) => /sort before the documented baseline/.test(x.summary)));
});

test("migration-baseline: clean when baseline is earliest", () => {
  const f = checkMigrationBaseline(MD, ["20260704095538_remote_baseline.sql", "20260801000000_new.sql"]);
  assert.equal(f.length, 0);
});

test("claude-review-age: flags stale, clean when fresh", () => {
  assert.equal(checkClaudeReviewAge(MD, new Date("2026-07-10T00:00:00Z"), 30).length, 0);
  const stale = checkClaudeReviewAge(MD, new Date("2026-09-01T00:00:00Z"), 30);
  assert.equal(stale.length, 1);
  assert.match(stale[0].summary, /days ago/);
});

test("skill-freshness: missing date, changed-after-verify, and stale", () => {
  const now = new Date("2026-07-10T00:00:00Z");
  const f = checkSkillFreshness([
    { name: "no-date", lastVerified: null, evidenceChangedAt: null },
    { name: "changed", lastVerified: "2026-07-01", evidenceChangedAt: "2026-07-05" },
    { name: "old", lastVerified: "2026-01-01", evidenceChangedAt: "2025-12-01" },
    { name: "fresh", lastVerified: "2026-07-08", evidenceChangedAt: "2026-07-02" },
  ], now, 90);
  assert.ok(f.some((x) => /no 'Last verified:'/.test(x.summary)));
  assert.ok(f.some((x) => /changed 2026-07-05 after/.test(x.summary)));
  assert.ok(f.some((x) => /old.*days ago/.test(x.summary)));
  assert.ok(!f.some((x) => /'fresh'/.test(x.summary)));
});

test("routes: flags an undocumented top-level segment", () => {
  const f = checkRoutes(MD, ["/generate-report", "/brand-new-thing/:id", "/scrape-company"]);
  assert.equal(f.length, 1);
  assert.match(f[0].detail ?? "", /\/brand-new-thing/);
});

test("runAllChecks + sortFindings: high severity first", () => {
  const inputs: CheckInputs = {
    claudeMd: MD,
    functionDirs: ["generate-report", "scrape-company", "extra-func", "_shared"],
    usedSecrets: ["STRIPE_SECRET", "PERPLEXITY_API_KEY"],
    sectionOrder: ["executive_summary", "lead_list"],
    tierRequirements: { lead_list: "scale" },
    migrationFiles: ["20260704095538_remote_baseline.sql"],
    routePaths: ["/generate-report"],
    skills: [],
    now: new Date("2026-07-10T00:00:00Z"),
    thresholds: { claudeReviewDays: 30, skillAgeDays: 90 },
  };
  const sorted = sortFindings(runAllChecks(inputs));
  assert.ok(sorted.length >= 1);
  assert.equal(sorted[0].severity, "high"); // the extra-func inventory drift
});
