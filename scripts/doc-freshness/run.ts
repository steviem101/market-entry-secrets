// Doc-freshness runner (MES-124) — gathers repo facts, runs the pure checks
// (checks.ts), prints a Markdown digest, and (if SLACK_DOC_FRESHNESS_WEBHOOK is
// set) posts a Slack digest. Read-only: it never edits docs or writes to the DB.
//
// Run locally:   node scripts/doc-freshness/run.ts        (or: npm run docs:check)
// In CI:         invoked by .github/workflows/doc-freshness.yml on a schedule.
//
// Phase 1 scope: detect + report. The Accept/Reject review queue
// (doc_freshness_proposals + rq-slack-actions) is Phase 2 (approval-gated).

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import {
  runAllChecks,
  sortFindings,
  type Finding,
  type SkillFreshness,
} from "./checks.ts";

const ROOT = join(import.meta.dirname, "..", "..");
const CLAUDE_REVIEW_DAYS = Number(process.env.DOC_FRESHNESS_CLAUDE_DAYS ?? 45);
const SKILL_AGE_DAYS = Number(process.env.DOC_FRESHNESS_SKILL_DAYS ?? 90);

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf8");
}

function listDirs(rel: string): string[] {
  return readdirSync(join(ROOT, rel), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

function walkTsFiles(absDir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(absDir, { withFileTypes: true })) {
    const p = join(absDir, e.name);
    if (e.isDirectory()) walkTsFiles(p, acc);
    else if (e.name.endsWith(".ts")) acc.push(p);
  }
  return acc;
}

function usedSecrets(): string[] {
  const files = walkTsFiles(join(ROOT, "supabase", "functions"));
  const found = new Set<string>();
  const re = /Deno\.env\.get\(\s*["'`]([A-Z][A-Z0-9_]+)["'`]\s*\)/g;
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) found.add(m[1]);
  }
  return [...found];
}

function sectionConfig(): { order: string[]; tiers: Record<string, string> } {
  const src = read("src/components/report/reportSectionConfig.ts");
  const orderBlock = /export const SECTION_ORDER\s*=\s*\[([\s\S]*?)\]/.exec(src);
  const order = orderBlock
    ? [...orderBlock[1].matchAll(/['"]([a-z_]+)['"]/g)].map((m) => m[1])
    : [];
  const tierBlock = /export const TIER_REQUIREMENTS[^{]*\{([\s\S]*?)\}/.exec(src);
  const tiers: Record<string, string> = {};
  if (tierBlock) {
    for (const m of tierBlock[1].matchAll(/([a-z_]+)\s*:\s*['"]([a-z]+)['"]/g)) {
      tiers[m[1]] = m[2];
    }
  }
  return { order, tiers };
}

function routePaths(): string[] {
  const src = read("src/App.tsx");
  return [...src.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
}

function gitLastChange(relDir: string): string | null {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", relDir], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function skills(): SkillFreshness[] {
  const base = join(ROOT, ".claude", "skills");
  let entries: string[];
  try {
    entries = readdirSync(base, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
  const out: SkillFreshness[] = [];
  for (const name of entries) {
    const skillMd = join(base, name, "SKILL.md");
    let lastVerified: string | null = null;
    try {
      const m = /Last verified:\s*(\d{4}-\d{2}-\d{2})/i.exec(readFileSync(skillMd, "utf8"));
      lastVerified = m ? m[1] : null;
    } catch {
      continue; // not a skill dir (no SKILL.md)
    }
    out.push({
      name,
      lastVerified,
      evidenceChangedAt: gitLastChange(join(".claude", "skills", name)),
    });
  }
  return out;
}

function gather() {
  const { order, tiers } = sectionConfig();
  return runAllChecks({
    claudeMd: read("CLAUDE.md"),
    functionDirs: listDirs("supabase/functions"),
    usedSecrets: usedSecrets(),
    sectionOrder: order,
    tierRequirements: tiers,
    migrationFiles: readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql")),
    routePaths: routePaths(),
    skills: skills(),
    now: new Date(),
    thresholds: { claudeReviewDays: CLAUDE_REVIEW_DAYS, skillAgeDays: SKILL_AGE_DAYS },
  });
}

// --- formatting -------------------------------------------------------------

const ICON: Record<string, string> = { high: "🔴", medium: "🟠", low: "🟡" };

function toMarkdown(findings: Finding[]): string {
  if (!findings.length) return "✅ Doc-freshness: CLAUDE.md and the skills library are in sync with the repo.";
  const lines = [`### Doc-freshness drift — ${findings.length} finding(s)`, ""];
  for (const f of findings) {
    lines.push(`- ${ICON[f.severity]} **[${f.check}]** ${f.summary}${f.detail ? ` _(${f.detail})_` : ""}`);
  }
  return lines.join("\n");
}

function escapeSlack(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toSlackText(findings: Finding[]): string {
  if (!findings.length) return ":white_check_mark: *Doc-freshness:* CLAUDE.md + skills library in sync with the repo.";
  const header = `:mag: *Doc-freshness drift* — ${findings.length} finding(s)`;
  const body = findings.map((f) =>
    `${ICON[f.severity]} *[${escapeSlack(f.check)}]* ${escapeSlack(f.summary)}${f.detail ? ` (${escapeSlack(f.detail)})` : ""}`,
  );
  // Slack messages cap at ~40k chars / 50 blocks; keep to a single text block, truncate loudly.
  const MAX = 30;
  const shown = body.slice(0, MAX);
  if (body.length > MAX) shown.push(`_…and ${body.length - MAX} more (see the workflow log)._`);
  return [header, ...shown].join("\n");
}

async function postSlack(text: string): Promise<void> {
  const url = process.env.SLACK_DOC_FRESHNESS_WEBHOOK;
  if (!url) return;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Slack post failed: ${res.status} ${await res.text()}`);
}

async function main(): Promise<void> {
  const findings = sortFindings(gather());
  console.log(toMarkdown(findings));
  try {
    await postSlack(toSlackText(findings));
  } catch (err) {
    console.error(`[warn] Slack post skipped: ${(err as Error).message}`);
  }
  // Read-only advisory job: never fail the workflow on findings. Surface the
  // count for downstream steps / the Actions summary.
  console.log(`\ndoc-freshness: ${findings.length} finding(s), ` +
    `${findings.filter((f) => f.severity === "high").length} high.`);
}

main();
