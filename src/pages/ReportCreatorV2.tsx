import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthDialog } from '@/components/auth/AuthDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GeneratingScreenV2 } from '@/components/report-creator/v2/GeneratingScreenV2';
import { useAuth } from '@/hooks/useAuth';
import { useReportGenerationV2 } from '@/hooks/useReportGenerationV2';
import {
  fullIntakeSchema, DEFAULT_GOALS, smartDefaultGoals,
  type IntakeFormDataV2, type ReportPersona,
} from '@/components/report-creator/intakeSchema.v2';
import type { IntakeValues, SetPatch } from '@/components/report-creator/v2/types';
import { PersonaScreen } from '@/components/report-creator/v2/PersonaScreen';
import { StepShell } from '@/components/report-creator/v2/StepShell';
import { Step1Company } from '@/components/report-creator/v2/Step1Company';
import { Step2Goals } from '@/components/report-creator/v2/Step2Goals';
import { Step3Details } from '@/components/report-creator/v2/Step3Details';
import { ReviewScreen } from '@/components/report-creator/v2/ReviewScreen';
import { trackIntakeEvent, trackFunnelEvent } from '@/lib/analytics/intakeFunnel';
import { corporateWebsiteFromEmail } from '@/lib/corporateDomain';
import { readHeroIntentMarker, clearHeroIntentMarker } from '@/lib/heroIntentPrefill';
import { X } from 'lucide-react';

type Screen = 'persona' | 'company' | 'goals' | 'details' | 'review';
const UI_KEY = 'mes_intake_v2_ui';

const STEP_INDEX: Record<Exclude<Screen, 'persona'>, number> = {
  company: 0, goals: 1, details: 2, review: 3,
};

// Funnel step numbers (align with intake_funnel_v2: reached_step1/2/3).
const STEP_EVENT_NUM: Record<Exclude<Screen, 'persona'>, number> = {
  company: 1, goals: 2, details: 3, review: 4,
};

function buildDefaults(persona: ReportPersona): IntakeValues {
  return {
    persona,
    website_url: '',
    company_name: '',
    country_of_origin: '',
    industry_sector: [],
    company_stage: undefined as unknown as IntakeValues['company_stage'],
    employee_count: undefined,
    revenue_stage: undefined,
    // Pre-fill the most common AU entry point so the majority confirm rather
    // than cold-pick (README §Step 1). Cleared on any manual region change.
    target_regions: ['Sydney/NSW'],
    website_scrape_accepted: false,
    goal_ids: DEFAULT_GOALS[persona],
    timeline: undefined,
    budget_level: undefined,
    target_customers: {
      customer_type: 'B2B',
      customer_size: undefined,
      buying_motion: undefined,
      industries: [],
      named_companies: [],
      notes: '',
    },
    known_competitors: [],
    challenges: { tags: [], other: '' },
    report_focus: '',
  };
}

const ReportCreatorV2 = () => {
  const [searchParams] = useSearchParams();
  const urlPersona: ReportPersona = searchParams.get('persona') === 'startup' ? 'startup' : 'international';

  const { user } = useAuth();
  const { isGenerating, generationStatus, generate, loadDraft, saveDraft } = useReportGenerationV2();

  const [screen, setScreen] = useState<Screen>('persona');
  const [persona, setPersona] = useState<ReportPersona>(urlPersona);
  // MES-158: raw phrase the visitor entered on the homepage intent hero, shown
  // as a "we pre-selected this — review it" banner. Null when not from the hero.
  const [heroIntent, setHeroIntent] = useState<string | null>(null);
  const [heroBannerDismissed, setHeroBannerDismissed] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingPersona, setPendingPersona] = useState<ReportPersona | null>(null);
  const pendingGenerate = useRef(false);
  // Snapshot of the last system-applied goal selection (persona base or smart
  // defaults). `hasCustomisedGoals` compares against this so back-edit-forward
  // on Step 1 re-runs smart defaults with the updated context, while still
  // protecting any goals the user has manually toggled on Step 2.
  const lastAutoGoals = useRef<string[]>(DEFAULT_GOALS[urlPersona]);

  const form = useForm<IntakeFormDataV2>({
    resolver: zodResolver(fullIntakeSchema),
    defaultValues: buildDefaults(urlPersona),
    mode: 'onTouched',
  });

  const values = form.watch();
  const set: SetPatch = (patch) => {
    (Object.entries(patch) as [keyof IntakeValues, IntakeValues[keyof IntakeValues]][])
      .forEach(([k, v]) => form.setValue(k, v, { shouldDirty: true }));
  };

  // Restore a saved draft (values + UI position) on mount.
  useEffect(() => {
    const draft = loadDraft();
    let savedScreen: Screen | null = null;
    let savedPersona: ReportPersona | null = null;
    try {
      const ui = JSON.parse(localStorage.getItem(UI_KEY) || 'null');
      if (ui?.screen) savedScreen = ui.screen;
      if (ui?.persona) savedPersona = ui.persona;
    } catch { /* ignore */ }

    const p = (draft?.persona as ReportPersona) || savedPersona || urlPersona;
    if (draft && Object.keys(draft).length > 0) {
      form.reset({ ...buildDefaults(p), ...draft });
      setPersona(p);
      // Reset the snapshot to the new persona's base. If the draft's goal_ids
      // match (the common "fresh resume" case), smart defaults will re-apply
      // on the first Step 1 → Step 2 transition. If they differ, the user is
      // treated as having customised and we preserve their saved picks.
      lastAutoGoals.current = DEFAULT_GOALS[p];
      setScreen(savedScreen && savedScreen !== 'persona' ? savedScreen : 'company');
    }

    // MES-158: if the visitor arrived via the homepage intent hero, its prefill
    // draft was just restored above. Show the confirm banner + log the load.
    const marker = readHeroIntentMarker();
    if (marker) {
      setHeroIntent(marker.rawIntent);
      trackFunnelEvent('report_prefill_loaded', {
        source: 'homepage_hero',
        persona: p,
        metadata: { raw_intent: marker.rawIntent },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefill the company website from a signed-in user's corporate email domain
  // (e.g. jane@acmecorp.com → acmecorp.com), so Step 1 — and the scrape-company
  // enrichment it triggers — starts pre-populated. Only fills when the field is
  // still empty, so it never clobbers a restored draft or anything the user
  // typed; free-mail domains (gmail/outlook/…) yield null and are skipped.
  // Runs after the mount draft-restore above; the empty-guard makes ordering
  // irrelevant. Ref-guarded so it fires at most once per mount.
  const websitePrefilled = useRef(false);
  useEffect(() => {
    if (websitePrefilled.current || !user?.email) return;
    if ((form.getValues('website_url') || '').trim()) return;
    const domain = corporateWebsiteFromEmail(user.email);
    if (!domain) return;
    websitePrefilled.current = true;
    form.setValue('website_url', domain, { shouldDirty: true });
    trackIntakeEvent('website_prefill_from_email', { persona, user_id: user.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Persist the draft on any field change (idiomatic RHF subscription — avoids
  // a localStorage write on every render).
  useEffect(() => {
    const sub = form.watch((vals) => saveDraft(vals as Partial<IntakeFormDataV2>));
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist UI position (step + persona) for resume-on-refresh.
  useEffect(() => {
    try { localStorage.setItem(UI_KEY, JSON.stringify({ screen, persona })); } catch { /* ignore */ }
  }, [screen, persona]);

  // Funnel: step_entered on each step view.
  useEffect(() => {
    if (screen !== 'persona') {
      trackIntakeEvent('step_entered', { step: STEP_EVENT_NUM[screen], persona, user_id: user?.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Funnel: auth modal shown.
  useEffect(() => {
    if (showAuth) trackIntakeEvent('auth_modal_shown', { persona, user_id: user?.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAuth]);

  // Funnel: abandoned (best-effort on tab close / hide).
  useEffect(() => {
    const onHide = () => { if (screen !== 'persona') trackIntakeEvent('abandoned', { step: STEP_EVENT_NUM[screen], persona }); };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, persona]);

  // After auth completes, resume the pending generation (auth precedes pipeline).
  useEffect(() => {
    if (user && showAuth && pendingGenerate.current) {
      trackIntakeEvent('auth_completed', { persona, user_id: user.id });
      setShowAuth(false);
      pendingGenerate.current = false;
      void runGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function pickPersona(p: ReportPersona) {
    setPersona(p);
    form.setValue('persona', p);
    form.setValue('goal_ids', DEFAULT_GOALS[p]);
    lastAutoGoals.current = DEFAULT_GOALS[p];
    trackIntakeEvent('persona_selected', { persona: p, user_id: user?.id });
    setScreen('company');
  }

  // Funnel: field completion/skip summary as a step advances.
  function trackStepFields(step: Exclude<Screen, 'persona'>) {
    const v = form.getValues();
    const mark = (field: string, filled: boolean, metadata?: Record<string, unknown>) =>
      trackIntakeEvent(filled ? 'field_completed' : 'field_skipped', { step: STEP_EVENT_NUM[step], field_name: field, persona, metadata, user_id: user?.id });
    if (step === 'company') {
      mark('industry_sector', (v.industry_sector ?? []).length > 0, { count: (v.industry_sector ?? []).length });
      mark('target_regions', (v.target_regions ?? []).length > 0, { count: (v.target_regions ?? []).length });
    } else if (step === 'goals') {
      mark('goal_ids', (v.goal_ids ?? []).length > 0, { count: (v.goal_ids ?? []).length });
    } else if (step === 'details') {
      const tc = v.target_customers;
      mark('customer_type', !!tc?.customer_type);
      mark('target_customers.industries', (tc?.industries ?? []).length > 0, { count: (tc?.industries ?? []).length });
      mark('named_companies', (tc?.named_companies ?? []).length > 0, { count: (tc?.named_companies ?? []).length });
      mark('target_customers.notes', !!tc?.notes);
      mark('known_competitors', (v.known_competitors ?? []).length > 0, { count: (v.known_competitors ?? []).length });
      mark('challenge_tags', (v.challenges?.tags ?? []).length > 0, { count: (v.challenges?.tags ?? []).length });
      mark('report_focus', !!v.report_focus);
    }
  }

  /** Has the user actively customised their goals beyond what the system last
   *  applied (persona base on entry/switch, smart defaults on Step 1 → 2)? */
  function hasCustomisedGoals(): boolean {
    const current = form.getValues('goal_ids') ?? [];
    const baseline = lastAutoGoals.current;
    if (current.length !== baseline.length) return true;
    const sortedA = [...current].sort();
    const sortedB = [...baseline].sort();
    return sortedA.some((g, i) => g !== sortedB[i]);
  }

  function applyPersonaSwitch(p: ReportPersona) {
    setPersona(p);
    form.setValue('persona', p);
    // Goals differ per persona — reset to that persona's defaults.
    form.setValue('goal_ids', DEFAULT_GOALS[p]);
    lastAutoGoals.current = DEFAULT_GOALS[p];
    form.setValue('revenue_stage', undefined);
  }

  function switchPersona(p: ReportPersona) {
    if (p === persona) return;
    // Only confirm if the user has actively customised goals — accepting the
    // persona defaults is a no-op switch from their perspective.
    if (hasCustomisedGoals()) {
      setPendingPersona(p);
      return;
    }
    applyPersonaSwitch(p);
  }

  async function goNextFrom(current: Screen) {
    if (current === 'company') {
      const ok = await form.trigger([
        'persona', 'website_url', 'company_name', 'country_of_origin',
        'industry_sector', 'company_stage', 'target_regions',
      ]);
      if (ok) {
        trackStepFields('company');
        // Refine the persona-default goals using the Step 1 data the user just
        // entered (stage + industries + country) — but only if they haven't
        // already touched the goal selection. Pure config tweak; if anything
        // goes wrong it falls back to the persona base defaults.
        if (!hasCustomisedGoals()) {
          const v = form.getValues();
          const smart = smartDefaultGoals(persona, v.company_stage, v.industry_sector, v.country_of_origin);
          if (smart.length > 0) {
            form.setValue('goal_ids', smart);
            lastAutoGoals.current = smart;
          }
        }
        setScreen('goals');
      }
    } else if (current === 'goals') {
      if (await form.trigger(['goal_ids'])) { trackStepFields('goals'); setScreen('details'); }
    } else if (current === 'details') {
      if (await form.trigger(['target_customers', 'known_competitors', 'challenges', 'report_focus'])) {
        trackStepFields('details');
        setScreen('review');
      }
    }
  }

  async function runGenerate() {
    const result = await generate(form.getValues());
    if (result.needsAuth) {
      pendingGenerate.current = true;
      setShowAuth(true);
    }
  }

  async function handleGenerate() {
    trackIntakeEvent('generate_clicked', { persona, user_id: user?.id });
    if (heroIntent) {
      // The visitor confirmed the hero-seeded prefill by reaching Generate.
      trackFunnelEvent('report_prefill_confirmed', { source: 'homepage_hero', persona, user_id: user?.id });
    }
    const ok = await form.trigger();
    if (!ok) {
      // Jump back to the earliest step with an error.
      const e = form.formState.errors;
      const step1Keys = ['website_url', 'company_name', 'country_of_origin', 'industry_sector', 'company_stage', 'target_regions'];
      if (step1Keys.some((k) => k in e)) setScreen('company');
      else if ('goal_ids' in e) setScreen('goals');
      else setScreen('details');
      return;
    }
    await runGenerate();
  }

  const pageTitle = PERSONA_COPY_TITLE(persona);

  return (
    <>
      <Helmet>
        <title>{pageTitle} | Market Entry Secrets</title>
        <meta name="description" content="Get your personalised AI-powered market entry report." />
      </Helmet>

      <div className="bg-background">
        {screen === 'persona' ? (
          <div className="px-4 py-12 sm:px-6">
            <PersonaScreen onPick={pickPersona} />
          </div>
        ) : (
          <div>
            {heroIntent && !heroBannerDismissed && (
              <div className="mx-auto max-w-3xl px-4 pt-6">
                <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex-1 text-sm text-foreground">
                    <span className="font-medium">Starting from what you told us:</span>{' '}
                    <span className="italic text-muted-foreground">“{heroIntent}”</span>
                    <p className="mt-1 text-muted-foreground">
                      We&rsquo;ve pre-selected a focus and matching goals — review and adjust anything below before you generate.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => setHeroBannerDismissed(true)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            <StepShell persona={persona} stepIndex={STEP_INDEX[screen]} onSwitchPersona={switchPersona}>
              {screen === 'company' && (
                <Step1Company persona={persona} form={values} set={set} errors={form.formState.errors} onNext={() => goNextFrom('company')} />
              )}
              {screen === 'goals' && (
                <Step2Goals persona={persona} form={values} set={set} errors={form.formState.errors} onNext={() => goNextFrom('goals')} onBack={() => setScreen('company')} />
              )}
              {screen === 'details' && (
                <Step3Details persona={persona} form={values} set={set} errors={form.formState.errors} onNext={() => goNextFrom('details')} onBack={() => setScreen('goals')} />
              )}
              {screen === 'review' && (
                <ReviewScreen
                  persona={persona} form={values} set={set} isGenerating={isGenerating}
                  onBack={() => setScreen('details')}
                  onGenerate={handleGenerate}
                  goToStep={(s) => setScreen(s)}
                />
              )}
            </StepShell>
          </div>
        )}
      </div>

      <AlertDialog open={pendingPersona !== null} onOpenChange={(o) => { if (!o) setPendingPersona(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch journeys?</AlertDialogTitle>
            <AlertDialogDescription>
              The {pendingPersona === 'startup' ? 'Startup Growth' : 'International Entry'} path uses a different set of goals,
              so your current selections will be reset to that path's defaults. Your other answers stay.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pendingPersona) { applyPersonaSwitch(pendingPersona); setPendingPersona(null); } }}>
              Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <GeneratingScreenV2 isVisible={isGenerating} statusMessage={generationStatus} />
      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        defaultTab="signup"
        reassurance={{
          title: 'Your answers are saved.',
          subtitle: 'Create a free account to see your report.',
        }}
        // Bring the user back to the v2 wizard after SSO / magic-link, so they
        // actually see the "your report" they were promised.
        returnTo={typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/report-creator'}
      />
    </>
  );
};

function PERSONA_COPY_TITLE(persona: ReportPersona): string {
  return persona === 'startup' ? 'AI Startup Growth Report' : 'AI Market Entry Report';
}

export default ReportCreatorV2;
