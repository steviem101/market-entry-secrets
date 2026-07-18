/**
 * Homepage LogoCloud selection logic (MES-162), kept pure so it can be
 * unit-tested (no DOM test tooling in this repo).
 *
 * Records come from the three public org directories, pre-filtered server-side
 * to `is_featured = true` — a flag an admin only sets once the organisation's
 * logo usage rights are confirmed. This module decides which of those records
 * can actually render a logo, dedupes, and enforces the 8–12 strip size the
 * ticket calls for: below MIN_LOGOS the strip doesn't render at all (a sparse
 * strip reads worse than none).
 */
// Relative with extension (not "@/") — unit-tested with node --test, whose
// resolver needs explicit .ts extensions and doesn't understand the Vite alias.
import { extractDomain, getLogoUrlFromDomain, getLogoUrl } from './logoUtils.ts';

export interface FeaturedLogoRecord {
  id: string;
  name: string;
  logo?: string | null;
  website?: string | null;
  domain?: string | null;
  source: 'service_provider' | 'trade_agency' | 'innovation_ecosystem';
}

export interface FeaturedLogo {
  key: string;
  name: string;
  src: string;
}

/** Below this many resolvable logos the strip is withheld entirely. */
export const MIN_LOGOS = 4;
/** Hard cap on strip size. */
export const MAX_LOGOS = 12;

/** CSS display size (px) the strip renders logos at; logoUtils requests 2x. */
export const LOGO_DISPLAY_SIZE = 40;

/**
 * Best renderable image URL for a record: a stored logo asset wins, then a
 * Logo.dev lookup from the canonical domain, then one derived from the website.
 */
export function resolveLogoSrc(record: FeaturedLogoRecord, size: number = LOGO_DISPLAY_SIZE): string | null {
  const stored = record.logo?.trim();
  if (stored && /^https?:\/\//i.test(stored)) return stored;
  return (
    getLogoUrlFromDomain(record.domain, size) ||
    getLogoUrl(record.website, size)
  );
}

/** Dedupe identity: domain when derivable, else normalised name. */
function logoIdentity(record: FeaturedLogoRecord): string {
  const domain =
    (record.domain && extractDomain(record.domain)) ||
    (record.website && extractDomain(record.website));
  return domain || record.name.trim().toLowerCase();
}

/**
 * Select the logos to render. Deterministic (name-sorted) so the strip is
 * stable across visits; returns [] when fewer than `min` resolve so the
 * component can skip rendering with zero layout shift.
 */
export function selectFeaturedLogos(
  records: FeaturedLogoRecord[],
  { min = MIN_LOGOS, max = MAX_LOGOS }: { min?: number; max?: number } = {},
): FeaturedLogo[] {
  const seen = new Set<string>();
  const logos: FeaturedLogo[] = [];

  const sorted = [...records]
    .filter((r) => r.name && r.name.trim().length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const record of sorted) {
    if (logos.length >= max) break;
    const src = resolveLogoSrc(record);
    if (!src) continue;
    const identity = logoIdentity(record);
    if (seen.has(identity)) continue;
    seen.add(identity);
    logos.push({ key: `${record.source}-${record.id}`, name: record.name.trim(), src });
  }

  return logos.length >= min ? logos : [];
}
