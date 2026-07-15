/**
 * Returns `url` only when it carries a safe, navigable scheme (http/https/mailto),
 * otherwise `undefined`. Guards against `javascript:`, `data:`, `vbscript:` and
 * other executable-scheme URLs that could reach an anchor `href` from stored data
 * (e.g. `case_study_sources.url`, company/founder links). React does not block
 * these schemes itself, so this is defence-in-depth for links whose target comes
 * from the database rather than DOMPurify-sanitised body HTML.
 */
export function safeExternalHref(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  try {
    const { protocol } = new URL(trimmed);
    return protocol === "http:" || protocol === "https:" || protocol === "mailto:"
      ? trimmed
      : undefined;
  } catch {
    // Not an absolute URL — these fields are expected to hold absolute links, so
    // reject anything we can't parse rather than emit a questionable href.
    return undefined;
  }
}
