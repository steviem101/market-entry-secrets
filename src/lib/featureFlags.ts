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

export type FeatureFlag = 'report_creator_v2' | 'session_booking_banner' | 'intent_hero' | 'comparison_moments';

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
  // MES-196 (T13) advisor-booking banner on ReportView. On by default;
  // ?booking=0 is the rollback kill switch.
  session_booking_banner: {
    queryKey: 'booking',
    storageKey: 'mes_flag_session_booking_banner',
    defaultValue: true,
  },
  // MES-158 (Wave-2) intent-first hero: a free-text/chip intent capture on the
  // homepage that classifies the ask and prefills the report creator. Ships
  // dark (default off); ?intent=1 enables it, enable broadly post-launch.
  intent_hero: {
    queryKey: 'intent',
    storageKey: 'mes_flag_intent_hero',
    defaultValue: false,
  },
  // MES-188 T5b (Wave-2) comparison moments: free-vs-paid comparison surfaced
  // during report generation (and later at review / report-end). Ships dark
  // (default off); ?compare=1 enables it. One funnel change per measurement
  // window — enable deliberately post-launch.
  comparison_moments: {
    queryKey: 'compare',
    storageKey: 'mes_flag_comparison_moments',
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
