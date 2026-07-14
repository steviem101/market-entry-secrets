import { test } from "node:test";
import assert from "node:assert/strict";
import { SECTOR_LABELS, sectorLabel } from "./sectorLabels.ts";

// The canonical vocabulary is 20 slugs (MES-110). Keep the map exhaustive so a
// vocabulary change fails loudly here instead of silently falling back.
const CANONICAL_SLUGS = [
  "accommodation-and-food-services",
  "administrative-and-support-services",
  "construction",
  "consumer-services",
  "education",
  "entertainment-providers",
  "farming-ranching-forestry",
  "financial-services",
  "government-administration",
  "holding-companies",
  "hospitals-and-health-care",
  "manufacturing",
  "oil-gas-and-mining",
  "professional-services",
  "real-estate-and-equipment-rental-services",
  "retail",
  "technology-information-and-media",
  "transportation-logistics-supply-chain-and-storage",
  "utilities",
  "wholesale",
];

test("the label map covers exactly the 20 canonical sector slugs", () => {
  assert.deepEqual(Object.keys(SECTOR_LABELS).sort(), [...CANONICAL_SLUGS].sort());
});

test("every canonical slug maps to a non-empty friendly label (no raw taxonomy-ese)", () => {
  for (const slug of CANONICAL_SLUGS) {
    const label = sectorLabel(slug);
    assert.ok(label.trim().length > 0, `${slug} has an empty label`);
    assert.ok(!label.includes("-"), `${slug} label leaks kebab-case: ${label}`);
  }
  // Spot-check the friendly renames the map exists for.
  assert.equal(sectorLabel("farming-ranching-forestry"), "Agriculture & Farming");
  assert.equal(sectorLabel("technology-information-and-media"), "Technology & Media");
  assert.equal(sectorLabel("hospitals-and-health-care"), "Healthcare");
});

test("unknown slugs fall back to humanizeSlug, never raw kebab-case", () => {
  assert.equal(sectorLabel("space-tourism"), "Space Tourism");
});
