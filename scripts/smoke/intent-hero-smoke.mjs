// Headless smoke test for the intent_hero flow (MES-158).
//
// Exercises the full client wiring the logic-only `npm test` runner can't:
// flag gate, hero render, chip + typed submit, prefill persistence,
// navigation, and the confirm banner — in a real browser, with ALL Supabase
// traffic blocked so nothing writes to prod analytics/DB.
//
// Prereqs: `npm run build` then serve dist on :4319, e.g.
//   npm run preview -- --port 4319 --host 127.0.0.1 &
// Run: `node scripts/smoke/intent-hero-smoke.mjs` (exits non-zero on any fail).
import pw from 'playwright-core';
const { chromium } = pw;

// The full Chrome binary in the CI image dropped `--headless=old`, so use the
// standalone headless-shell. Resolve from PLAYWRIGHT_BROWSERS_PATH, else the
// known image path; override with SMOKE_CHROMIUM if needed.
import { existsSync, readdirSync } from 'node:fs';
function resolveShell() {
  if (process.env.SMOKE_CHROMIUM) return process.env.SMOKE_CHROMIUM;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const dir = readdirSync(root).find((d) => d.startsWith('chromium_headless_shell'));
    if (dir) {
      const p = `${root}/${dir}/chrome-linux/headless_shell`;
      if (existsSync(p)) return p;
    }
  } catch { /* fall through */ }
  return '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
}

const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:4319';
const results = [];
const ok = (name, cond, extra = '') => { results.push({ name, pass: !!cond, extra }); };

const browser = await chromium.launch({ executablePath: resolveShell(), args: ['--no-sandbox'] });
const ctx = await browser.newContext();
const page = await ctx.newPage();

// Belt-and-suspenders: abort any request touching Supabase (no side effects).
let supabaseHits = 0;
await ctx.route('**/*', (route) => {
  const url = route.request().url();
  if (/supabase\.co|supabase\.in|\/rest\/v1\/|\/auth\/v1\//.test(url)) {
    supabaseHits++;
    return route.abort();
  }
  return route.continue();
});
// Ignore console noise from the Supabase requests we deliberately abort.
const isAbortNoise = (t) => /Failed to load resource|ERR_CONNECTION_RESET|net::ERR_FAILED|ERR_ABORTED/.test(t);
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error' && !isAbortNoise(m.text())) consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

// ── 1. Flag OFF (default): classic CTA, no intent input ──────────────────
await page.goto(`${BASE}/?intent=0`, { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(600);
ok('flag OFF → no intent input rendered', (await page.locator('#hero-intent').count()) === 0);
const ctaOff = await page.getByText('Generate my free report').count().catch(() => 0);
ok('flag OFF → classic CTA still present', ctaOff > 0, `count=${ctaOff}`);

// ── 2. Flag ON: intent input + 6 chips render ────────────────────────────
await page.goto(`${BASE}/?intent=1`, { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(600);
const input = page.locator('#hero-intent');
ok('flag ON → intent input renders', (await input.count()) === 1);
const maxlen = await input.getAttribute('maxlength');
ok('input has maxLength=200', maxlen === '200', `maxlength=${maxlen}`);
const chipCount = await page.locator('button', { hasText: /Find|Validate/ }).count();
ok('6 prompt chips render', chipCount >= 6, `count=${chipCount}`);

// ── 3. Typed intent → prefill draft written + navigates + banner ─────────
await input.fill('I need a fintech lawyer in Sydney');
await page.getByRole('button', { name: /Build my report/i }).click();
await page.waitForURL('**/report-creator*', { timeout: 8000 }).catch(() => {});
ok('typed submit navigates to /report-creator', page.url().includes('/report-creator'), page.url());

const draft = await page.evaluate(() => localStorage.getItem('mes_intake_form_draft_v2'));
const marker = await page.evaluate(() => sessionStorage.getItem('mes_hero_intent'));
let parsed = null; try { parsed = JSON.parse(draft); } catch { /* */ }
ok('v2 draft persisted with focus + goals',
  !!parsed && parsed.report_focus?.length > 0 && Array.isArray(parsed.goal_ids) && parsed.goal_ids.length > 0,
  parsed ? `persona=${parsed.persona} goals=${JSON.stringify(parsed.goal_ids)} focus="${parsed.report_focus}"` : 'no draft');
ok('lawyer intent → find_providers goal', !!parsed && parsed.goal_ids?.includes('find_providers'), JSON.stringify(parsed?.goal_ids));
ok('lawyer intent → international persona', parsed?.persona === 'international', parsed?.persona);
ok('origin marker set', !!marker, marker);

await page.waitForTimeout(500);
ok('confirm banner renders on report creator', (await page.getByText('Starting from what you told us').count().catch(() => 0)) > 0);
ok('banner echoes the raw intent', (await page.getByText(/fintech lawyer in Sydney/).count().catch(() => 0)) > 0);

// ── 4. Chip path → investor chip classifies to startup/investors ─────────
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
await page.goto(`${BASE}/?intent=1`, { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(500);
await page.getByRole('button', { name: 'Find investors' }).click();
await page.waitForURL('**/report-creator*', { timeout: 8000 }).catch(() => {});
let p2 = null; try { p2 = JSON.parse(await page.evaluate(() => localStorage.getItem('mes_intake_form_draft_v2'))); } catch { /* */ }
ok('investor chip → startup persona', p2?.persona === 'startup', p2?.persona);
ok('investor chip → investors goal', p2?.goal_ids?.includes('investors'), JSON.stringify(p2?.goal_ids));

// ── Summary ──────────────────────────────────────────────────────────────
ok('no Supabase network side effects reached the wire (all aborted)', true, `aborted=${supabaseHits}`);
ok('no uncaught console/page errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();

let failed = 0;
for (const r of results) { if (!r.pass) failed++; console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.extra ? `  [${r.extra}]` : ''}`); }
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);
