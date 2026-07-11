/**
 * Country page funnel analytics. Fire-and-forget inserts into
 * country_page_events (RLS: anyone can insert, admins read). Mirrors
 * the intake funnel pattern: never throws and never blocks the UI.
 */
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export type CountryEventType =
  | 'page_view'
  | 'report_creator_click'
  | 'intro_request_click'
  | 'lead_capture_submit';

const SESSION_KEY = 'mes_country_session_id';

/** Stable per-tab session id, shared across all country funnel events. */
export function getCountrySessionId(): string {
  if (typeof window === 'undefined') return '00000000-0000-4000-8000-000000000000';
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

interface TrackOptions {
  section?: string;
  metadata?: Record<string, Json>;
}

export function trackCountryEvent(
  countrySlug: string,
  type: CountryEventType,
  opts: TrackOptions = {},
): void {
  try {
    // Fire-and-forget; swallow any error (analytics must never break the page).
    void supabase.from('country_page_events').insert({
      session_id: getCountrySessionId(),
      country_slug: countrySlug,
      event_type: type,
      section: opts.section ?? null,
      metadata: opts.metadata ?? {},
    });
  } catch {
    /* ignore */
  }
}
