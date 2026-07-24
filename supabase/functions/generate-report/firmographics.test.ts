/**
 * Tests for the MES-235 firmographics prompt-signal builder. Run: `npm test`.
 *
 * The `synthetic-melb-medtech-firmographics` fixture is the Phase-0-vs-after "diff"
 * the ticket asks for: BEFORE, customer_size / buying_motion reached no section prompt
 * (dead fields); AFTER, they produce a labelled, motion/size-specific note. The
 * motion-variant cases prove the signal DEMONSTRABLY alters the prompt (AC1) rather
 * than decorating it — a different buying motion yields a different steer.
 *
 * Note on the "no steer" assertions: the static grounding clause deliberately contains
 * the words "self-serve" and "procurement-led" (as a do-not-contradict example), so the
 * steer-presence checks anchor on the steer sentence openers "Expect " / "Prioritise ",
 * which never appear outside a real steer.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFirmographicsNote, type Firmographics } from "./firmographics.ts";

// The synthetic fixture: a Melbourne medtech selling B2B into large hospital networks.
const MELB_MEDTECH: Firmographics = {
  customer_type: "B2B",
  customer_size: "Enterprise (500+)",
  buying_motion: "Direct sales",
};

test("synthetic-melb-medtech-firmographics: structured chips become a labelled prompt note", () => {
  const note = buildFirmographicsNote(MELB_MEDTECH);
  // Phase-0 baseline was "" (the columns reached no prompt). Now the block exists.
  assert.notEqual(note, "");
  assert.match(note, /BUYER FIRMOGRAPHICS/);
  // Every structured chip is reflected, cleanly (no chip-soup), as an explicit label.
  assert.match(note, /Customer type: B2B/);
  assert.match(note, /Customer size: Enterprise \(500\+\)/);
  assert.match(note, /Buying motion: Direct sales/);
  // Enterprise size → procurement-led cycle steer; direct motion → outbound steer.
  assert.match(note, /Expect long, procurement-led enterprise cycles/);
  assert.match(note, /Prioritise a direct outbound sales motion/);
});

test("AC1: a different buying motion demonstrably changes the note", () => {
  const direct = buildFirmographicsNote(MELB_MEDTECH);
  const channel = buildFirmographicsNote({ ...MELB_MEDTECH, buying_motion: "Channel / partners" });
  const selfServe = buildFirmographicsNote({ ...MELB_MEDTECH, buying_motion: "Self-serve / marketplace" });

  assert.notEqual(direct, channel);
  assert.notEqual(direct, selfServe);
  assert.notEqual(channel, selfServe);

  // Channel seller must NOT be pushed a direct-outbound plan, and vice-versa.
  assert.match(channel, /Prioritise a channel \/ partner motion/);
  assert.doesNotMatch(channel, /Prioritise a direct outbound sales motion/);
  assert.match(selfServe, /Prioritise a product-led, self-serve motion/);
  assert.doesNotMatch(selfServe, /Prioritise a direct outbound sales motion/);
});

test("AC1: a different customer size demonstrably changes the note", () => {
  const enterprise = buildFirmographicsNote(MELB_MEDTECH);
  const smb = buildFirmographicsNote({ ...MELB_MEDTECH, customer_size: "SMB (<50)" });
  assert.notEqual(enterprise, smb);
  assert.match(smb, /Customer size: SMB \(<50\)/);
  assert.match(smb, /Expect short, high-velocity SMB cycles/);
  assert.doesNotMatch(smb, /Expect long, procurement-led enterprise cycles/);
});

test("no firmographic signal → empty note (never 'Not specified')", () => {
  assert.equal(buildFirmographicsNote({}), "");
  assert.equal(buildFirmographicsNote(null), "");
  assert.equal(buildFirmographicsNote(undefined), "");
  assert.equal(buildFirmographicsNote({ customer_type: "", customer_size: null, buying_motion: undefined }), "");
});

test("partial signal: a single chip still yields a note with just that label + its steer", () => {
  const sizeOnly = buildFirmographicsNote({ customer_size: "Mid-market (50-500)" });
  assert.match(sizeOnly, /Customer size: Mid-market \(50-500\)/);
  assert.match(sizeOnly, /Expect mid-market cycles/);
  assert.doesNotMatch(sizeOnly, /Customer type:/); // no type label when type absent
  assert.doesNotMatch(sizeOnly, /Buying motion:/); // no motion label when motion absent
});

test("'Mixed' enum values read as plain labels and carry no single steer", () => {
  const note = buildFirmographicsNote({ customer_type: "Mixed", customer_size: "Mixed", buying_motion: "Mixed" });
  assert.match(note, /Customer type: Mixed/);
  assert.match(note, /Customer size: Mixed/);
  assert.match(note, /Buying motion: Mixed/);
  // "Mixed" carries no size/motion steer — the note is labels-only, still grounded.
  // Anchor on the steer openers so the static grounding clause can't false-positive.
  assert.doesNotMatch(note, /Expect |Prioritise /);
});
