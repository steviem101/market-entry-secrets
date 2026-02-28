import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IntakeProgress } from '@/components/report-creator/IntakeProgress';
import { IntakeStep1 } from '@/components/report-creator/IntakeStep1';
import { IntakeStep2 } from '@/components/report-creator/IntakeStep2';
import { IntakeStep3 } from '@/components/report-creator/IntakeStep3';
import { GeneratingOverlay } from '@/components/report-creator/GeneratingOverlay';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { useAuth } from '@/hooks/useAuth';
import { fullIntakeSchema, step1Schema, step2Schema, type IntakeFormData, type ReportPersona } from '@/components/report-creator/intakeSchema';

const ReportCreator = () => {
  const [searchParams] = useSearchParams();
  const urlPersona = searchParams.get('persona');
  const initialPersona: ReportPersona = (urlPersona === 'startup') ? 'startup' : 'international';

  const [step, setStep] = useState(1);
  const [showAuth, setShowAuth] = useState(false);
  const [persona, setPersona] = useState<ReportPersona>(initialPersona);
  const { isGenerating, generationStatus, generate, loadDraft, clearDraft } = useReportGeneration();
  const { user } = useAuth();

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(fullIntakeSchema),
    defaultValues: {
      persona: initialPersona,
      company_name: '',
      website_url: '',
      country_of_origin: '',
      industry_sector: [],
      company_stage: '',
      employee_count: '',
      target_market: '',
      revenue_stage: '',
      selected_goals: [],
      additional_notes: '',
      target_regions: [],
      services_needed: [],
      timeline: '',
      budget_level: '',
      primary_goals: '',
      key_challenges: '',
      end_buyer_industries: [],
      end_buyers: [],
      known_competitors: [],
    },
  });

  // Sync persona to form when it changes
  const handlePersonaChange = (newPersona: ReportPersona) => {
    setPersona(newPersona);
    form.setValue('persona', newPersona);
    // Clear goals when switching persona since the options differ
    form.setValue('selected_goals', []);
  };

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      form.reset(draft);
      if (draft.persona === 'startup' || draft.persona === 'international') {
        setPersona(draft.persona);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After auth, auto-submit if we have a draft
  useEffect(() => {
    if (user && showAuth) {
      setShowAuth(false);
      const draft = loadDraft();
      if (draft) {
        form.reset(draft);
        handleGenerate();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleStep1Next = async () => {
    const fields = Object.keys(step1Schema.shape) as (keyof IntakeFormData)[];
    const valid = await form.trigger(fields);
    if (valid) setStep(2);
  };

  const handleStep2Next = async () => {
    const fields = ['selected_goals', 'additional_notes'] as (keyof IntakeFormData)[];
    const valid = await form.trigger(fields);
    if (valid) setStep(3);
  };

  const handleGenerate = async () => {
    const valid = await form.trigger();
    if (!valid) return;

    const data = form.getValues();
    const result = await generate(data);

    if (result.needsAuth) {
      setShowAuth(true);
    }
  };

  const pageTitle = persona === 'startup'
    ? 'AI Startup Growth Report'
    : 'AI Market Entry Report';

  const pageDescription = persona === 'startup'
    ? 'Get your personalised AI-powered growth report for scaling your Australian startup.'
    : 'Get your personalised AI-powered market entry report for entering the Australian market.';

  const subtitle = persona === 'startup'
    ? 'Answer a few questions and we\'ll generate a personalised report with matched investors, mentors, and a growth plan.'
    : 'Answer a few questions and we\'ll generate a personalised report with matched service providers, mentors, and an action plan.';

  return (
    <>
      <Helmet>
        <title>{pageTitle} | Market Entry Secrets</title>
        <meta name="description" content={pageDescription} />
      </Helmet>


      <main className="min-h-screen bg-gradient-to-b from-muted/30 to-background pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {pageTitle}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          <IntakeProgress currentStep={step} totalSteps={3} persona={persona} />

          {step === 1 && <IntakeStep1 form={form} onNext={handleStep1Next} persona={persona} onPersonaChange={handlePersonaChange} />}
          {step === 2 && <IntakeStep2 form={form} onNext={handleStep2Next} onBack={() => setStep(1)} persona={persona} />}
          {step === 3 && <IntakeStep3 form={form} onBack={() => setStep(2)} onSubmit={handleGenerate} isGenerating={isGenerating} persona={persona} />}
        </div>
      </main>

      <GeneratingOverlay isVisible={isGenerating} statusMessage={generationStatus} />
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} defaultTab="signup" />
    </>
  );
};

export default ReportCreator;
