/**
 * Rule-based hero-intent classifier (MES-158 V1).
 *
 * Turns a visitor's free-text "what do you need to find" into a small,
 * confirmable prefill for the report generator: matched goal ids (the stable
 * GOALS[].id from intakeSchema.v2), a persona guess, and the raw phrase carried
 * through as `report_focus`. Deliberately conservative and DETERMINISTIC — no
 * network, no model — mirroring the keyword style of `smartDefaultGoals`. Low
 * confidence never hides uncertainty: the report form still asks the user to
 * confirm/refine (§ ticket "Avoid pretending the system found exact matches").
 */
import type { ReportPersona } from '@/components/report-creator/intakeSchema.v2';

// Persona-exclusive goal ids (from GOALS[].personas in intakeSchema.v2). Inlined
// as a value here — the test runner (`node --test`) doesn't resolve the `@/`
// alias for runtime VALUE imports, only type-only ones — so a value import of
// GOALS would break the tests. Keep this in lockstep with GOALS' `personas`.
const STARTUP_ONLY = new Set([
  'investors', 'accelerators', 'mentors_startup', 'growth_providers',
  'spaces', 'lead_lists_startup', 'founders', 'guides_startup',
]);
const INTERNATIONAL_ONLY = new Set([
  'find_providers', 'trade_agencies', 'case_studies', 'guides',
  'associations', 'mentors_intl', 'lead_lists_intl', 'compliance',
]);
// Shared (valid for both): market_research, events, grants.

function goalValidForPersona(id: string, persona: ReportPersona): boolean {
  return persona === 'startup' ? !INTERNATIONAL_ONLY.has(id) : !STARTUP_ONLY.has(id);
}

export interface HeroIntent {
  /** The raw text the visitor entered (or a chip's phrase). */
  rawIntent: string;
  /** Matched goal ids (subset of GOALS[].id), capped, may be empty. */
  goalIds: string[];
  /** Best-guess persona; 'international' is the safe default. */
  persona: ReportPersona;
  /** 'high' when a keyword matched a goal, 'low' when nothing matched. */
  confidence: 'high' | 'low';
}

/** Keyword → goal-id rules, checked in order. Each entry maps a regex over the
 * lowercased intent to one or more GOALS ids. Kept close to the user's own
 * vocabulary (the hero rotating words + common asks). */
// Patterns use `s?` / `\w*` stems so plurals + inflections the user actually
// types ("investors", "providers", "mentors") match — a trailing `\b` after a
// singular stem would miss them.
const RULES: ReadonlyArray<{ re: RegExp; goals: string[]; persona?: ReportPersona }> = [
  { re: /\b(lawyers?|legal|solicitors?|attorneys?|counsel)\b/, goals: ['find_providers'], persona: 'international' },
  { re: /\b(accountants?|accounting|tax|bookkeep\w*)\b/, goals: ['find_providers'], persona: 'international' },
  { re: /\b(hr|payroll|employ\w*|hiring|recruit\w*)\b/, goals: ['find_providers'] },
  { re: /\b(providers?|consultants?|agenc\w+|services?)\b/, goals: ['find_providers'] },
  { re: /\b(compliance|regulat\w*|licen[cs]\w*|visas?|immigration)\b/, goals: ['compliance'], persona: 'international' },
  { re: /\b(investors?|vcs?|ventures?|fund(ing|s)?|rais\w+|capital)\b/, goals: ['investors'], persona: 'startup' },
  { re: /\b(accelerators?|incubators?)\b/, goals: ['accelerators'], persona: 'startup' },
  { re: /\b(grants?|government funding|r&d|non-dilutive|subsid\w*)\b/, goals: ['grants'] },
  { re: /\b(mentors?|advis[eo]rs?|coach\w*)\b/, goals: ['mentors_intl'] },
  { re: /\b(events?|conferences?|networking|meetups?|programs?|programmes?)\b/, goals: ['events'] },
  { re: /\b(leads?|prospects?|sales list|contact list|outreach|channel partners?)\b/, goals: ['lead_lists_intl'] },
  { re: /\b(trade|austrade|exports?|investment agenc\w+)\b/, goals: ['trade_agencies'], persona: 'international' },
  { re: /\b(associations?|chambers?|industry bod\w+)\b/, goals: ['associations'], persona: 'international' },
  { re: /\b(co-?working|offices?|innovation hubs?|spaces?)\b/, goals: ['spaces'], persona: 'startup' },
  { re: /\b(founders?|communit\w+|peers?)\b/, goals: ['founders'], persona: 'startup' },
  { re: /\b(case stud\w+|examples?|success stor\w+)\b/, goals: ['case_studies'], persona: 'international' },
  { re: /\b(guides?|playbooks?|how to|first 90|90 days)\b/, goals: ['guides'] },
  { re: /\b(research|market size|landscape|competitors?|tam|validat\w+)\b/, goals: ['market_research'] },
];

const MAX_GOALS = 3;
const MAX_FOCUS = 200; // report_focus schema cap

/** Persona keyword hints when no rule set one explicitly. */
function personaHint(text: string): ReportPersona | null {
  if (/\b(startup|founder|seed|series [a-c]|scal(e|ing)|raise|vc)\b/.test(text)) return 'startup';
  if (/\b(enter|entry|expand|overseas|foreign|international|from abroad)\b/.test(text)) return 'international';
  return null;
}

/**
 * Classify a raw intent phrase into a HeroIntent. Pure + deterministic.
 * @param persona optional override (e.g. a chip that is persona-specific).
 */
export function classifyIntent(raw: string, persona?: ReportPersona): HeroIntent {
  const rawIntent = (raw ?? '').trim();
  const text = rawIntent.toLowerCase();

  const goalIds: string[] = [];
  let rulePersona: ReportPersona | null = null;
  for (const rule of RULES) {
    if (rule.re.test(text)) {
      for (const g of rule.goals) if (!goalIds.includes(g)) goalIds.push(g);
      if (!rulePersona && rule.persona) rulePersona = rule.persona;
    }
    if (goalIds.length >= MAX_GOALS) break;
  }

  const resolvedPersona: ReportPersona =
    persona ?? rulePersona ?? personaHint(text) ?? 'international';

  // Map any generic mentor match to the persona-appropriate goal id so the
  // prefill lands a goal that actually exists for that persona's grid.
  const mapped = goalIds.slice(0, MAX_GOALS).map((id) =>
    id === 'mentors_intl' && resolvedPersona === 'startup' ? 'mentors_startup'
      : id === 'lead_lists_intl' && resolvedPersona === 'startup' ? 'lead_lists_startup'
      : id,
  );
  // Drop any goal that isn't valid for the resolved persona (defensive).
  const finalGoals = mapped.filter((id) => goalValidForPersona(id, resolvedPersona));

  return {
    rawIntent,
    goalIds: finalGoals,
    persona: resolvedPersona,
    confidence: finalGoals.length > 0 ? 'high' : 'low',
  };
}

/** The prompt chips shown in the hero — each carries a preset intent phrase. */
export interface IntentChip {
  label: string;
  intent: string;
  persona?: ReportPersona;
}

export const INTENT_CHIPS: readonly IntentChip[] = [
  { label: 'Find a startup lawyer', intent: 'find a startup lawyer', persona: 'international' },
  { label: 'Find a fintech mentor', intent: 'find a fintech mentor', persona: 'startup' },
  { label: 'Find investors', intent: 'find investors for my startup', persona: 'startup' },
  { label: 'Find grants & funding', intent: 'find grants and government funding' },
  { label: 'Find events & programs', intent: 'find events and networking programs' },
  { label: 'Validate my market-entry plan', intent: 'validate my Australia market-entry plan', persona: 'international' },
] as const;

/** Truncate an intent to the report_focus column cap. */
export function toReportFocus(raw: string): string {
  return (raw ?? '').trim().slice(0, MAX_FOCUS);
}
