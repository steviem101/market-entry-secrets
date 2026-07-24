/**
 * Tests for the MES-236 "Founder peers" sub-slate. Run: `npm test`.
 *
 * Guards the two ACs: (1) the sub-slate is drawn ONLY from vetted matched mentors
 * carrying the founder archetypes — no invented people; (2) card copy and behaviour
 * agree — the note only appears when the founders goal is selected AND real peers
 * exist, so the "Connect with other founders" promise is never made emptily.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { isFounderPeer, buildFounderPeersNote } from "./founderPeers.ts";

test("isFounderPeer: true only for the founder archetypes, case-insensitively", () => {
  assert.equal(isFounderPeer({ specialties: ["Scaled Founder"] }), true);
  assert.equal(isFounderPeer({ specialties: ["International Founder"] }), true);
  assert.equal(isFounderPeer({ specialties: ["scaled founder"] }), true); // case-insensitive
  assert.equal(isFounderPeer({ specialties: ["Active Advisor", "Cross-border", "International Founder"] }), true);
  assert.equal(isFounderPeer({ specialties: ["Active Advisor", "Startup Advisor"] }), false);
  assert.equal(isFounderPeer({ specialties: [] }), false);
  assert.equal(isFounderPeer({}), false);            // no specialties field
  assert.equal(isFounderPeer({ specialties: "Scaled Founder" }), false); // not an array
  assert.equal(isFounderPeer(null), false);
});

test("buildFounderPeersNote: '' when the founders goal is NOT selected (even if peers exist)", () => {
  const mentors = [{ name: "Jane Doe", specialties: ["Scaled Founder"] }];
  assert.equal(buildFounderPeersNote(false, mentors), "");
});

test("buildFounderPeersNote: '' when selected but no matched mentor is a founder peer", () => {
  const mentors = [
    { name: "Al Advisor", specialties: ["Active Advisor"] },
    { name: "Sam Startup", specialties: ["Startup Advisor", "Cross-border"] },
  ];
  assert.equal(buildFounderPeersNote(true, mentors), "");
  assert.equal(buildFounderPeersNote(true, []), "");
  assert.equal(buildFounderPeersNote(true, null), "");
});

test("buildFounderPeersNote: labels ONLY the founder-archetype mentors, grounded on real names", () => {
  const mentors = [
    { name: "Fiona Founder", specialties: ["Scaled Founder", "Active Advisor"] },
    { name: "Ivan Intl", specialties: ["International Founder"] },
    { name: "Al Advisor", specialties: ["Active Advisor"] }, // NOT a founder peer
  ];
  const note = buildFounderPeersNote(true, mentors);
  assert.match(note, /### Founder peers/);
  assert.match(note, /Fiona Founder/);
  assert.match(note, /Ivan Intl/);
  assert.doesNotMatch(note, /Al Advisor/);   // non-founder mentor excluded
  assert.match(note, /never invent founders/); // grounding guard present
});

test("buildFounderPeersNote: caps the named peers and never invents beyond the input", () => {
  const many = Array.from({ length: 8 }, (_, i) => ({ name: `Founder ${i}`, specialties: ["Scaled Founder"] }));
  const note = buildFounderPeersNote(true, many, 4);
  const named = ["Founder 0", "Founder 1", "Founder 2", "Founder 3"].filter((n) => note.includes(n));
  const overflow = ["Founder 4", "Founder 5", "Founder 6", "Founder 7"].filter((n) => note.includes(n));
  assert.equal(named.length, 4);
  assert.equal(overflow.length, 0); // capped — no extra, and certainly nothing invented
});

test("buildFounderPeersNote: a founder peer with no usable name is skipped (no blank entries)", () => {
  const mentors = [
    { name: "  ", specialties: ["Scaled Founder"] },     // blank name
    { name: "Real Founder", specialties: ["International Founder"] },
  ];
  const note = buildFounderPeersNote(true, mentors);
  assert.match(note, /Real Founder/);
  // Exactly one name before the colon-list — the blank one is dropped, not rendered as ", ,".
  assert.doesNotMatch(note, /:\s*,|,\s*,/);
});
