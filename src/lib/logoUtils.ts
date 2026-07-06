// Publishable Logo.dev key (pk_) — safe to ship client-side.
const LOGO_DEV_TOKEN = "pk_L3JbJjCeT0-mUdhpPlS6SA";

// Logo.dev serves rasters at exactly the requested `size`, so a 1x request
// looks blurry on high-DPR screens. Callers pass the CSS display size; we
// request 2x pixels (capped at Logo.dev's 512px max).
const DPR_MULTIPLIER = 2;
const MAX_REQUEST_SIZE = 512;

/**
 * Extracts the bare domain from a URL string.
 * Handles full URLs (https://www.example.com/path), bare domains (example.com),
 * and edge cases like missing protocol or trailing slashes.
 */
export function extractDomain(url: string): string | null {
  if (!url || !url.trim()) return null;

  let hostname = url.trim();

  // Add protocol if missing so URL constructor can parse it
  if (!/^https?:\/\//i.test(hostname)) {
    hostname = `https://${hostname}`;
  }

  try {
    const parsed = new URL(hostname);
    let domain = parsed.hostname.toLowerCase();
    // Strip leading www.
    if (domain.startsWith("www.")) {
      domain = domain.slice(4);
    }
    return domain || null;
  } catch {
    return null;
  }
}

/**
 * Builds a Logo.dev image URL for a given domain.
 * `size` is the CSS display size in px; the image is requested at 2x for DPR.
 */
export function getLogoDevUrl(domain: string, size: number = 64): string {
  const requestSize = Math.min(size * DPR_MULTIPLIER, MAX_REQUEST_SIZE);
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${requestSize}&format=png`;
}

/**
 * Given a website URL, returns the Logo.dev image URL or null if no domain can be extracted.
 */
export function getLogoUrl(websiteUrl: string | null | undefined, size: number = 64): string | null {
  if (!websiteUrl) return null;
  const domain = extractDomain(websiteUrl);
  if (!domain) return null;
  return getLogoDevUrl(domain, size);
}

/**
 * Builds a Logo.dev URL directly from a bare-domain string (e.g. "austrade.gov.au").
 * Tolerates accidental schemes and "www." prefixes by passing through extractDomain.
 */
export function getLogoUrlFromDomain(domain: string | null | undefined, size: number = 64): string | null {
  if (!domain || !domain.trim()) return null;
  const normalized = extractDomain(domain) || domain.trim().replace(/^www\./i, "");
  if (!normalized) return null;
  return getLogoDevUrl(normalized, size);
}

/**
 * Resolves the best Logo.dev URL for an organisation record. Prefers the
 * canonical `domain` column (populated by the agencies cleanup) over derived
 * domains from the legacy `website_url` / `website` fields.
 */
export function getOrgLogoUrl(
  record: {
    domain?: string | null;
    website_url?: string | null;
    website?: string | null;
  },
  size: number = 64,
): string | null {
  return (
    getLogoUrlFromDomain(record.domain, size) ||
    getLogoUrl(record.website_url ?? record.website, size)
  );
}

/**
 * Builds a synthetic https:// URL from a bare domain, suitable for passing to
 * components like CompanyLogo that take a websiteUrl prop. Returns null when
 * the input is empty so callers can pass the result straight through.
 */
export function domainToWebsite(domain: string | null | undefined): string | null {
  if (!domain || !domain.trim()) return null;
  return `https://${domain.trim()}`;
}
