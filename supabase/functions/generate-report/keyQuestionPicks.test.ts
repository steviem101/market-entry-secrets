import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildPickCandidates,
  buildPicksPrompt,
  parsePicks,
  buildPickCards,
  MAX_PICKS,
} from "./keyQuestionPicks.ts";

const matches = {
  community_members: [
    { name: "Daniel Grindrod", subtitle: "Co-Founder, LaunchPad", link: "/mentors/experts/daniel-grindrod", linkLabel: "View Profile", website: "https://linkedin.com/in/dg" },
    { name: "Zach Zocher", subtitle: "Head of Community, Techvisa", link: "/mentors/experts/zach-zocher" },
  ],
  service_providers: [
    { name: "NEXTGEN Group", subtitle: "Sydney, NSW", link: "/service-providers/nextgen" },
  ],
  investors: [{ name: "Sam Bird", location: "Sydney, NSW", link: "/investors/sam-bird" }],
  // pools that must never be offered as "who can help" contacts:
  events: [{ name: "Some Summit", link: "/events/x" }],
  leads: [{ name: "Recently Funded Startups", link: "/leads/y" }],
};

test("buildPickCandidates: only helper pools, numbered, capped, labelled", () => {
  const c = buildPickCandidates(matches);
  const names = c.map((x) => x.label.split(" — ")[0]);
  assert.ok(names.includes("Daniel Grindrod"));
  assert.ok(names.includes("NEXTGEN Group"));
  assert.ok(names.includes("Sam Bird"));
  // events / leads are never candidates
  assert.ok(!names.includes("Some Summit"));
  assert.ok(!names.includes("Recently Funded Startups"));
  // refs are 1-based and unique
  assert.deepEqual(c.map((x) => x.ref), c.map((_, i) => i + 1));
});

test("parsePicks: maps refs back to rows, caps at MAX_PICKS, keeps why", () => {
  const c = buildPickCandidates(matches);
  const danRef = c.find((x) => x.label.startsWith("Daniel Grindrod"))!.ref;
  const nextgenRef = c.find((x) => x.label.startsWith("NEXTGEN"))!.ref;
  const picks = parsePicks(
    `{"picks":[{"ref":${danRef},"why":"Leads APAC GTM community — ideal for a Head of Sales search"},{"ref":${nextgenRef},"why":"Sales-as-a-Service to bridge until the hire lands"}]}`,
    c,
  );
  assert.equal(picks.length, 2);
  assert.equal(picks[0].tbl, "community_members");
  assert.match(picks[0].why, /APAC GTM/);
});

test("parsePicks: unknown/duplicate refs dropped; over-cap truncated; fail-open", () => {
  const c = buildPickCandidates(matches);
  const r = c[0].ref;
  const picks = parsePicks(`{"picks":[{"ref":${r},"why":"a"},{"ref":${r},"why":"dup"},{"ref":999,"why":"ghost"},{"ref":${c[1].ref},"why":"b"},{"ref":${c[2].ref},"why":"c"}]}`, c);
  assert.equal(picks.length, MAX_PICKS); // duplicate + unknown removed, then capped
  assert.deepEqual(parsePicks("not json", c), []);
  assert.deepEqual(parsePicks('{"nope":[]}', c), []);
  assert.deepEqual(parsePicks('{"picks":[]}', c), []);
});

test("buildPickCards: why becomes subtitle; link/website preserved; missing rows skipped", () => {
  const cards = buildPickCards(matches, [
    { tbl: "community_members", idx: 0, why: "Runs APAC's GTM community" },
    { tbl: "service_providers", idx: 9, why: "stale index" }, // out of range → skipped
  ]);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].name, "Daniel Grindrod");
  assert.equal(cards[0].subtitle, "Runs APAC's GTM community");
  assert.equal(cards[0].link, "/mentors/experts/daniel-grindrod");
  assert.equal(cards[0].website, "https://linkedin.com/in/dg");
  assert.equal(cards[0].key_question_pick, true);
});

test("buildPickCards: falls back to row subtitle when why is empty", () => {
  const cards = buildPickCards(matches, [{ tbl: "service_providers", idx: 0, why: "" }]);
  assert.equal(cards[0].subtitle, "Sydney, NSW");
});

test("buildPicksPrompt: includes the verbatim question and only populated groups", () => {
  const c = buildPickCandidates(matches);
  const p = buildPicksPrompt("find head of sales", "Floats — Recruitment tech", c);
  assert.match(p, /"find head of sales"/);
  assert.match(p, /### Mentors/);
  assert.match(p, /### Investors/);
  assert.ok(!/### Industry events/.test(p));
});
