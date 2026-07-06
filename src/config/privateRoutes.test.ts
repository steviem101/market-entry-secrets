/**
 * Guards against drift between the private-route noindex mechanisms (MES-81).
 * public/_headers (X-Robots-Tag for non-JS crawlers) must list exactly the same
 * path patterns as PRIVATE_ROUTE_HEADER_PATHS. Adding a private route to one but
 * not the other fails here — the exact silent gap the code review flagged.
 *
 * Run: `npm test` (node --test, Node 22+ strips types natively).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { PRIVATE_ROUTE_HEADER_PATHS } from './privateRoutes.ts';

const headersPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../public/_headers',
);

// Parse a Netlify/Lovable-style _headers file: a non-indented line starting with
// "/" opens a path block; indented lines under it are its headers. Return the
// paths whose block declares X-Robots-Tag: ...noindex...
function noindexPathsIn(text: string): string[] {
  const paths: string[] = [];
  let current: string | null = null;
  let hasNoindex = false;
  const flush = () => {
    if (current && hasNoindex) paths.push(current);
  };
  for (const raw of text.split('\n')) {
    if (/^\/\S*/.test(raw)) {
      flush();
      current = raw.trim();
      hasNoindex = false;
    } else if (/x-robots-tag/i.test(raw) && /noindex/i.test(raw)) {
      hasNoindex = true;
    }
  }
  flush();
  return paths;
}

test('public/_headers noindex paths exactly match PRIVATE_ROUTE_HEADER_PATHS', () => {
  const headerPaths = noindexPathsIn(readFileSync(headersPath, 'utf8')).sort();
  const expected = [...PRIVATE_ROUTE_HEADER_PATHS].sort();
  assert.deepEqual(
    headerPaths,
    expected,
    'public/_headers X-Robots-Tag noindex rules have drifted from ' +
      'src/config/privateRoutes.ts. Update BOTH together when adding or ' +
      'removing a private route.',
  );
});
