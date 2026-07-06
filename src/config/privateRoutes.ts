// src/config/privateRoutes.ts
//
// Single source of truth for the private / semi-private routes that must never
// be indexed (MES-81 / SEO-05).
//
// Two mechanisms enforce noindex, and they must stay in lockstep:
//   1. Client-side <NoIndex /> meta — emitted by ProtectedRoute (for gated
//      pages) and per-page for the report/auth/404 routes. Covers JS crawlers.
//   2. public/_headers X-Robots-Tag rules — cover non-JS crawlers (GPTBot,
//      ClaudeBot, CCBot) that never run the React app.
//
// The list below mirrors the path patterns in public/_headers exactly.
// `privateRoutes.test.ts` asserts the two match, so adding a private route
// fails the test until BOTH this list and public/_headers are updated — turning
// what was a silent drift risk into a caught one. When you add a new
// ProtectedRoute page (or report/auth route), add its path pattern here and to
// public/_headers together.

export const PRIVATE_ROUTE_HEADER_PATHS = [
  "/report/*", // /report/shared/:token (private-by-obscurity) + /report/:reportId (owner-only)
  "/my-reports",
  "/dashboard",
  "/member-hub",
  "/bookmarks",
  "/mentor-connections",
  "/admin/*",
  "/auth/*",
  "/reset-password",
] as const;
