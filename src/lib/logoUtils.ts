const LOGO_DEV_TOKEN = "pk_ZDgrKooYR4myUNCcckiOsg";

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
 */
export function getLogoDevUrl(domain: string, size: number = 64): string {
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${size}&format=png&fallback=404`;
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
