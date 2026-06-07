import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { GeneratingOverlay } from '@/components/report-creator/GeneratingOverlay';
import { useAuth } from '@/hooks/useAuth';
import { useReportGenerationV2 } from '@/hooks/useReportGenerationV2';
import {
  fullIntakeSchema, DEFAULT_GOALS,
  type IntakeFormDataV2, type ReportPersona,
} from '@/components/report-creator/intakeSchema.v2';
import type { IntakeValues, SetPatch } from '@/components/report-creator/v2/types';
import { PersonaScreen } from '@/components/report-creator/v2/PersonaScreen';
import { StepShell } from '@/components/report-creator/v2/StepShell';
import { Step1Company } from '@/components/report-creator/v2/Step1Company';
import { Step2Goals } from '@/components/report-creator/v2/Step2Goals';
import { Step3Details } from '@/components/report-creator/v2/Step3Details';
import { ReviewScreen } from '@/components/report-creator/v2/ReviewScreen';

type Screen = 'persona' | 'company' | 'goals' | 'details' | 'review';
const UI_KEY = 'mes_intake_v2_ui';

const STEP_INDEX: Record<Exclude<Screen, 'persona'>, number> = {
  company: 0, goals: 1, details: 2, review: 3,
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
  const [showAuth, setShowAuth] = useState(false);
  const pendingGenerate = useRef(false);

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
      setScreen(savedScreen && savedScreen !== 'persona' ? savedScreen : 'company');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // After auth completes, resume the pending generation (auth precedes pipeline).
  useEffect(() => {
    if (user && showAuth && pendingGenerate.current) {
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
    setScreen('company');
  }

  function switchPersona(p: ReportPersona) {
    if (p === persona) return;
    setPersona(p);
    form.setValue('persona', p);
    // Goals differ per persona — reset to that persona's defaults.
    form.setValue('goal_ids', DEFAULT_GOALS[p]);
    form.setValue('revenue_stage', undefined);
  }

  async function goNextFrom(current: Screen) {
    if (current === 'company') {
      const ok = await form.trigger([
        'persona', 'website_url', 'company_name', 'country_of_origin',
        'industry_sector', 'company_stage', 'target_regions',
      ]);
      if (ok) setScreen('goals');
    } else if (current === 'goals') {
      if (await form.trigger(['goal_ids'])) setScreen('details');
    } else if (current === 'details') {
      if (await form.trigger(['target_customers', 'known_competitors', 'challenges', 'report_focus'])) {
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

      <div className="min-h-screen bg-rc-canvas font-rc">
        {screen === 'persona' ? (
          <div className="px-4 py-12 sm:px-6">
            <PersonaScreen onPick={pickPersona} />
          </div>
        ) : (
          <div>
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

      <GeneratingOverlay isVisible={isGenerating} statusMessage={generationStatus} />
      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        defaultTab="signup"
        reassurance={{
          title: 'Your answers are saved.',
          subtitle: 'Create a free account to see your report.',
        }}
      />
    </>
  );
};

function PERSONA_COPY_TITLE(persona: ReportPersona): string {
  return persona === 'startup' ? 'AI Startup Growth Report' : 'AI Market Entry Report';
}

export default ReportCreatorV2;
