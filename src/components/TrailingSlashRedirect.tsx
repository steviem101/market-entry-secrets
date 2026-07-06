import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Enforces the no-trailing-slash canonical policy (MES-80 / SEO-04) at the URL
 * level: any path ending in "/" (other than the root) is replaced with its
 * slash-free form, preserving the query string and hash. This complements the
 * per-route canonical tags (which already declare the slash-free URL) so users
 * and JS-rendering crawlers converge on a single URL per page.
 */
export const TrailingSlashRedirect = () => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname.length > 1 && pathname.endsWith("/")) {
      const normalized = pathname.replace(/\/+$/, "");
      navigate(`${normalized}${search}${hash}`, { replace: true });
    }
  }, [pathname, search, hash, navigate]);

  return null;
};
