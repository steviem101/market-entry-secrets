/**
 * Admin reports console regression guards.
 *
 * Pins the fixes for the prod outage where /admin/reports blanked entirely:
 * 1. The console must never SELECT report_quality directly — `authenticated`
 *    has no table grant on it (only service_role), so a client read 42501s.
 *    Scores go through the admin-only get_admin_report_quality RPC instead.
 * 2. The quality read is best-effort — a failure there must never throw, or
 *    the whole admin list dies with it again.
 * 3. The RPC's RETURNS TABLE columns must stay in lockstep with the
 *    ReportQualityRow interface — drift silently renders every score as a
 *    dash, indistinguishable from "no quality run yet".
 *
 * Same style as reportApi.gating.test.ts: static source assertions, because
 * reportApi imports the Supabase client via the `@/` alias that node --test
 * cannot resolve. Run: `npm test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const src = await readFile(
  fileURLToPath(new URL('./reportApi.ts', import.meta.url)),
  'utf8'
);
const migration = await readFile(
  fileURLToPath(
    new URL(
      '../../../supabase/migrations/20260721140000_admin_report_quality_rpc.sql',
      import.meta.url
    )
  ),
  'utf8'
);

test('admin list reads scores via the RPC, never report_quality directly', () => {
  assert.ok(
    !src.includes(".from('report_quality')"),
    'authenticated has no SELECT grant on report_quality — a direct client read 42501s and blanked the console'
  );
  assert.ok(
    src.includes("rpc('get_admin_report_quality', { p_report_ids: ids })"),
    'scores must come from the admin-only get_admin_report_quality RPC'
  );
});

test('quality read is best-effort — a failure must not blank the console', () => {
  const start = src.indexOf('async fetchAllReportsAdmin');
  const end = src.indexOf('async fetchAdminReport');
  assert.ok(start !== -1 && end > start, 'fetchAllReportsAdmin must exist before fetchAdminReport');
  const fnSrc = src.slice(start, end);
  assert.ok(
    !/throw qErr/.test(fnSrc),
    'a quality-read error must never be thrown — it takes the whole admin list down'
  );
  assert.ok(
    /qualityAvailable = false/.test(fnSrc),
    'a quality-read failure must be surfaced via the qualityAvailable flag'
  );
});

test('RPC RETURNS TABLE columns match ReportQualityRow exactly', () => {
  const returnsTable = migration.match(/RETURNS TABLE \(([^)]+)\)/i);
  assert.ok(returnsTable, 'migration must declare RETURNS TABLE');
  const sqlCols = returnsTable![1]
    .split(',')
    .map((c) => c.trim().split(/\s+/)[0])
    .filter(Boolean)
    .sort();

  const iface = src.match(/export interface ReportQualityRow \{([^}]+)\}/);
  assert.ok(iface, 'ReportQualityRow interface must exist in reportApi.ts');
  const tsFields = iface![1]
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('*') && !l.startsWith('/'))
    .map((l) => l.split(':')[0].replace('?', '').trim())
    .filter(Boolean)
    .sort();

  assert.deepEqual(
    tsFields,
    sqlCols,
    'RPC output columns and ReportQualityRow fields must stay in lockstep'
  );
});
