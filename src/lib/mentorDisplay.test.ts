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
  personaFitLabel,
  personaFitLabels,
  seniorityPhrase,
  suggestAnonymousBio,
  identityLeak,
} from "./mentorDisplay.ts";

const named = {
  name: "Jane Citizen",
  title: "GTM Advisor",
  is_anonymous: false,
};

// Shape of an anonymous row as served by community_members_public: `name` is
// already the masked alias (admin alias → archetype → "Verified Expert"), and
// `title` the masked headline. Neither is ever the real identity.
const anonymous = {
  name: "Financial Services Active Advisor",
  title: "Active Advisor",
  is_anonymous: true,
};

test("named mentor displays real name and initials", () => {
  assert.equal(mentorDisplayName(named), "Jane Citizen");
  assert.equal(mentorInitials(named), "JC");
});

test("anonymous mentor heading uses the masked alias, not the headline", () => {
  assert.equal(mentorDisplayName(anonymous), "Financial Services Active Advisor");
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

test("persona_fit codes map to human 'who they help' labels", () => {
  assert.equal(personaFitLabel("international_entrant"), "International companies entering ANZ");
  assert.equal(personaFitLabel("local_startup"), "Local startups scaling up");
  assert.equal(personaFitLabel("both"), "International entrants & local startups");
  // unknown code degrades to prettified text, never throws
  assert.equal(personaFitLabel("growth_operator"), "Growth Operator");
});

test("personaFitLabels dedupes and handles null", () => {
  assert.deepEqual(personaFitLabels(["local_startup", "local_startup"]), ["Local startups scaling up"]);
  assert.deepEqual(personaFitLabels(null), []);
});

test("seniorityPhrase extracts only the years token, never surrounding words", () => {
  assert.equal(seniorityPhrase("20+ years operating experience in ANZ and international markets."), "20+ years");
  assert.equal(seniorityPhrase("16+ years"), "16+ years");
  // must NOT leak an employer named after the years
  assert.equal(seniorityPhrase("20 years at Tribe Global Ventures"), "20 years");
  assert.equal(seniorityPhrase("Founder since 2015"), null);
  assert.equal(seniorityPhrase(null), null);
});

test("suggestAnonymousBio composes from structured fields, no free text", () => {
  const bio = suggestAnonymousBio({
    archetype: "Active Advisor",
    experience: "20+ years operating experience in ANZ and international markets.",
    sector_tags: ["financial-services"],
    specialties: ["Active Advisor", "Fundraising / Investment", "Cross-border"],
  });
  assert.equal(
    bio,
    "Senior Active Advisor with 20+ years of experience across Financial Services. Specialises in Active Advisor, Fundraising / Investment, Cross-border.",
  );
  // never contains the employer that lived in the free-text experience/description
  assert.ok(!/tribe/i.test(bio));
});

test("suggestAnonymousBio degrades gracefully with sparse data", () => {
  assert.equal(
    suggestAnonymousBio({ archetype: null, experience: null, sector_tags: null, specialties: null }),
    "Senior operator.",
  );
});

test("identityLeak flags the real name or company, passes clean copy", () => {
  // full name and a distinctive company word are caught
  assert.ok(identityLeak("Managing Partner at Tribe Global Ventures", "Aaron Birkby", "Tribe Global Ventures"));
  assert.equal(identityLeak("20 years scaling ANZ fintechs", "Aaron Birkby", "Tribe Global Ventures"), null);
  // surname alone is caught (token-aware, case-insensitive)
  assert.ok(identityLeak("intro to birkby", "Aaron Birkby", null));
  // generic stopword from company name does NOT false-fire
  assert.equal(identityLeak("helps global startups", "Jane Doe", "Global Ventures"), null);
});

test("identityLeak welcomes country names, still catches the distinctive company word", () => {
  // "Singapore" (from "Enterprise Singapore") is a welcomed origin, not a leak
  assert.equal(
    identityLeak("Singapore Trade & Government", "Aik Kanhalykham", "Enterprise Singapore"),
    null,
  );
  // but the distinctive employer word is still caught
  assert.ok(identityLeak("Enterprise advisor for govtech", "Aik Kanhalykham", "Enterprise Singapore"));
  // multi-word country ("New Zealand") is welcomed too
  assert.equal(identityLeak("New Zealand GovTech Advisor", "Jane Roe", "Callaghan New Zealand"), null);
});
