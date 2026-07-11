// Shared row types for the apify-webhook ingest function.
//
// Reconstructed during the Phase 2 Irish Insights extraction. The original
// ii-ingest source imports these as `import type` (erased at build), so this
// file simply documents the runtime row shape and lets the relative imports
// resolve standalone. Kept permissive (any in source_metadata) on purpose.

export type SourceType =
  | "linkedin_post"
  | "email"
  | "reddit_post"
  | "reddit_comment";

export interface ContentRow {
  source_type: SourceType;
  source_id: string;
  source_url: string | null;
  author_name: string | null;
  author_handle: string | null;
  author_url: string | null;
  title: string | null;
  body_text: string | null;
  body_html: string | null;
  published_at: string | null;
  source_metadata: Record<string, any> | null;
  is_ii_relevant: boolean | null;
}
