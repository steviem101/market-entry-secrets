// Shared helpers for MCP tool handlers.
// Callable by arbitrary AI agents — never surface raw PostgREST errors or
// splice untrusted strings into `.or()` filter expressions.

/**
 * Escape characters that carry meaning in PostgREST's `.or()`/`.filter()` DSL
 * (commas, parentheses, periods, backslashes) so a free-text search query
 * cannot inject additional OR-ed filter clauses.
 */
export function sanitizeFilterValue(v: string): string {
  return (v || "").replace(/[\\,().*"'%\r\n]/g, " ").trim();
}

/** Generic MCP error payload — never leaks database error text to callers. */
export const genericSearchError = {
  content: [{ type: "text" as const, text: "search_failed" }],
  isError: true as const,
};
