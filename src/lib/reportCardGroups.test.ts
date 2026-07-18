import { test } from "node:test";
import assert from "node:assert/strict";
import { groupSectionCards } from "./reportCardGroups.ts";

test("groupSectionCards: tagged service_providers split into ordered groups", () => {
  const items = [
    { name: "PwC", card_group: "providers" },
    { name: "Austrade", card_group: "agencies" },
    { name: "Stone & Chalk", card_group: "innovation" },
    { name: "EY", card_group: "providers" },
  ];
  const groups = groupSectionCards("service_providers", items);
  assert.ok(groups);
  assert.deepEqual(groups!.map((g) => [g.key, g.items.length]), [
    ["providers", 2], ["agencies", 1], ["innovation", 1],
  ]);
  assert.equal(groups![0].label, "Service Providers");
  assert.equal(groups![1].label, "Government & Trade Bodies");
});

test("groupSectionCards: untagged (legacy) reports fall back to linkLabel heuristic", () => {
  const items = [
    { name: "PwC", linkLabel: "View Profile" },
    { name: "Austrade", linkLabel: "View Organisation" },
    { name: "Stone & Chalk", linkLabel: "View Hub" },
  ];
  const groups = groupSectionCards("service_providers", items);
  assert.deepEqual(groups!.map((g) => g.key), ["providers", "agencies", "innovation"]);
});

test("groupSectionCards: events_resources split (tagged + legacy heuristic)", () => {
  const tagged = groupSectionCards("events_resources", [
    { name: "Fintech Summit", card_group: "events" },
    { name: "Case Study", card_group: "resources" },
  ]);
  assert.deepEqual(tagged!.map((g) => g.key), ["events", "resources"]);

  const legacy = groupSectionCards("events_resources", [
    { name: "Fintech Summit", linkLabel: "View Event", link: "/events/x" },
    { name: "Guide", linkLabel: "Read More", link: "/content/guide" },
  ]);
  assert.deepEqual(legacy!.map((g) => [g.key, g.items.length]), [["events", 1], ["resources", 1]]);
});

test("groupSectionCards: case_studies_guides splits case studies from guides (tagged + heuristic)", () => {
  const tagged = groupSectionCards("case_studies_guides", [
    { name: "Canva's US entry", card_group: "case_studies" },
    { name: "Hiring guide", card_group: "guides" },
  ]);
  assert.deepEqual(tagged!.map((g) => [g.key, g.label, g.items.length]), [
    ["case_studies", "Companies Like You", 1],
    ["guides", "Guides & Resources", 1],
  ]);
  const heuristic = groupSectionCards("case_studies_guides", [
    { name: "Case", link: "/case-studies/canva" },
    { name: "Guide", link: "/content/guide" },
  ]);
  assert.deepEqual(heuristic!.map((g) => [g.key, g.items.length]), [
    ["case_studies", 1],
    ["guides", 1],
  ]);
});

test("groupSectionCards: lead_list separates lemlist contacts from datasets", () => {
  const groups = groupSectionCards("lead_list", [
    { name: "500 Fintech DMs", card_group: "leads" },
    { name: "Jane D.", card_group: "contacts" },
    { name: "Legacy Contact", linkLabel: "Locked", link: "#" },
  ]);
  assert.deepEqual(groups!.map((g) => [g.key, g.items.length]), [["leads", 1], ["contacts", 2]]);
});

test("groupSectionCards: single-type section yields one group (caller renders flat)", () => {
  const groups = groupSectionCards("service_providers", [
    { name: "PwC", card_group: "providers" },
    { name: "EY", card_group: "providers" },
  ]);
  assert.equal(groups!.length, 1);
});

test("groupSectionCards: sections without grouping config return null", () => {
  assert.equal(groupSectionCards("mentor_recommendations", [{ name: "x" }]), null);
  assert.equal(groupSectionCards("executive_summary", []), null);
});

test("groupSectionCards: empty groups are dropped, novel tags get a humanized heading", () => {
  const groups = groupSectionCards("service_providers", [
    { name: "PwC", card_group: "providers" },
    { name: "Weird", card_group: "special_partners" },
  ]);
  // known 'providers' first, novel key appended with title-cased label
  assert.deepEqual(groups!.map((g) => g.key), ["providers", "special_partners"]);
  assert.equal(groups![1].label, "Special Partners");
});
