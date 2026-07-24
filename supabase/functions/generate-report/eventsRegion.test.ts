/**
 * Tests for the events region hard-filter + dedupe (MES-232, extracted from index.ts).
 * Run: `npm test`. Covers the MES-186 B contract: an EMPTY locationPatterns skips the
 * city hard-drop (how a "National" target is honoured) while dedupe still runs.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeEventKeyPart, regionFilterAndDedupeEvents } from "./eventsRegion.ts";

type Ev = { id?: string; title?: string; date?: string; location?: string };

const MELB: Ev = { id: "melb", title: "Talent X RCSA", date: "2026-09-01", location: "Melbourne, VIC" };
const SYD: Ev = { id: "syd", title: "HR + L&D Innovation & Tech Fest", date: "2026-10-01", location: "Sydney, NSW" };
const PER: Ev = { id: "per", title: "Perth Founders Breakfast", date: "2026-08-01", location: "Perth, WA" };

test("region filter hard-drops events outside the supplied city tokens", () => {
  const out = regionFilterAndDedupeEvents([MELB, SYD, PER], ["melbourne", "victoria", "vic"], 5);
  assert.deepEqual(out.map((e) => e.id), ["melb"]);
});

test("MES-186 B: empty locationPatterns skips the city drop (honour National) — all cities eligible", () => {
  const out = regionFilterAndDedupeEvents([MELB, SYD, PER], [], 5);
  assert.deepEqual(out.map((e) => e.id), ["melb", "syd", "per"]);
});

test("National relax still dedupes near-identical title|date|venue rows and honours the cap", () => {
  const dupeA: Ev = { id: "a", title: "Startups Demos & Networking Melbourne", date: "2026-09-09", location: "Melbourne VIC" };
  const dupeB: Ev = { id: "b", title: "Startups Demos & Networking Melbourne!!!", date: "2026-09-09", location: "Melbourne, VIC" };
  const out = regionFilterAndDedupeEvents([dupeA, dupeB, SYD, PER], [], 2);
  assert.equal(out.length, 2, "cap respected");
  assert.deepEqual(out.map((e) => e.id), ["a", "syd"], "second duplicate collapsed, cap stops at 2");
});

test("input order is preserved (ranking upstream decides order; this only filters/dedupes/caps)", () => {
  const out = regionFilterAndDedupeEvents([SYD, MELB, PER], [], 5);
  assert.deepEqual(out.map((e) => e.id), ["syd", "melb", "per"]);
});

test("empty/undefined input is safe", () => {
  assert.deepEqual(regionFilterAndDedupeEvents([], ["sydney"], 5), []);
  assert.deepEqual(regionFilterAndDedupeEvents(undefined as unknown as Ev[], [], 5), []);
});

test("normalizeEventKeyPart flattens punctuation/case and keeps the first 6 tokens", () => {
  assert.equal(normalizeEventKeyPart("HR + L&D Innovation & Tech Fest 2026 Sydney"), "hr l d innovation tech fest");
  assert.equal(normalizeEventKeyPart("Melbourne, VIC"), "melbourne vic");
  assert.equal(normalizeEventKeyPart(""), "");
});
