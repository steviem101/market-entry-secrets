/**
 * Auth-return-path helpers.
 *
 * Stores the path to navigate to after OAuth / magic-link authentication
 * completes via /auth/callback. Used by AuthDialog (writes the desired
 * destination before initiating sign-in) and AuthCallback (reads + clears,
 * then navigates).
 *
 * Open-redirect safe: only same-origin paths beginning with '/' (and not '//')
 * are accepted; everything else falls back to '/'.
 */

const KEY = 'mes_auth_return_path';

/** Persist a desired post-auth destination. No-op for invalid inputs. */
export function setAuthReturnPath(path: string | undefined): void {
  if (!isSafeInternalPath(path)) return;
  try { localStorage.setItem(KEY, path!); } catch { /* ignore */ }
}

/** Read + clear the persisted destination. Returns null if none / unsafe. */
export function consumeAuthReturnPath(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    return isSafeInternalPath(raw) ? raw : null;
  } catch {
    return null;
  }
}

function isSafeInternalPath(p: string | null | undefined): p is string {
  if (!p) return false;
  // Same-origin paths only. Reject scheme-relative and protocol URLs.
  if (!p.startsWith('/')) return false;
  if (p.startsWith('//')) return false;
  return true;
}
