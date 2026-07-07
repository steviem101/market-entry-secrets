/**
 * Turn a slug/enum value into a human-readable label:
 *   "chamber_of_commerce" → "Chamber Of Commerce"
 *   "uk-to-au"            → "Uk To Au"
 * Handles both `-` and `_` separators. Shared by the directory filter pages so
 * the same value renders identically everywhere.
 */
export const humanizeSlug = (value: string): string =>
  value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
