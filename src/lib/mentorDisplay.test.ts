/**
 * Unit tests for mentor identity-masking display helpers.
 * Run: `npm test` (node --test, Node 22+ strips types natively).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  mentorDisplayName,
  mentorInitials,
  countryLabel,
  corridorLabel,
  sectorTagLabel,
  mentorLocationLabel,
  suggestAnonymousAlias,
} from "./mentorDisplay.ts";

const named = {
  name: "Jane Citizen",
  title: "GTM Advisor",
  is_anonymous: false,
};

// Shape of an anonymous row as served by community_members_public: name is
// already the alias/archetype fallback, title the masked headline.
const anonymous = {
  name: "Verified Expert",
  title: "Fintech Scale-up Operator",
  is_anonymous: true,
};

test("named mentor displays real name and initials", () => {
  assert.equal(mentorDisplayName(named), "Jane Citizen");
  assert.equal(mentorInitials(named), "JC");
});

test("anonymous mentor displays masked headline, never a name", () => {
  assert.equal(mentorDisplayName(anonymous), "Fintech Scale-up Operator");
});

test("anonymous mentor yields no initials, even from masked fields", () => {
  assert.equal(mentorInitials(anonymous), null);
});

test("initials cap at two characters and uppercase", () => {
  assert.equal(
    mentorInitials({ ...named, name: "mary anne o'brien smith" }),
    "MA",
  );
});

test("country codes render as flag + label, unknown values pass through", () => {
  assert.equal(countryLabel("uk"), "🇬🇧 UK");
  assert.equal(countryLabel("new-zealand"), "🇳🇿 New Zealand"); // hyphen variant in prod data
  assert.equal(countryLabel("hong_kong"), "🇭🇰 Hong Kong");
  assert.equal(countryLabel("VIC"), "VIC");
  assert.equal(countryLabel(null), null);
});

test("market corridors render as from → to", () => {
  assert.equal(corridorLabel("uk-to-australia"), "🇬🇧 UK → 🇦🇺 Australia");
  assert.equal(corridorLabel("other_asia-to-new_zealand"), "🌏 Asia → 🇳🇿 New Zealand");
  assert.equal(corridorLabel("not-a-corridor"), null);
});

test("sector tags are humanised", () => {
  assert.equal(sectorTagLabel("financial-services"), "Financial Services");
});

test("anonymous location is prettified, named location untouched", () => {
  assert.equal(mentorLocationLabel({ location: "uk", is_anonymous: true }), "🇬🇧 UK");
  assert.equal(
    mentorLocationLabel({ location: "Sydney, NSW, Australia", is_anonymous: false }),
    "Sydney, NSW, Australia",
  );
});

test("alias suggestion prefers origin + archetype, degrades safely", () => {
  assert.equal(
    suggestAnonymousAlias({ archetype: "International Founder", origin_country: "uk", sector_tags: ["fintech"] }),
    "UK International Founder",
  );
  assert.equal(
    suggestAnonymousAlias({ archetype: "Active Advisor", origin_country: null, sector_tags: ["financial-services"] }),
    "Financial Services Active Advisor",
  );
  assert.equal(
    suggestAnonymousAlias({ archetype: null, origin_country: null, sector_tags: null }),
    "Verified Expert",
  );
});
