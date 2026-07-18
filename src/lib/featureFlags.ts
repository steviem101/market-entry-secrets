/**
 * Lightweight feature-flag helpers.
 *
 * Lovable doesn't support VITE_ env vars, so flags are toggled via URL query
 * params (sticky to localStorage on hit) and read on demand. Add one entry
 * per flag here; consumers read via `isFeatureEnabled('report_creator_v2')`.
 *
 * URL conventions:
 *   ?v2=1      → enable report_creator_v2 (sticky) — now the default
 *   ?v2=0      → disable + clear sticky value (opt back to legacy form)
 */

export type FeatureFlag = 'report_creator_v2' | 'session_booking_banner' | 'intent_hero' | 'comparison_moments' | 'report_teasers' | 'section_refinement' | 'deliverables_hub' | 'concierge_intros' | 'report_v2';

interface FlagConfig {
  /** Query-string key that toggles the flag. */
  queryKey: string;
  /** localStorage key the flag persists under. */
  storageKey: string;
  /** Default value when no URL/storage override is present. */
  defaultValue: boolean;
}

const FLAGS: Record<FeatureFlag, FlagConfig> = {
  report_creator_v2: {
    queryKey: 'v2',
    storageKey: 'mes_flag_report_creator_v2',
    defaultValue: true,
  },
  // report_v2: the redesigned report renderer (Phase A). OFF by default and
  // stays off for every customer until PARITY.md is signed; the ReportView
  // wiring is added at the flag-flip step (STEP 7). ?reportv2=1 opts in.
  report_v2: {
    queryKey: 'reportv2',
    storageKey: 'mes_flag_report_v2',
    defaultValue: false,
  },
  // MES-196 (T13) advisor-booking banner on ReportView. On by default;
  // ?booking=0 is the rollback kill switch.
  session_booking_banner: {
    queryKey: 'booking',
    storageKey: 'mes_flag_session_booking_banner',
    defaultValue: true,
  },
  // MES-158 (Wave-2) intent-first hero: a free-text/chip intent capture on the
  // homepage that classifies the ask and prefills the report creator.
  // ENABLED by default (conversion baseline batch, 2026-07-17 — owner-approved);
  // ?intent=0 is the rollback kill switch.
  intent_hero: {
    queryKey: 'intent',
    storageKey: 'mes_flag_intent_hero',
    defaultValue: true,
  },
  // MES-188 T5b (Wave-2) comparison moments: free-vs-paid comparison surfaced
  // during report generation + the end-of-report upgrade strip.
  // ENABLED by default (conversion baseline batch, 2026-07-17 — owner-approved);
  // ?compare=0 is the rollback kill switch.
  comparison_moments: {
    queryKey: 'compare',
    storageKey: 'mes_flag_comparison_moments',
    defaultValue: true,
  },
  // MES-188 T4 (Wave-2) intent-aware teasers: locked report sections show a
  // count + a redacted sample (served by get_tier_gated_report when this flag
  // asks for it — the RPC + RLS redaction are live on prod, migration
  // 20260717010000). ENABLED by default (conversion baseline batch, 2026-07-17
  // — owner-approved); ?teasers=0 is the rollback kill switch.
  report_teasers: {
    queryKey: 'teasers',
    storageKey: 'mes_flag_report_teasers',
    defaultValue: true,
  },
  // MES-188 T14 (Wave-2) concierge refinement boxes on matched sections
  // (mentor/investor): structured reasons + free text → report_section_feedback.
  // Ships dark (default off); ?refine=1 enables it.
  section_refinement: {
    queryKey: 'refine',
    storageKey: 'mes_flag_section_refinement',
    defaultValue: false,
  },
  // MES-188 T15 (Wave-2) deliverables & introductions hub on the member hub:
  // unifies concierge entitlements + custom lead-list requests with statuses.
  // Ships dark (default off); ?deliverables=1 enables it.
  deliverables_hub: {
    queryKey: 'deliverables',
    storageKey: 'mes_flag_deliverables_hub',
    defaultValue: false,
  },
  // MES-188 T9 concierge intro requests: a paid member can request a
  // human-facilitated mentor/ecosystem intro, drawn from their D4 allowance
  // (server-enforced via check_concierge_intro_capacity + fulfil_concierge_intro).
  // Ships dark (default off); ?intros=1 enables the request UI.
  concierge_intros: {
    queryKey: 'intros',
    storageKey: 'mes_flag_concierge_intros',
    defaultValue: false,
  },
};

function isTruthy(raw: string | null): boolean {
  if (raw == null) return false;
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

function isFalsy(raw: string | null): boolean {
  if (raw == null) return false;
  return raw === '0' || raw === 'false' || raw === 'no' || raw === 'off';
}

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  if (typeof window === 'undefined') return FLAGS[flag].defaultValue;
  const { queryKey, storageKey, defaultValue } = FLAGS[flag];

  const search = new URLSearchParams(window.location.search);
  const queryValue = search.get(queryKey);

  if (queryValue !== null) {
    if (isTruthy(queryValue)) {
      try { window.localStorage.setItem(storageKey, '1'); } catch { /* ignore */ }
      return true;
    }
    if (isFalsy(queryValue)) {
      try { window.localStorage.removeItem(storageKey); } catch { /* ignore */ }
      return false;
    }
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored !== null) return isTruthy(stored);
  } catch { /* ignore */ }

  return defaultValue;
}
