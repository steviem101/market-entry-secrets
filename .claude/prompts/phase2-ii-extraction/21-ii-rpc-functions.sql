-- ============================================================================
-- Phase 2 / step 4 — ii_* RPC FUNCTIONS (POST-schema restore)
-- Target: Irish Insights project  schyrnxekxcoaragofgv  (run on YOUR Mac).
-- ============================================================================
-- WHY this runs AFTER the schema dump (not appended into it):
--   All 6 are LANGUAGE sql, whose bodies are parsed/validated at CREATE time and
--   reference ii_* tables. They cannot be created until the tables exist.
-- Captured byte-exact from MES (xhziwveaiuhzdoutpgrh) via pg_get_functiondef.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.match_content(query_embedding vector, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 10, category_filter text DEFAULT NULL::text, source_type_filter text DEFAULT NULL::text, canonical_only boolean DEFAULT false, since_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(id uuid, source_type text, source_id text, source_url text, title text, summary text, category text, entities jsonb, tags text[], author_name text, author_handle text, published_at timestamp with time zone, similarity double precision)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select
    c.id,
    c.source_type,
    c.source_id,
    c.source_url,
    c.title,
    c.summary,
    c.category,
    c.entities,
    c.tags,
    c.author_name,
    c.author_handle,
    c.published_at,
    1 - (c.embedding <=> query_embedding) as similarity
  from ii_content c
  where c.is_ii_relevant = true
    and c.embedding is not null
    and (category_filter is null or c.category = category_filter)
    and (source_type_filter is null or c.source_type = source_type_filter)
    and (canonical_only = false or c.is_canonical = true)
    and (since_date is null or c.published_at >= since_date)
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$function$;

CREATE OR REPLACE FUNCTION public.match_archive(query_embedding vector, match_threshold double precision DEFAULT 0.6, match_count integer DEFAULT 10, source_type_filter text DEFAULT 'newsletter'::text, section_filter text[] DEFAULT ARRAY['at_home'::text, 'news_from_abroad'::text, 'founder_directory'::text, 'brain_food'::text])
 RETURNS TABLE(id uuid, source_type text, source_id text, section_name text, section_index integer, title text, published_at timestamp with time zone, similarity double precision)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select
    a.id,
    a.source_type,
    a.source_id,
    a.section_name,
    a.section_index,
    a.title,
    a.published_at,
    1 - (a.embedding <=> query_embedding) as similarity
  from ii_published_archive a
  where a.embedding is not null
    and (source_type_filter is null or a.source_type = source_type_filter)
    and (section_filter is null or a.section_name = any(section_filter))
    and 1 - (a.embedding <=> query_embedding) > match_threshold
  order by a.embedding <=> query_embedding
  limit match_count;
$function$;

CREATE OR REPLACE FUNCTION public.match_emails(query_embedding vector, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 10, category_filter text DEFAULT NULL::text, since_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(id uuid, subject text, summary text, category text, entities jsonb, tags text[], source_url text, from_name text, received_at timestamp with time zone, similarity double precision)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select
    c.id,
    c.title as subject,
    c.summary,
    c.category,
    c.entities,
    c.tags,
    c.source_url,
    c.author_name as from_name,
    c.published_at as received_at,
    1 - (c.embedding <=> query_embedding) as similarity
  from ii_content c
  where c.is_ii_relevant = true
    and c.source_type = 'email'
    and c.embedding is not null
    and (category_filter is null or c.category = category_filter)
    and (since_date is null or c.published_at >= since_date)
    and 1 - (c.embedding <=> query_embedding) > match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$function$;

CREATE OR REPLACE FUNCTION public.recent_ii_content(days integer DEFAULT 7, category_filter text DEFAULT NULL::text, source_type_filter text DEFAULT NULL::text, canonical_only boolean DEFAULT false, max_count integer DEFAULT 50)
 RETURNS TABLE(id uuid, source_type text, source_id text, source_url text, title text, summary text, category text, entities jsonb, tags text[], author_name text, author_handle text, published_at timestamp with time zone)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select
    c.id,
    c.source_type,
    c.source_id,
    c.source_url,
    c.title,
    c.summary,
    c.category,
    c.entities,
    c.tags,
    c.author_name,
    c.author_handle,
    c.published_at
  from ii_content c
  where c.is_ii_relevant = true
    and c.published_at >= now() - (days || ' days')::interval
    and (category_filter is null or c.category = category_filter)
    and (source_type_filter is null or c.source_type = source_type_filter)
    and (canonical_only = false or c.is_canonical = true)
  order by c.published_at desc
  limit max_count;
$function$;

CREATE OR REPLACE FUNCTION public.recent_ii_emails(days integer DEFAULT 7, category_filter text DEFAULT NULL::text, max_count integer DEFAULT 50)
 RETURNS TABLE(id uuid, subject text, summary text, category text, entities jsonb, tags text[], source_url text, from_name text, received_at timestamp with time zone)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select
    c.id,
    c.title as subject,
    c.summary,
    c.category,
    c.entities,
    c.tags,
    c.source_url,
    c.author_name as from_name,
    c.published_at as received_at
  from ii_content c
  where c.is_ii_relevant = true
    and c.source_type = 'email'
    and c.published_at >= now() - (days || ' days')::interval
    and (category_filter is null or c.category = category_filter)
  order by c.published_at desc
  limit max_count;
$function$;

CREATE OR REPLACE FUNCTION public.upsert_ii_linkedin_posts(rows jsonb)
 RETURNS TABLE(post_id text, inserted boolean)
 LANGUAGE sql
AS $function$
  insert into public.ii_personal_linkedin_posts as p (
    post_id, entity_id, share_urn, post_url, share_url,
    author_account, author_type, author_name, author_public_id, author_id,
    posted_at, posted_at_raw, body, content_hash, post_type, is_repost,
    reposted_by, reposted_by_url, num_likes, num_comments, num_shares,
    reactions, post_images, media, links, mentions, mentioned_companies,
    is_ii_content, relevance_source, query_target_url, raw,
    ingest_run_id, last_seen_run
  )
  select
    r.post_id, r.entity_id, r.share_urn, r.post_url, r.share_url,
    r.author_account, r.author_type, r.author_name, r.author_public_id, r.author_id,
    r.posted_at, r.posted_at_raw, r.body, r.content_hash, r.post_type, r.is_repost,
    r.reposted_by, r.reposted_by_url, r.num_likes, r.num_comments, r.num_shares,
    r.reactions, r.post_images, r.media, r.links, r.mentions, r.mentioned_companies,
    r.is_ii_content, r.relevance_source, r.query_target_url, r.raw,
    r.ingest_run_id, r.last_seen_run
  from jsonb_to_recordset(rows) as r (
    post_id text, entity_id text, share_urn text, post_url text, share_url text,
    author_account text, author_type text, author_name text, author_public_id text, author_id text,
    posted_at timestamptz, posted_at_raw text, body text, content_hash text, post_type text, is_repost boolean,
    reposted_by text, reposted_by_url text, num_likes integer, num_comments integer, num_shares integer,
    reactions jsonb, post_images text[], media jsonb, links text[], mentions jsonb, mentioned_companies text[],
    is_ii_content boolean, relevance_source text, query_target_url text, raw jsonb,
    ingest_run_id text, last_seen_run text
  )
  on conflict (post_id) do update set
    num_likes           = excluded.num_likes,
    num_comments        = excluded.num_comments,
    num_shares          = excluded.num_shares,
    reactions           = excluded.reactions,
    body                = excluded.body,
    post_type           = excluded.post_type,
    post_images         = excluded.post_images,
    media               = excluded.media,
    links               = excluded.links,
    mentions            = excluded.mentions,
    mentioned_companies = excluded.mentioned_companies,
    last_scraped_at     = now(),
    last_seen_run       = excluded.last_seen_run,
    updated_at          = now(),
    embedding           = case
                            when p.content_hash is distinct from excluded.content_hash
                            then null
                            else p.embedding
                          end,
    content_hash        = excluded.content_hash
  returning p.post_id, (xmax = 0);
$function$;
