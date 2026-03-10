// supabase/functions/_shared/url.ts

/**
 * Validates a URL is safe to fetch (not targeting internal/private networks).
 * Prevents SSRF (Server-Side Request Forgery) attacks.
 */
export function isPrivateOrReservedUrl(rawUrl: string): boolean {
  try {
    let urlStr = rawUrl.trim();
    if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
      urlStr = `https://${urlStr}`;
    }
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    // Block localhost and loopback
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".localhost")
    ) {
      return true;
    }

    // Block private IP ranges (RFC 1918) and link-local
    const privatePatterns = [
      /^10\./,                              // 10.0.0.0/8
      /^172\.(1[6-9]|2\d|3[01])\./,        // 172.16.0.0/12
      /^192\.168\./,                        // 192.168.0.0/16
      /^169\.254\./,                        // Link-local (AWS metadata)
      /^0\./,                               // 0.0.0.0/8
      /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // 100.64.0.0/10 (CGNAT)
    ];

    for (const pattern of privatePatterns) {
      if (pattern.test(hostname)) return true;
    }

    // Block IPv6 private/link-local ranges
    if (
      hostname.startsWith("fe80:") ||       // Link-local
      hostname.startsWith("fc") ||          // Unique local (fc00::/7)
      hostname.startsWith("fd") ||          // Unique local (fc00::/7)
      hostname.startsWith("[fe80:") ||      // Bracketed link-local
      hostname.startsWith("[fc") ||
      hostname.startsWith("[fd") ||
      hostname.startsWith("[::1]") ||       // Loopback bracketed
      hostname === "[::1]"
    ) {
      return true;
    }

    // Block cloud metadata endpoints
    if (
      hostname === "metadata.google.internal" ||
      hostname === "metadata.goog" ||
      hostname === "169.254.169.254"        // AWS/GCP metadata (also caught by regex above)
    ) return true;

    // Block non-http(s) schemes
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return true;

    return false;
  } catch {
    // If URL parsing fails, treat as unsafe
    return true;
  }
}

/**
 * Formats and validates a URL for external scraping.
 * Returns the formatted URL or throws if the URL is private/invalid.
 */
export function validateExternalUrl(rawUrl: string): string {
  let formattedUrl = rawUrl.trim();
  if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
    formattedUrl = `https://${formattedUrl}`;
  }

  if (isPrivateOrReservedUrl(formattedUrl)) {
    throw new Error("URL targets a private or reserved network address");
  }

  return formattedUrl;
}
