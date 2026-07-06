/**
 * Unit tests for mentor identity-masking display helpers.
 * Run: `npm test` (node --test, Node 22+ strips types natively).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { mentorDisplayName, mentorInitials } from "./mentorDisplay.ts";

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
