import type { ContentRow } from "../types.ts";

export type FilterReason =
  | "body_too_short"
  | "company_repost"
  | "stale"
  | "zero_engagement_aged"
  | "missing_published_at";

export interface FilterDecision {
  kept: boolean;
  reason: FilterReason | null;
}

const MIN_BODY_LENGTH = 280;
const STALE_AGE_DAYS = 7;
const ZERO_ENGAGEMENT_AGE_DAYS = 2;

function ageInDays(publishedAt: string | null, now: Date): number | null {
  if (!publishedAt) return null;
  const published = new Date(publishedAt);
  if (Number.isNaN(published.getTime())) return null;
  return (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Cheap rules to drop obvious noise before the classifier ever sees it.
 * Keep these conservative: false negatives (keep junk) are fine, the classifier will reject.
 * False positives (drop a real signal) are expensive, so bias towards keeping borderline items.
 */
export function preFilter(row: ContentRow, now: Date = new Date()): FilterDecision {
  const body = row.body_text ?? "";
  if (body.trim().length < MIN_BODY_LENGTH) {
    return { kept: false, reason: "body_too_short" };
  }

  const meta = row.source_metadata ?? {};
  const isRepost = Boolean(meta.is_repost);
  const authorType = meta.author_type;
  if (isRepost && authorType === "company") {
    return { kept: false, reason: "company_repost" };
  }

  const age = ageInDays(row.published_at, now);
  if (age === null) {
    return { kept: false, reason: "missing_published_at" };
  }
  if (age > STALE_AGE_DAYS) {
    return { kept: false, reason: "stale" };
  }

  const totalEngagement = typeof meta.total_engagement === "number"
    ? meta.total_engagement
    : 0;
  if (age > ZERO_ENGAGEMENT_AGE_DAYS && totalEngagement === 0) {
    return { kept: false, reason: "zero_engagement_aged" };
  }

  return { kept: true, reason: null };
}
