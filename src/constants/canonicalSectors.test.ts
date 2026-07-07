/**
 * MES-110 mapping-completeness tests: the generated canonical constants must
 * stay in lockstep with the audit CSVs (the approved source of truth) and with
 * the live V2 taxonomy the forms present. Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LINKEDIN_INDUSTRY_CODES,
  V2_GROUP_TO_CODE,
  getCodeForV2Group,
  getIndustryByCode,
} from "./canonicalSectors.ts";
import { INDUSTRY_GROUP_OPTIONS, LINKEDIN_SECTORS } from "./linkedinTaxonomy.ts";

/** Minimal RFC-4180 CSV parser (the audit CSVs contain quoted commas). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch !== "\r") field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

test("147 canonical codes, unique codes and descriptions", () => {
  assert.equal(LINKEDIN_INDUSTRY_CODES.length, 147);
  assert.equal(new Set(LINKEDIN_INDUSTRY_CODES.map((c) => c.code)).size, 147);
  assert.equal(new Set(LINKEDIN_INDUSTRY_CODES.map((c) => c.description)).size, 147);
});

test("constants match the pinned audit CSV verbatim", () => {
  const [header, ...rows] = parseCsv(
    readFileSync("docs/audits/mes-110/linkedin-industry-codes-147.csv", "utf8"),
  );
  assert.deepEqual(header, ["code", "groups", "description"]);
  assert.equal(rows.length, 147);
  for (const [code, groups, description] of rows) {
    const entry = getIndustryByCode(Number(code));
    assert.ok(entry, `code ${code} missing from LINKEDIN_INDUSTRY_CODES`);
    assert.equal(entry.description, description);
    assert.deepEqual(entry.groups, groups.split(",").map((g) => g.trim()));
  }
});

test("every V2 industry group the forms present has a canonical code", () => {
  assert.equal(INDUSTRY_GROUP_OPTIONS.length, 152);
  for (const group of INDUSTRY_GROUP_OPTIONS) {
    const code = getCodeForV2Group(group);
    assert.ok(code !== undefined, `no canonical code for group "${group}"`);
    assert.ok(getIndustryByCode(code!), `code ${code} for "${group}" not in the 147 table`);
  }
});

test("crosswalk has no orphan groups and its slugs are real sector slugs", () => {
  const groupSet = new Set<string>(INDUSTRY_GROUP_OPTIONS);
  const sectorSlugs = new Set(LINKEDIN_SECTORS.map(slugify));
  for (const [group, { v2SectorSlug }] of Object.entries(V2_GROUP_TO_CODE)) {
    assert.ok(groupSet.has(group), `crosswalk group "${group}" is not a form option`);
    assert.ok(sectorSlugs.has(v2SectorSlug), `bad sector slug "${v2SectorSlug}" for "${group}"`);
  }
  assert.equal(Object.keys(V2_GROUP_TO_CODE).length, 152);
});

test("crosswalk matches the audit crosswalk CSV row-for-row", () => {
  const [header, ...rows] = parseCsv(
    readFileSync("docs/audits/mes-110/mapping-v2-industry-groups-to-147.csv", "utf8"),
  );
  const groupIdx = header.indexOf("raw_value");
  const codeIdx = header.indexOf("linkedin_code");
  assert.equal(rows.length, 152);
  for (const row of rows) {
    assert.equal(
      getCodeForV2Group(row[groupIdx]),
      Number(row[codeIdx]),
      `code drift for group "${row[groupIdx]}"`,
    );
  }
});
