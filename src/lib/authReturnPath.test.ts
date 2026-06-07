/**
 * Open-redirect / safety tests for the auth-return-path helpers.
 * Run: `npm test` (node --test, Node 22+ strips types natively).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Inline storage shim so this test doesn't depend on jsdom.
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
  clear: () => store.clear(),
  key: (i: number) => Array.from(store.keys())[i] ?? null,
  get length() { return store.size; },
} as Storage;

const { setAuthReturnPath, consumeAuthReturnPath } = await import('./authReturnPath.ts');

test('accepts a same-origin path and round-trips it', () => {
  store.clear();
  setAuthReturnPath('/report-creator?v2=1');
  assert.equal(consumeAuthReturnPath(), '/report-creator?v2=1');
  // Consumed → cleared.
  assert.equal(consumeAuthReturnPath(), null);
});

test('rejects external URLs (open-redirect safe)', () => {
  store.clear();
  setAuthReturnPath('https://evil.example/phish');
  assert.equal(consumeAuthReturnPath(), null);
  setAuthReturnPath('http://evil.example/phish');
  assert.equal(consumeAuthReturnPath(), null);
});

test('rejects scheme-relative //evil.example', () => {
  store.clear();
  setAuthReturnPath('//evil.example/phish');
  assert.equal(consumeAuthReturnPath(), null);
});

test('rejects empty / nullish / non-slash inputs', () => {
  store.clear();
  setAuthReturnPath(undefined);
  setAuthReturnPath('');
  setAuthReturnPath('report-creator');
  setAuthReturnPath('javascript:alert(1)');
  assert.equal(consumeAuthReturnPath(), null);
});

test('consume returns null when nothing was stored', () => {
  store.clear();
  assert.equal(consumeAuthReturnPath(), null);
});
