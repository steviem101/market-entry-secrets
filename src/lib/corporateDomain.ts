/**
 * Derive a company website from a user's email domain — used to prefill the
 * report-creator's `website_url` for signed-in users, so their intake (and the
 * `scrape-company` enrichment behind it) starts pre-populated.
 *
 * Returns the bare domain (e.g. "acmecorp.com") for corporate addresses, or
 * null for free/consumer providers (gmail, outlook, …) and malformed input.
 * The intake schema prepends https:// and validates the URL, so a bare domain
 * is the right shape to hand back.
 */

// Consumer / free-mail providers whose domain is NOT the user's company site.
const FREE_EMAIL_DOMAINS = new Set<string>([
  'gmail.com', 'googlemail.com',
  'outlook.com', 'outlook.com.au', 'hotmail.com', 'hotmail.co.uk', 'hotmail.com.au',
  'live.com', 'live.com.au', 'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.com.au', 'ymail.com', 'rocketmail.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'protonmail.com', 'proton.me', 'pm.me',
  'gmx.com', 'gmx.net', 'mail.com', 'zoho.com', 'yandex.com', 'yandex.ru',
  'fastmail.com', 'hey.com', 'tutanota.com', 'tuta.io',
  'qq.com', '163.com', '126.com', 'sina.com',
  'bigpond.com', 'bigpond.net.au', 'optusnet.com.au', 'iinet.net.au', 'tpg.com.au',
]);

/**
 * @returns the corporate domain (lowercased, no protocol), or null when the
 *   address is free-mail, malformed, or missing.
 */
export function corporateWebsiteFromEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.lastIndexOf('@');
  if (at <= 0 || at === email.length - 1) return null;

  const domain = email.slice(at + 1).trim().toLowerCase();
  // Must look like a real hostname: at least two non-empty dot-separated labels.
  if (!domain.includes('.')) return null;
  const labels = domain.split('.');
  if (labels.length < 2 || labels.some((l) => l.length === 0)) return null;

  if (FREE_EMAIL_DOMAINS.has(domain)) return null;

  return domain;
}
