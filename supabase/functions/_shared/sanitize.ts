/**
 * Sanitize scraped web content before injecting into AI prompts.
 * Strips common prompt injection patterns and limits length.
 */
export function sanitizeScrapedContent(content: string, maxLength = 12000): string {
  let cleaned = content;

  // Strip HTML tags that might have survived markdown conversion
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // Remove common prompt injection patterns
  cleaned = cleaned.replace(/ignore (all |any )?(previous |prior |above )?(instructions|prompts|rules)/gi, "[removed]");
  cleaned = cleaned.replace(/you are now/gi, "[removed]");
  cleaned = cleaned.replace(/new instructions:/gi, "[removed]");
  cleaned = cleaned.replace(/system:\s/gi, "[removed]");
  cleaned = cleaned.replace(/\[INST\]/gi, "[removed]");
  cleaned = cleaned.replace(/<\|im_start\|>/gi, "[removed]");
  cleaned = cleaned.replace(/<\|im_end\|>/gi, "[removed]");
  cleaned = cleaned.replace(/```system/gi, "```text");

  // Collapse excessive whitespace
  cleaned = cleaned.replace(/\n{4,}/g, "\n\n\n");
  cleaned = cleaned.replace(/ {3,}/g, "  ");

  // Truncate to max length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + "\n[Content truncated]";
  }

  return cleaned.trim();
}
