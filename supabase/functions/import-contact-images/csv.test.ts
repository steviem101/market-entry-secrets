import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, mapHeaders, buildContactRows } from "./csv.ts";

test("parseCsv: handles quoted fields, embedded commas and CRLF", () => {
  const text = 'a,b,c\r\n"1,2",two,"line\nbreak"\r\n';
  const { headers, rows } = parseCsv(text);
  assert.deepEqual(headers, ["a", "b", "c"]);
  assert.deepEqual(rows, [["1,2", "two", "line\nbreak"]]);
});

test('parseCsv: unescapes doubled quotes', () => {
  const { rows } = parseCsv('h\n"she said ""hi"""');
  assert.deepEqual(rows, [['she said "hi"']]);
});

test("mapHeaders: maps Lemlist-style headers", () => {
  const m = mapHeaders(["firstName", "lastName", "email", "companyName", "linkedinUrl", "picture"]);
  assert.equal(m.first_name, 0);
  assert.equal(m.last_name, 1);
  assert.equal(m.email, 2);
  assert.equal(m.company, 3);
  assert.equal(m.linkedin_url, 4);
  assert.equal(m.image_url, 5);
});

test("mapHeaders: maps PhantomBuster-style headers", () => {
  const m = mapHeaders(["profileUrl", "fullName", "companyName", "imgUrl"]);
  assert.equal(m.linkedin_url, 0);
  assert.equal(m.full_name, 1);
  assert.equal(m.company, 2);
  assert.equal(m.image_url, 3);
});

test("buildContactRows: derives full_name from first/last when absent (Lemlist)", () => {
  const csv = "firstName,lastName,linkedinUrl,picture,companyName\nJane,Doe,https://linkedin.com/in/jane-doe,https://cdn/x.jpg,Acme";
  const { rows } = buildContactRows(csv);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].fullName, "Jane Doe");
  assert.equal(rows[0].linkedinUrl, "https://linkedin.com/in/jane-doe");
  assert.equal(rows[0].imageUrl, "https://cdn/x.jpg");
  assert.equal(rows[0].company, "Acme");
});

test("buildContactRows: uses single name column when present (PhantomBuster)", () => {
  const csv = "fullName,profileUrl,imgUrl\nJane Doe,https://au.linkedin.com/in/jane-doe,https://cdn/y.jpg";
  const { rows } = buildContactRows(csv);
  assert.equal(rows[0].fullName, "Jane Doe");
  assert.equal(rows[0].linkedinUrl, "https://au.linkedin.com/in/jane-doe");
  assert.equal(rows[0].imageUrl, "https://cdn/y.jpg");
});

test("buildContactRows: preserves the raw row for the audit trail", () => {
  const csv = "fullName,imgUrl,note\nJane Doe,https://cdn/y.jpg,vip";
  const { rows } = buildContactRows(csv);
  assert.equal(rows[0].raw.note, "vip");
});
