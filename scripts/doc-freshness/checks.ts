// Doc-freshness drift checks (MES-124) — PURE logic, no IO.
//
// Each check takes already-gathered repo facts and returns Finding[]. All
// filesystem/git access lives in run.ts so this module stays unit-testable
// (colocated checks.test.ts). Checks compare what CLAUDE.md claims against
// ground truth so the root context file can never silently rot again.

export type Severity = "high" | "medium" | "low";

export interface Finding {
  /** kebab-case check id, e.g. "edge-function-inventory" */
  check: string;
  severity: Severity;
  /** one-line statement of the drift */
  summary: string;
  /** optional extra detail (names, counts) */
  detail?: string;
}

// --- parsing helpers --------------------------------------------------------

/** Return the body of a numbered section ("## N. Title") up to the next "## ". */
export function extractSection(md: string, sectionNumber: number): string {
  const lines = md.split("\n");
  const startRe = new RegExp(`^##\\s+${sectionNumber}\\.\\s`);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (startRe.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start === -1) return "";
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
}

/** All backtick-delimited tokens in a chunk of markdown. */
export function backtickTokens(md: string): string[] {
  const out: string[] = [];
  const re = /`([^`]+)`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) out.push(m[1]);
  return out;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 86_400_000);
}

function parseIsoDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`);
  return isNaN(d.getTime()) ? null : d;
}

// --- individual checks ------------------------------------------------------

/**
 * §6 claims a total function count and names each function. Compare against the
 * real directories under supabase/functions (excluding _shared).
 */
export function checkEdgeFunctionInventory(claudeMd: string, functionDirs: string[]): Finding[] {
  const findings: Finding[] = [];
  const section = extractSection(claudeMd, 6);
  const actual = functionDirs.filter((d) => d !== "_shared").sort();

  const countMatch = /\bfunctions?\b[^\n]*?(\d+)\s+total/i.exec(section) ??
    /,\s*(\d+)\s+total\)/.exec(section);
  if (countMatch) {
    const claimed = Number(countMatch[1]);
    if (claimed !== actual.length) {
      findings.push({
        check: "edge-function-inventory",
        severity: "high",
        summary: `CLAUDE.md §6 says ${claimed} edge functions; repo has ${actual.length}.`,
        detail: `actual: ${actual.length} dirs under supabase/functions (excl. _shared)`,
      });
    }
  } else {
    findings.push({
      check: "edge-function-inventory",
      severity: "low",
      summary: "Could not find the '<n> total' function count in CLAUDE.md §6.",
    });
  }

  const documented = new Set(backtickTokens(section));
  const undocumented = actual.filter((name) => !documented.has(name));
  if (undocumented.length) {
    findings.push({
      check: "edge-function-inventory",
      severity: "high",
      summary: `${undocumented.length} edge function(s) exist but are not named in CLAUDE.md §6.`,
      detail: undocumented.join(", "),
    });
  }

  // Names mentioned in §6 that look like a function but have no directory.
  const actualSet = new Set(actual);
  const ghosts = [...documented].filter(
    (t) => /^[a-z][a-z0-9-]+$/.test(t) && t.includes("-") && t !== "verify-jwt" &&
      !actualSet.has(t) && looksLikeFunctionName(t, section),
  );
  if (ghosts.length) {
    findings.push({
      check: "edge-function-inventory",
      severity: "medium",
      summary: `CLAUDE.md §6 names function(s) with no directory: ${ghosts.join(", ")}.`,
    });
  }
  return findings;
}

// A backtick token counts as a claimed function only if it sits in a table row
// (leading "| ") — avoids flagging incidental hyphenated tokens in prose.
function looksLikeFunctionName(token: string, section: string): boolean {
  const re = new RegExp(`^\\|\\s*\`[^\`]*\\b${token.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "m");
  return re.test(section);
}

/**
 * §12 documents secret names; compare against secrets actually referenced in
 * edge-function code (Deno.env.get). Auto-provided SUPABASE_* are exempt.
 */
export function checkSecrets(claudeMd: string, usedSecrets: string[]): Finding[] {
  const findings: Finding[] = [];
  const AUTO = new Set(["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]);
  const section = extractSection(claudeMd, 12);
  const documented = new Set(
    backtickTokens(section).filter((t) => /^[A-Z][A-Z0-9_]+$/.test(t)),
  );
  const used = new Set(usedSecrets.filter((s) => !AUTO.has(s)));

  const undocumented = [...used].filter((s) => !documented.has(s)).sort();
  if (undocumented.length) {
    findings.push({
      check: "secrets",
      severity: "high",
      summary: `${undocumented.length} secret(s) used in code but not documented in CLAUDE.md §12.`,
      detail: undocumented.join(", "),
    });
  }
  const unused = [...documented].filter((s) => !used.has(s) && !AUTO.has(s)).sort();
  if (unused.length) {
    findings.push({
      check: "secrets",
      severity: "low",
      summary: `${unused.length} secret(s) documented in §12 but not referenced in edge-function code.`,
      detail: `${unused.join(", ")} (may be used by cron SQL / GH Actions / Vault — verify before removing)`,
    });
  }
  return findings;
}

/**
 * §7 lists the report sections and a count; compare against reportSectionConfig
 * SECTION_ORDER + TIER_REQUIREMENTS (parsed by run.ts).
 */
export function checkSectionConfig(
  claudeMd: string,
  sectionOrder: string[],
  tierRequirements: Record<string, string>,
): Finding[] {
  const findings: Finding[] = [];
  const section = extractSection(claudeMd, 7);

  const countMatch = /\*\*Sections?\s*\((\d+)\):\*\*/.exec(section);
  if (countMatch && Number(countMatch[1]) !== sectionOrder.length) {
    findings.push({
      check: "section-config",
      severity: "high",
      summary: `CLAUDE.md §7 says ${countMatch[1]} report sections; reportSectionConfig has ${sectionOrder.length}.`,
    });
  }

  // Only the "**Sections (N):**" bullet lists section names — scope token
  // extraction to it so other backticked identifiers in §7 (report_templates,
  // get_tier_gated_report…) and other bolded "**Sections …**" prose aren't
  // mistaken for sections. Anchor to the count marker specifically.
  let sentence = section;
  if (countMatch && countMatch.index !== undefined) {
    const rest = section.slice(countMatch.index);
    const end = rest.search(/\n- /); // next markdown bullet ends this one
    sentence = end === -1 ? rest : rest.slice(0, end);
  }
  const documented = new Set(
    backtickTokens(sentence).filter((t) => /^[a-z][a-z0-9_]+$/.test(t) && t.includes("_")),
  );
  const config = new Set(sectionOrder);
  const missing = sectionOrder.filter((s) => !documented.has(s));
  if (missing.length) {
    findings.push({
      check: "section-config",
      severity: "high",
      summary: `${missing.length} report section(s) in config are absent from CLAUDE.md §7.`,
      detail: missing.join(", "),
    });
  }
  const stale = [...documented].filter((s) => !config.has(s));
  if (stale.length) {
    findings.push({
      check: "section-config",
      severity: "medium",
      summary: `CLAUDE.md §7 names section(s) not in reportSectionConfig: ${stale.join(", ")}.`,
    });
  }
  // Every gated section should be discoverable in the doc (the tier-truth rule).
  const gatedMissing = Object.keys(tierRequirements).filter((s) => !documented.has(s));
  if (gatedMissing.length) {
    findings.push({
      check: "section-config",
      severity: "medium",
      summary: `Gated section(s) missing from §7: ${gatedMissing.join(", ")}.`,
    });
  }
  return findings;
}

/**
 * §10 names the migration baseline; confirm it exists and nothing sorts before it.
 */
export function checkMigrationBaseline(claudeMd: string, migrationFiles: string[]): Finding[] {
  const findings: Finding[] = [];
  const section = extractSection(claudeMd, 10);
  const baseline = backtickTokens(section).find(
    (t) => /^\d{14}_.*baseline.*\.sql$/i.test(t),
  );
  if (!baseline) {
    findings.push({
      check: "migration-baseline",
      severity: "low",
      summary: "Could not find the baseline migration filename in CLAUDE.md §10.",
    });
    return findings;
  }
  const files = [...migrationFiles].sort();
  if (!files.includes(baseline)) {
    findings.push({
      check: "migration-baseline",
      severity: "high",
      summary: `CLAUDE.md §10 baseline '${baseline}' is not in supabase/migrations/.`,
    });
    return findings;
  }
  const earlier = files.filter((f) => f < baseline);
  if (earlier.length) {
    findings.push({
      check: "migration-baseline",
      severity: "high",
      summary: `${earlier.length} migration(s) sort before the documented baseline '${baseline}'.`,
      detail: earlier.join(", "),
    });
  }
  return findings;
}

/** "Last reviewed: YYYY-MM-DD" in the header — flag if stale. */
export function checkClaudeReviewAge(claudeMd: string, now: Date, maxDays: number): Finding[] {
  const m = /Last reviewed:\s*(\d{4}-\d{2}-\d{2})/i.exec(claudeMd);
  if (!m) {
    return [{
      check: "claude-review-age",
      severity: "medium",
      summary: "CLAUDE.md has no 'Last reviewed: YYYY-MM-DD' line.",
    }];
  }
  const reviewed = parseIsoDate(m[1])!;
  const age = daysBetween(now, reviewed);
  if (age > maxDays) {
    return [{
      check: "claude-review-age",
      severity: "medium",
      summary: `CLAUDE.md last reviewed ${m[1]} (${age} days ago, threshold ${maxDays}).`,
    }];
  }
  return [];
}

export interface SkillFreshness {
  name: string;
  /** ISO date from the skill's "Last verified:" line, or null if absent. */
  lastVerified: string | null;
  /** ISO date of the most recent git change to the skill dir, or null. */
  evidenceChangedAt: string | null;
}

/** Flag skills missing a date, older than maxAgeDays, or changed after verification. */
export function checkSkillFreshness(skills: SkillFreshness[], now: Date, maxAgeDays: number): Finding[] {
  const findings: Finding[] = [];
  for (const s of skills) {
    if (!s.lastVerified) {
      findings.push({
        check: "skill-freshness",
        severity: "low",
        summary: `Skill '${s.name}' has no 'Last verified:' date.`,
      });
      continue;
    }
    const verified = parseIsoDate(s.lastVerified);
    if (!verified) {
      findings.push({
        check: "skill-freshness",
        severity: "low",
        summary: `Skill '${s.name}' has an unparseable 'Last verified:' value '${s.lastVerified}'.`,
      });
      continue;
    }
    const changed = s.evidenceChangedAt ? parseIsoDate(s.evidenceChangedAt) : null;
    if (changed && changed.getTime() > verified.getTime()) {
      findings.push({
        check: "skill-freshness",
        severity: "medium",
        summary: `Skill '${s.name}' changed ${s.evidenceChangedAt} after its last verification ${s.lastVerified}.`,
      });
      continue;
    }
    const age = daysBetween(now, verified);
    if (age > maxAgeDays) {
      findings.push({
        check: "skill-freshness",
        severity: "low",
        summary: `Skill '${s.name}' last verified ${s.lastVerified} (${age} days ago, threshold ${maxAgeDays}).`,
      });
    }
  }
  return findings;
}

/**
 * Every top-level route segment in App.tsx should appear somewhere in CLAUDE.md
 * (best-effort: catches a whole new directory route that was never documented).
 */
export function checkRoutes(claudeMd: string, routePaths: string[]): Finding[] {
  const segments = new Set<string>();
  for (const p of routePaths) {
    const seg = p.replace(/^\//, "").split("/")[0];
    if (seg && !seg.startsWith(":") && seg !== "*") segments.add(seg);
  }
  const undocumented = [...segments].filter((seg) => !claudeMd.includes(seg)).sort();
  if (undocumented.length) {
    return [{
      check: "routes",
      severity: "medium",
      summary: `${undocumented.length} top-level route segment(s) not mentioned in CLAUDE.md.`,
      detail: undocumented.map((s) => `/${s}`).join(", "),
    }];
  }
  return [];
}

// --- aggregator -------------------------------------------------------------

export interface CheckInputs {
  claudeMd: string;
  functionDirs: string[];
  usedSecrets: string[];
  sectionOrder: string[];
  tierRequirements: Record<string, string>;
  migrationFiles: string[];
  routePaths: string[];
  skills: SkillFreshness[];
  now: Date;
  thresholds: { claudeReviewDays: number; skillAgeDays: number };
}

export function runAllChecks(i: CheckInputs): Finding[] {
  return [
    ...checkEdgeFunctionInventory(i.claudeMd, i.functionDirs),
    ...checkSecrets(i.claudeMd, i.usedSecrets),
    ...checkSectionConfig(i.claudeMd, i.sectionOrder, i.tierRequirements),
    ...checkMigrationBaseline(i.claudeMd, i.migrationFiles),
    ...checkRoutes(i.claudeMd, i.routePaths),
    ...checkClaudeReviewAge(i.claudeMd, i.now, i.thresholds.claudeReviewDays),
    ...checkSkillFreshness(i.skills, i.now, i.thresholds.skillAgeDays),
  ];
}

const RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) =>
    RANK[a.severity] - RANK[b.severity] || a.check.localeCompare(b.check));
}
