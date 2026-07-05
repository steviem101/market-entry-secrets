import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRerankItems, buildRerankPrompt, parseRerankVerdicts, applyRerankVerdicts } from "./matchRerank.ts";

const slate = () => ({
  service_providers: [
    { name: "PwC Australia", location: "Melbourne, VIC", match_reasons: ["service/skill fit ×2 (+4)"] },
    { name: "AmCham Australia", location: "Sydney, NSW" },
    { name: "EY Australia", location: "Sydney, NSW" },
    { name: "Standard Ledger", location: "Melbourne, VIC" },
  ],
  innovation_ecosystem: [
    { name: "FinTech Australia", location: "Sydney" },
    { name: "Insurtech Australia", location: "Sydney" },
    { name: "Haymarket HQ", location: "Sydney" },
  ],
  leads: [{ title: "500 Australian FinTech Decision Makers" }, { title: "Legal Technology Buyers" }],
  lemlist_contacts: [{ name: "Obfuscated N." }], // excluded surface — must pass through untouched
});

test("buildRerankItems: flattens card surfaces with stable refs, skips unnamed, excludes lemlist", () => {
  const items = buildRerankItems(slate());
  assert.equal(items.length, 9); // 4 + 3 + 2, lemlist excluded
  assert.deepEqual(items.map((i) => i.ref), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.ok(items.every((i) => i.tbl !== "lemlist_contacts"));
  assert.ok(items[0].label.startsWith("PwC Australia"));
  // unnamed rows are never submitted
  const withBlank = { service_providers: [{ name: "" }, { name: "Real Co" }] };
  assert.equal(buildRerankItems(withBlank).length, 1);
});

test("buildRerankPrompt: contains company context, headings, numbered items, JSON contract", () => {
  const items = buildRerankItems(slate());
  const p = buildRerankPrompt("CreditLogic — Irish fintech entering Melbourne", items);
  assert.ok(p.includes("CreditLogic — Irish fintech"));
  assert.ok(p.includes("Service providers"));
  assert.ok(p.includes("2. AmCham Australia"));
  assert.ok(p.includes('{"drop": []}'));
});

test("parseRerankVerdicts: clean, fenced, and prose-wrapped JSON all parse; bad refs ignored", () => {
  const clean = parseRerankVerdicts('{"drop": [{"ref": 2, "why": "US chamber, Irish client"}]}', 9);
  assert.ok(clean.parsed);
  assert.equal(clean.dropRefs.get(2), "US chamber, Irish client");

  const fenced = parseRerankVerdicts('```json\n{"drop": [{"ref": 6, "why": "insurtech, not credit"}]}\n```', 9);
  assert.ok(fenced.parsed);
  assert.ok(fenced.dropRefs.has(6));

  const wrapped = parseRerankVerdicts('Sure! Here is the result: {"drop": [{"ref": 9, "why": "legal, not fintech"}]} Hope that helps.', 9);
  assert.ok(wrapped.parsed);
  assert.ok(wrapped.dropRefs.has(9));

  const badRefs = parseRerankVerdicts('{"drop": [{"ref": 0}, {"ref": 99}, {"ref": "x"}, {"ref": 3}]}', 9);
  assert.ok(badRefs.parsed);
  assert.deepEqual([...badRefs.dropRefs.keys()], [3]);
});

test("parseRerankVerdicts: garbage / empty / wrong shape → fail-open (parsed:false, no drops)", () => {
  for (const bad of ["", "no json here", '{"keep": [1]}', '{"drop": "all"}', "[1,2,3]"]) {
    const v = parseRerankVerdicts(bad, 9);
    assert.equal(v.parsed === true && v.dropRefs.size > 0, false, `input ${JSON.stringify(bad)} must not drop`);
  }
});

test("applyRerankVerdicts: drops flagged rows, leaves other tables + excluded surfaces untouched", () => {
  const m = slate();
  const items = buildRerankItems(m);
  const v = parseRerankVerdicts('{"drop": [{"ref": 2, "why": "US chamber"}, {"ref": 9, "why": "legal not fintech"}]}', items.length);
  const res = applyRerankVerdicts(m, items, v);
  assert.deepEqual(res.matches.service_providers.map((r: { name?: string }) => r.name), ["PwC Australia", "EY Australia", "Standard Ledger"]);
  assert.deepEqual(res.matches.leads.map((r: { title?: string }) => r.title), ["500 Australian FinTech Decision Makers"]);
  assert.equal(res.matches.innovation_ecosystem.length, 3);      // untouched pool
  assert.equal(res.matches.lemlist_contacts.length, 1);          // excluded surface untouched
  assert.deepEqual(res.droppedByTable, { service_providers: 1, leads: 1 });
  assert.ok(res.droppedNames.includes("AmCham Australia"));
  // no mutation of input
  assert.equal(m.service_providers.length, 4);
});

test("applyRerankVerdicts: floor guard — never below minKeep, best-ranked flagged rows restored", () => {
  const m = slate();
  const items = buildRerankItems(m);
  // Flag ALL 4 providers (refs 1-4). With minKeep 3, the 3 best-ranked (1,2,3) must be restored.
  const v = parseRerankVerdicts('{"drop": [{"ref":1},{"ref":2},{"ref":3},{"ref":4}]}', items.length);
  const res = applyRerankVerdicts(m, items, v, 3);
  assert.equal(res.matches.service_providers.length, 3);
  assert.deepEqual(res.matches.service_providers.map((r: { name?: string }) => r.name), ["PwC Australia", "AmCham Australia", "EY Australia"]);
  assert.equal(res.droppedByTable.service_providers, 1);
});

test("applyRerankVerdicts: unparsed verdicts are a strict no-op", () => {
  const m = slate();
  const items = buildRerankItems(m);
  const res = applyRerankVerdicts(m, items, { dropRefs: new Map([[2, "x"]]), parsed: false });
  assert.equal(res.matches.service_providers.length, 4);
  assert.deepEqual(res.droppedByTable, {});
});
