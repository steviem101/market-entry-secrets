import type { ContentRow } from "../types.ts";

export interface ApifyLinkedInPost {
  type: "post";
  id?: string;
  entityId?: string;
  linkedinUrl: string;
  content: string;
  author: {
    id: string;
    publicIdentifier: string | null;
    universalName: string | null;
    type: "profile" | "company";
    name: string;
    linkedinUrl: string;
    info: string | null;
    avatar: { url: string } | null;
    urn: string;
  };
  postedAt: {
    timestamp: number;
    date: string;
    postedAgoShort: string;
    postedAgoText: string;
  };
  repostedBy?: {
    name: string;
    publicIdentifier: string;
    linkedinUrl: string;
  };
  repostedAt?: { timestamp: number; date: string };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    reactions: Array<{ type: string; count: number }>;
  };
  contentAttributes?: Array<{
    type: "COMPANY_NAME" | "PROFILE_MENTION" | "TEXT_LINK";
    start: number;
    length: number;
    company?: { id: string; name: string; linkedinUrl: string };
    profile?: {
      publicIdentifier: string;
      firstName: string;
      lastName: string;
      linkedinUrl: string;
    };
  }>;
  postImages?: Array<{ url: string; width: number; height: number }>;
  postVideo?: { thumbnailUrl: string; videoUrl: string };
  document?: { title: string; totalPageCount: number };
  article?: { title: string; link: string; subtitle: string };
  query: {
    targetUrl: string;
    sortBy: string;
    page: string;
    sessionId: string;
  };
}

/**
 * Drop all query params from a LinkedIn URL so dedup and logs stay clean.
 * LinkedIn appends tracking params like ?miniProfileUrn=... that are noise.
 */
function stripQuery(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.search = "";
    u.hash = "";
    return u.toString();
  } catch {
    return url;
  }
}

export function normaliseLinkedInPost(
  post: ApifyLinkedInPost,
  apifyRunId: string,
): ContentRow {
  const sourceId = post.id ?? post.entityId;
  if (!sourceId) {
    throw new Error("LinkedIn post missing both id and entityId");
  }

  const likes = post.engagement?.likes ?? 0;
  const comments = post.engagement?.comments ?? 0;
  const shares = post.engagement?.shares ?? 0;
  const totalEngagement = likes + comments + shares;

  const mentionedProfiles = (post.contentAttributes ?? [])
    .filter((a) => a.type === "PROFILE_MENTION")
    .map((a) => a.profile?.publicIdentifier)
    .filter((v): v is string => Boolean(v));

  const mentionedCompanies = (post.contentAttributes ?? [])
    .filter((a) => a.type === "COMPANY_NAME")
    .map((a) => a.company?.name)
    .filter((v): v is string => Boolean(v));

  const repostedBy = post.repostedBy
    ? {
        name: post.repostedBy.name,
        handle: post.repostedBy.publicIdentifier,
      }
    : null;

  return {
    source_type: "linkedin_post",
    source_id: sourceId,
    source_url: stripQuery(post.linkedinUrl),
    author_name: post.author?.name ?? null,
    author_handle:
      post.author?.publicIdentifier ?? post.author?.universalName ?? null,
    author_url: stripQuery(post.author?.linkedinUrl),
    title: null,
    body_text: post.content ?? null,
    body_html: null,
    published_at: post.postedAt?.date ?? null,
    source_metadata: {
      // Author context. author_bio is a first-class signal for the classifier.
      author_type: post.author?.type ?? "profile",
      author_bio: post.author?.info ?? null,
      author_urn: post.author?.urn ?? null,
      author_linkedin_id: post.author?.id ?? null,

      // Engagement
      likes,
      comments,
      shares,
      reactions: post.engagement?.reactions ?? [],
      total_engagement: totalEngagement,

      // Post metadata
      posted_ago_short: post.postedAt?.postedAgoShort ?? null,
      is_repost: Boolean(post.repostedBy),
      reposted_by: repostedBy,

      // Content attachments
      has_document: Boolean(post.document),
      has_images: (post.postImages?.length ?? 0) > 0,
      has_video: Boolean(post.postVideo),
      has_article: Boolean(post.article),
      linked_article_url: post.article?.link ?? null,

      // Mentions extracted from contentAttributes
      mentioned_profiles: mentionedProfiles,
      mentioned_companies: mentionedCompanies,

      // Audit trail
      scraped_from_profile: post.query?.targetUrl ?? null,
      apify_run_id: apifyRunId,
      apify_session_id: post.query?.sessionId ?? null,
    },
    is_ii_relevant: null,
  };
}
