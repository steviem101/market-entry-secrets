import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_SECTOR_SLUGS,
  SECTOR_LABEL_OVERRIDE_KEYS,
  sectorLabel,
  sectorSlug,
} from "./sectorLabels.ts";
import { LINKEDIN_SECTORS } from "../constants/linkedinTaxonomy.ts";

test("sectorSlug mirrors the DB slugify", () => {
  assert.equal(sectorSlug("Financial Services"), "financial-services");
  assert.equal(sectorSlug("Farming, Ranching, Forestry"), "farming-ranching-forestry");
  assert.equal(sectorSlug("Oil, Gas, and Mining"), "oil-gas-and-mining");
  assert.equal(sectorSlug("Technology, Information and Media"), "technology-information-and-media");
});

test("the canonical slug set is derived from LINKEDIN_SECTORS (single source of truth)", () => {
  assert.deepEqual(CANONICAL_SECTOR_SLUGS, LINKEDIN_SECTORS.map(sectorSlug));
  // The 20-sector vocabulary is the whole set; guards against an accidental empty derive.
  assert.equal(CANONICAL_SECTOR_SLUGS.length, LINKEDIN_SECTORS.length);
});

test("the friendly-override map covers EXACTLY the canonical slugs (drift fails loudly)", () => {
  // Adding/renaming a sector in LINKEDIN_SECTORS without a matching label — or an
  // orphaned override left behind — fails here instead of silently shipping a
  // humanizeSlug fallback in every sector dropdown.
  assert.deepEqual([...SECTOR_LABEL_OVERRIDE_KEYS].sort(), [...CANONICAL_SECTOR_SLUGS].sort());
});

test("every canonical slug renders a non-empty friendly label, no raw kebab-case", () => {
  for (const slug of CANONICAL_SECTOR_SLUGS) {
    const label = sectorLabel(slug);
    assert.ok(label.trim().length > 0, `${slug} has an empty label`);
    assert.ok(!label.includes("-"), `${slug} label leaks kebab-case: ${label}`);
  }
  assert.equal(sectorLabel("farming-ranching-forestry"), "Agriculture & Farming");
  assert.equal(sectorLabel("technology-information-and-media"), "Technology & Media");
  assert.equal(sectorLabel("hospitals-and-health-care"), "Healthcare");
});

test("unknown slugs fall back to humanizeSlug, never raw kebab-case", () => {
  assert.equal(sectorLabel("space-tourism"), "Space Tourism");
});
