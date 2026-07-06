/**
 * Clean a link's *visible label* when it is a raw URL (Stage 5 render bug B1).
 *
 * GitHub-flavored-markdown autolinking turns a bare URL in the AI's section
 * prose into `<a href="https://www.example.com/about">https://www.example.com/about</a>`
 * — the visible text is the full URL, which reads as noise in a report. This
 * shortens a URL-looking label to its host (minus `www.`), optionally keeping a
 * short first path segment for context, while leaving genuine text labels
 * (`[Austrade](…)`) untouched.
 *
 * Pure module — no DOM, no I/O — unit-tested under `node --test`.
 */

// Only a label that carries an explicit scheme or `www.` prefix is treated as a
// raw URL to shorten. This is deliberately strict: an intentional link whose
// visible text is a bare domain-like token — "Node.js", "React.dev", "Vue.js" —
// must NOT be rewritten to "node.js". A genuine GFM autolink of a bare URL always
// renders the scheme (http/https) or the www. prefix, so this still catches the
// noise B1 is about while leaving product/library names as the author wrote them.
const RAW_URL_RE = /^(?:https?:\/\/|www\.)\S+$/i;

/**
 * If `label` is a raw URL (scheme- or www.-prefixed), return a compact host-based
 * label (e.g. "example.com" or "example.com/reports"); otherwise return it unchanged.
 */
export function cleanUrlLabel(label: string): string {
  const raw = (label || "").trim();
  if (!raw || !RAW_URL_RE.test(raw)) return label;

  // Normalise to something the URL parser accepts.
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let host: string;
  let path: string;
  try {
    const u = new URL(withScheme);
    host = u.hostname.replace(/^www\./i, "");
    path = u.pathname.replace(/\/+$/, ""); // drop trailing slash
  } catch {
    return label; // unparseable → leave the original text alone
  }
  if (!host) return label;

  // Keep the first path segment when it's short and word-like, so a deep link
  // still carries a hint of where it points ("example.com/research"). Skip long,
  // slug-y, or file-ish segments — the host alone is cleaner than a 40-char slug.
  const firstSeg = path.split("/").filter(Boolean)[0];
  const isWordLike = firstSeg && firstSeg.length <= 15 && /^[a-z0-9-]+$/i.test(firstSeg) && !firstSeg.includes(".");
  const isNumericId = firstSeg && /^\d+$/.test(firstSeg); // dates / ids carry no meaning as a label
  if (isWordLike && !isNumericId) {
    return `${host}/${firstSeg}`;
  }
  return host;
}
