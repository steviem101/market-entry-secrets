import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveEnvironment, scrubText, scrubEvent } from './errorScrub.ts';

test('resolveEnvironment maps hostnames', () => {
  assert.equal(resolveEnvironment('marketentrysecrets.com'), 'production');
  assert.equal(resolveEnvironment('www.marketentrysecrets.com'), 'production');
  assert.equal(resolveEnvironment('WWW.MarketEntrySecrets.com'), 'production');
  assert.equal(resolveEnvironment('preview-abc.lovable.app'), 'preview');
  assert.equal(resolveEnvironment('localhost'), 'development');
  assert.equal(resolveEnvironment('127.0.0.1'), 'development');
});

test('scrubText masks emails', () => {
  assert.equal(
    scrubText('checkout failed for jane.doe+test@example.com.au today'),
    'checkout failed for [email] today',
  );
});

test('scrubText masks long opaque tokens but keeps normal words', () => {
  const token = 'a'.repeat(40);
  assert.equal(scrubText(`bad token ${token} in url`), 'bad token [token] in url');
  assert.equal(scrubText('ordinary sentence stays intact'), 'ordinary sentence stays intact');
});

test('scrubEvent removes user, headers, cookies and breadcrumb data', () => {
  const event = scrubEvent({
    message: 'error for user@example.com',
    user: { id: 'abc', email: 'user@example.com' },
    request: {
      url: 'https://app/report/shared/' + 'b'.repeat(36),
      headers: { authorization: 'Bearer x' },
      cookies: 'session=1',
    },
    exception: { values: [{ value: 'fetch failed for admin@mes.com' }] },
    breadcrumbs: [{ message: 'clicked mail to someone@x.co', data: { email: 'someone@x.co' } }],
  });

  assert.equal(event.user, undefined);
  assert.equal(event.message, 'error for [email]');
  assert.equal(event.request?.url, 'https://app/report/shared/[token]');
  assert.equal(event.request?.headers, undefined);
  assert.equal(event.request?.cookies, undefined);
  assert.equal(event.exception?.values?.[0].value, 'fetch failed for [email]');
  assert.equal(event.breadcrumbs?.[0].message, 'clicked mail to [email]');
  assert.equal(event.breadcrumbs?.[0].data, undefined);
});

test('scrubEvent tolerates sparse events', () => {
  assert.deepEqual(scrubEvent({}), {});
});
