import { test } from "node:test";
import assert from "node:assert/strict";
import { matchRow, type Candidate } from "./matching.ts";

const mentor: Candidate = {
  surface: "mentor", table: "community_members", recordId: "m1",
  name: "Jane Doe", org: "Acme", email: "jane@acme.com", linkedinNormalized: "linkedin.com/in/jane-doe",
};
const agencyContact: Candidate = {
  surface: "agency_contact", table: "agency_contacts", recordId: "a1",
  name: "Jane Doe", org: "Austrade", email: "jane@austrade.gov.au", linkedinNormalized: "linkedin.com/in/jane-doe",
};
const otherJaneAgency: Candidate = {
  surface: "agency_contact", table: "agency_contacts", recordId: "a2",
  name: "Jane Doe", org: "Austrade", email: null, linkedinNormalized: "linkedin.com/in/jane-doe",
};
const investor: Candidate = {
  surface: "investor", table: "investors", recordId: "i1",
  name: "Bob Smith", org: "VC Fund", email: "bob@vc.com", linkedinNormalized: "linkedin.com/in/bob-smith",
};

test("linkedin match wins and fans out across different tables", () => {
  const r = matchRow({ fullName: "Jane Doe", linkedinUrl: "https://www.linkedin.com/in/jane-doe/", email: "", company: "" },
    [mentor, agencyContact, investor]);
  assert.equal(r.status, "matched");
  assert.equal(r.method, "linkedin");
  assert.deepEqual(r.targets.map((t) => t.table).sort(), ["agency_contacts", "community_members"]);
});

test("two different people in the SAME table via linkedin is ambiguous -> failed", () => {
  const r = matchRow({ fullName: "Jane Doe", linkedinUrl: "linkedin.com/in/jane-doe", email: "", company: "" },
    [agencyContact, otherJaneAgency]);
  assert.equal(r.status, "failed");
  assert.match(r.reason ?? "", /ambiguous/);
});

test("falls back to email when no linkedin on the row", () => {
  const r = matchRow({ fullName: "Jane Doe", linkedinUrl: "", email: "JANE@acme.com", company: "" }, [mentor, investor]);
  assert.equal(r.status, "matched");
  assert.equal(r.method, "email");
  assert.deepEqual(r.targets.map((t) => t.recordId), ["m1"]);
});

test("falls back to name+org only when both present", () => {
  const noLinkNoEmail = { fullName: "Jane Doe", linkedinUrl: "", email: "", company: "Acme" };
  const r = matchRow(noLinkNoEmail, [mentor, investor]);
  assert.equal(r.status, "matched");
  assert.equal(r.method, "name_org");
  assert.deepEqual(r.targets.map((t) => t.recordId), ["m1"]);
});

test("name alone (no org) does not match -> failed", () => {
  const r = matchRow({ fullName: "Jane Doe", linkedinUrl: "", email: "", company: "" }, [mentor]);
  assert.equal(r.status, "failed");
  assert.equal(r.reason, "no_match");
});

test("precedence: linkedin beats email/name even if email/name differ", () => {
  const r = matchRow({ fullName: "Someone Else", linkedinUrl: "linkedin.com/in/bob-smith", email: "nope@x.com", company: "Nowhere" },
    [mentor, investor]);
  assert.equal(r.method, "linkedin");
  assert.deepEqual(r.targets.map((t) => t.recordId), ["i1"]);
});

test("unmatched row fails with no_match", () => {
  const r = matchRow({ fullName: "Nobody", linkedinUrl: "linkedin.com/in/nobody", email: "no@no.com", company: "None" }, [mentor]);
  assert.equal(r.status, "failed");
  assert.equal(r.reason, "no_match");
});
