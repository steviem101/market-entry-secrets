/**
 * Tests for the directory_submissions Slack card helpers. Run: `npm test`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildSubmissionEditorUrl,
  curateSubmissionFields,
  projectRefFromUrl,
} from "./submissionCard.ts";

test("curateSubmissionFields: picks relevant non-empty fields in spec order", () => {
  const fields = curateSubmissionFields({
    name: "Trendy Tan",
    email: "trendy.tan@argusmedia.com",
    organization: "Argus Media",
    eventTitle: "Argus Australia Critical Minerals Forum 2026",
    eventDate: "2026-08-19",
    eventCategory: "seminar",
    industry: "",
    website: "https://view.argusmedia.com/aus-critical-minerals-forum.html",
  });
  const labels = fields.map((f) => f.label);
  assert.deepEqual(labels, ["Contact", "Organisation", "Title", "Event date", "Category", "Website"]);
  // empty fields (industry) are dropped
  assert.ok(!labels.includes("Industry"));
  assert.equal(fields[0].value, "Trendy Tan");
});

test("curateSubmissionFields: collapses aliased keys to a single label", () => {
  const fields = curateSubmissionFields({ eventTitle: "An Event", guideTitle: "A Guide" });
  const titles = fields.filter((f) => f.label === "Title");
  assert.equal(titles.length, 1);
  assert.equal(titles[0].value, "An Event"); // eventTitle wins (earlier in spec)
});

test("curateSubmissionFields: truncates long values", () => {
  const long = "x".repeat(500);
  const [field] = curateSubmissionFields({ description: long });
  assert.equal(field.label, "Details");
  assert.ok(field.value.length <= 280);
  assert.ok(field.value.endsWith("…"));
});

test("curateSubmissionFields: joins array values and caps field count", () => {
  const [arr] = curateSubmissionFields({ industry: ["Mining", "Energy"] });
  assert.equal(arr.value, "Mining, Energy");

  const many = curateSubmissionFields({
    name: "A", organization: "B", eventTitle: "C", eventDate: "D", eventTime: "E",
    eventCategory: "F", location: "G", targetMarket: "H", industry: "I", website: "J",
  });
  assert.ok(many.length <= 8);
});

test("curateSubmissionFields: handles null/empty form_data", () => {
  assert.deepEqual(curateSubmissionFields(null), []);
  assert.deepEqual(curateSubmissionFields({}), []);
});

test("buildSubmissionEditorUrl: builds a row-filtered table editor link", () => {
  const url = buildSubmissionEditorUrl("xhziwveaiuhzdoutpgrh", "20063", "38d073a3-18f4-4db8-b121-8177d10d2e00");
  assert.equal(
    url,
    "https://supabase.com/dashboard/project/xhziwveaiuhzdoutpgrh/editor/20063?schema=public&filter=id%3Aeq%3A38d073a3-18f4-4db8-b121-8177d10d2e00",
  );
});

test("buildSubmissionEditorUrl: returns empty string when inputs missing", () => {
  assert.equal(buildSubmissionEditorUrl("", "20063", "abc"), "");
  assert.equal(buildSubmissionEditorUrl("ref", "20063", null), "");
  assert.equal(buildSubmissionEditorUrl("ref", "", "abc"), "");
});

test("projectRefFromUrl: extracts the ref from a Supabase project URL", () => {
  assert.equal(projectRefFromUrl("https://xhziwveaiuhzdoutpgrh.supabase.co"), "xhziwveaiuhzdoutpgrh");
  assert.equal(projectRefFromUrl(undefined), "");
  assert.equal(projectRefFromUrl(""), "");
});
