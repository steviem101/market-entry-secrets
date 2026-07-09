/**
 * Intake funnel analytics (P2.2). Fire-and-forget inserts into
 * intake_form_events (RLS: anyone can insert, admins read). Drives the
 * intake_funnel_v2 view. Never throws and never blocks the UI.
 *
 * The table isn't in the generated Supabase types yet, so we cast the client
 * through `unknown` to a minimal typed surface (avoids `any`).
 */
import { supabase } from '@/integrations/supabase/client';

export type IntakeEventType =
  | 'persona_selected'
  | 'step_entered'
  | 'step_exited'
  | 'field_focused'
  | 'field_completed'
  | 'field_skipped'
  | 'website_prefill_shown'
  | 'website_prefill_accepted'
  | 'website_prefill_rejected'
  | 'website_prefill_from_email'
  | 'auth_modal_shown'
  | 'auth_completed'
  | 'generate_clicked'
  | 'report_completed'
  | 'abandoned';

interface IntakeEventRow {
  session_id: string;
  user_id?: string | null;
  intake_form_id?: string | null;
  event_type: IntakeEventType;
  step?: number | null;
  field_name?: string | null;
  persona?: string | null;
  metadata?: Record<string, unknown>;
}

interface MinimalInsertClient {
  from: (table: string) => { insert: (row: IntakeEventRow) => PromiseLike<{ error: unknown }> };
}

const SESSION_KEY = 'mes_intake_session_id';

/** Stable per-tab session id, shared across all funnel events. */
export function getIntakeSessionId(): string {
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
  step?: number;
  field_name?: string;
  persona?: string;
  metadata?: Record<string, unknown>;
  intake_form_id?: string;
  user_id?: string | null;
}

export function trackIntakeEvent(type: IntakeEventType, opts: TrackOptions = {}): void {
  try {
    const client = supabase as unknown as MinimalInsertClient;
    const row: IntakeEventRow = {
      session_id: getIntakeSessionId(),
      event_type: type,
      step: opts.step ?? null,
      field_name: opts.field_name ?? null,
      persona: opts.persona ?? null,
      metadata: opts.metadata ?? {},
      intake_form_id: opts.intake_form_id ?? null,
      user_id: opts.user_id ?? null,
    };
    // Fire-and-forget; swallow any error (analytics must never break the flow).
    void client.from('intake_form_events').insert(row);
  } catch {
    /* ignore */
  }
}
