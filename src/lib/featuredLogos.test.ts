import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  selectFeaturedLogos,
  resolveLogoSrc,
  MIN_LOGOS,
  MAX_LOGOS,
  type FeaturedLogoRecord,
} from './featuredLogos.ts';

const record = (overrides: Partial<FeaturedLogoRecord> & { id: string }): FeaturedLogoRecord => ({
  name: `Org ${overrides.id}`,
  logo: null,
  website: `https://org-${overrides.id}.com.au`,
  domain: null,
  source: 'service_provider',
  ...overrides,
});

describe('resolveLogoSrc', () => {
  it('prefers a stored http(s) logo asset', () => {
    const src = resolveLogoSrc(record({ id: 'a', logo: 'https://cdn.example.com/logo.png' }));
    assert.equal(src, 'https://cdn.example.com/logo.png');
  });

  it('ignores non-URL logo values and falls back to the canonical domain', () => {
    const src = resolveLogoSrc(record({ id: 'a', logo: 'building-icon', domain: 'austrade.gov.au' }));
    assert.ok(src?.includes('img.logo.dev/austrade.gov.au'));
  });

  it('falls back to the website domain when no stored logo or domain exists', () => {
    const src = resolveLogoSrc(record({ id: 'a', website: 'https://www.example.com/path' }));
    assert.ok(src?.includes('img.logo.dev/example.com'));
  });

  it('returns null when nothing resolvable exists', () => {
    assert.equal(resolveLogoSrc(record({ id: 'a', website: null })), null);
  });
});

describe('selectFeaturedLogos', () => {
  it('returns [] below the minimum so a sparse strip never renders', () => {
    const records = Array.from({ length: MIN_LOGOS - 1 }, (_, i) => record({ id: String(i) }));
    assert.deepEqual(selectFeaturedLogos(records), []);
  });

  it('caps the strip at MAX_LOGOS', () => {
    const records = Array.from({ length: MAX_LOGOS + 5 }, (_, i) => record({ id: String(i) }));
    assert.equal(selectFeaturedLogos(records).length, MAX_LOGOS);
  });

  it('dedupes records sharing a domain across sources', () => {
    const records = [
      record({ id: 'a', website: 'https://austrade.gov.au', source: 'trade_agency' }),
      record({ id: 'b', website: 'https://www.austrade.gov.au/foo', source: 'service_provider' }),
      record({ id: 'c' }),
      record({ id: 'd' }),
      record({ id: 'e' }),
    ];
    const logos = selectFeaturedLogos(records, { min: 1 });
    const austrade = logos.filter((l) => l.src.includes('austrade.gov.au'));
    assert.equal(austrade.length, 1);
  });

  it('dedupes by normalised name when no domain is derivable', () => {
    const records = [
      record({ id: 'a', name: 'Acme Advisory', website: null, logo: 'https://cdn.example.com/a.png' }),
      record({ id: 'b', name: '  acme advisory ', website: null, logo: 'https://cdn.example.com/b.png' }),
    ];
    assert.equal(selectFeaturedLogos(records, { min: 1 }).length, 1);
  });

  it('skips records with no resolvable logo and no name', () => {
    const records = [
      record({ id: 'a', website: null }), // unresolvable
      record({ id: 'b', name: '   ' }), // blank name
      record({ id: 'c' }),
    ];
    const logos = selectFeaturedLogos(records, { min: 1 });
    assert.deepEqual(logos.map((l) => l.key), ['service_provider-c']);
  });

  it('is deterministic: name-sorted regardless of input order', () => {
    const records = [
      record({ id: 'z', name: 'Zed Corp' }),
      record({ id: 'a', name: 'Alpha Corp' }),
      record({ id: 'm', name: 'Mid Corp' }),
      record({ id: 'b', name: 'Beta Corp' }),
    ];
    const logos = selectFeaturedLogos(records);
    assert.deepEqual(logos.map((l) => l.name), ['Alpha Corp', 'Beta Corp', 'Mid Corp', 'Zed Corp']);
  });
});
