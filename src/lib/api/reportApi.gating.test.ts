/**
 * MES-38 regression guard: user_reports reads must never pull report_json
 * directly — the SECURITY DEFINER RPCs (get_tier_gated_report /
 * get_shared_report) are the only sanctioned read paths for report content.
 *
 * reportApi imports the Supabase client via the `@/` alias, which node --test
 * cannot resolve, so these are static source assertions rather than runtime
 * mocks. Run: `npm test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const src = await readFile(
  fileURLToPath(new URL('./reportApi.ts', import.meta.url)),
  'utf8'
);

test('fetchMyReports selects list columns only, never *', () => {
  assert.ok(
    src.includes(
      "select('id, status, tier_at_generation, created_at, intake_form_id, user_intake_forms(company_name)')"
    ),
    'fetchMyReports must select exactly the list columns'
  );
  assert.ok(
    !/\.select\(\s*['"`]\*/.test(src),
    'reportApi must not contain any select(*) — it ships gated report_json'
  );
});

test('report_json is never selected directly from user_reports', () => {
  assert.ok(
    !/\.select\([^)]*report_json/.test(src),
    'report_json reads must go through the tier-gated RPC, not a table select'
  );
});
