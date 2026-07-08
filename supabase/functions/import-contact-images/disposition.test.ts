import { test } from "node:test";
import assert from "node:assert/strict";
import { decideDisposition } from "./disposition.ts";
import type { Candidate, MatchResult } from "./matching.ts";

const mentor: Candidate = { surface: "mentor", table: "community_members", recordId: "m1", name: "Jane", org: "Acme", email: null, linkedinNormalized: "linkedin.com/in/jane" };
const agency: Candidate = { surface: "agency_contact", table: "agency_contacts", recordId: "a1", name: "Jane", org: "Austrade", email: null, linkedinNormalized: "linkedin.com/in/jane" };
const investor: Candidate = { surface: "investor", table: "investors", recordId: "i1", name: "Bob", org: "VC", email: null, linkedinNormalized: "linkedin.com/in/bob" };

const matched = (method: MatchResult["method"], targets: Candidate[]): MatchResult => ({ status: "matched", method, targets });

test("failed match → failed", () => {
  const d = decideDisposition({ status: "failed", method: null, targets: [], reason: "no_match" }, { applyNameMatches: false, includeColdContacts: false });
  assert.equal(d.action, "failed");
});

test("name-only match is held for review by default", () => {
  const d = decideDisposition(matched("name_org", [mentor]), { applyNameMatches: false, includeColdContacts: false });
  assert.equal(d.action, "needs_review");
  assert.match(d.reason, /name_only/);
});

test("name-only match writes when approved", () => {
  const d = decideDisposition(matched("name_org", [mentor]), { applyNameMatches: true, includeColdContacts: false });
  assert.equal(d.action, "write");
});

test("linkedin match to a participant surface auto-writes", () => {
  const d = decideDisposition(matched("linkedin", [mentor]), { applyNameMatches: false, includeColdContacts: false });
  assert.equal(d.action, "write");
  if (d.action === "write") assert.equal(d.heldCold, 0);
});

test("cold-only match (agency/investor) is held by default", () => {
  const d = decideDisposition(matched("linkedin", [agency, investor]), { applyNameMatches: false, includeColdContacts: false });
  assert.equal(d.action, "needs_review");
  assert.match(d.reason, /cold_contact_gated/);
});

test("cold match writes when includeColdContacts is set", () => {
  const d = decideDisposition(matched("linkedin", [agency]), { applyNameMatches: false, includeColdContacts: true });
  assert.equal(d.action, "write");
});

test("mixed participant + cold: writes participant, gates cold (heldCold counted)", () => {
  const d = decideDisposition(matched("linkedin", [mentor, agency]), { applyNameMatches: false, includeColdContacts: false });
  assert.equal(d.action, "write");
  if (d.action === "write") {
    assert.deepEqual(d.targets.map((t) => t.surface), ["mentor"]);
    assert.equal(d.heldCold, 1);
  }
});
