import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyLinkedIn } from "./linkedinLabel.ts";

test("classifyLinkedIn: personal /in/ and /pub/ profiles", () => {
  assert.deepEqual(classifyLinkedIn("https://www.linkedin.com/in/jane-doe"), {
    isLinkedIn: true, kind: "personal", label: "LinkedIn Profile",
  });
  assert.equal(classifyLinkedIn("https://linkedin.com/in/john/").kind, "personal");
  assert.equal(classifyLinkedIn("https://uk.linkedin.com/pub/jane/1/2/3").kind, "personal");
});

test("classifyLinkedIn: org company/school/showcase pages", () => {
  assert.deepEqual(classifyLinkedIn("https://www.linkedin.com/company/acme-corp"), {
    isLinkedIn: true, kind: "org", label: "LinkedIn Page",
  });
  assert.equal(classifyLinkedIn("https://linkedin.com/school/mit").kind, "org");
  assert.equal(classifyLinkedIn("https://linkedin.com/showcase/acme-cloud").kind, "org");
});

test("classifyLinkedIn: bare/unknown linkedin URL falls back to generic", () => {
  assert.deepEqual(classifyLinkedIn("https://www.linkedin.com/feed/"), {
    isLinkedIn: true, kind: "generic", label: "LinkedIn",
  });
  assert.equal(classifyLinkedIn("https://linkedin.com").isLinkedIn, false); // no trailing slash+path → host regex needs `/`
});

test("classifyLinkedIn: non-LinkedIn URLs are Website, not misclassified", () => {
  assert.deepEqual(classifyLinkedIn("https://acme.com/team"), {
    isLinkedIn: false, kind: null, label: "Website",
  });
  // substring host must not match
  assert.equal(classifyLinkedIn("https://notlinkedin.com/in/x").isLinkedIn, false);
  assert.equal(classifyLinkedIn("https://fakelinkedin.com.evil.com/company/x").isLinkedIn, false);
});

test("classifyLinkedIn: empty/nullish → Website", () => {
  for (const v of ["", "   ", null, undefined]) {
    assert.equal(classifyLinkedIn(v).isLinkedIn, false);
    assert.equal(classifyLinkedIn(v).label, "Website");
  }
});
