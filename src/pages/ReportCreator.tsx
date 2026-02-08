import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { IntakeProgress } from '@/components/report-creator/IntakeProgress';
import { IntakeStep1 } from '@/components/report-creator/IntakeStep1';
import { IntakeStep2 } from '@/components/report-creator/IntakeStep2';
import { IntakeStep3 } from '@/components/report-creator/IntakeStep3';
import { GeneratingOverlay } from '@/components/report-creator/GeneratingOverlay';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { useAuth } from '@/hooks/useAuth';
import { fullIntakeSchema, step1Schema, step2Schema, type IntakeFormData } from '@/components/report-creator/intakeSchema';

const ReportCreator = () => {
  const [step, setStep] = useState(1);
  const [showAuth, setShowAuth] = useState(false);
  const { isGenerating, generate, loadDraft, clearDraft } = useReportGeneration();
  const { user } = useAuth();

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(fullIntakeSchema),
    defaultValues: {
      company_name: '',
      website_url: '',
      country_of_origin: '',
      industry_sector: [],
      company_stage: '',
      employee_count: '',
      target_regions: [],
      services_needed: [],
      timeline: '',
      budget_level: '',
      primary_goals: '',
      key_challenges: '',
      known_competitors: [],
    },
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      form.reset(draft);
    }
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
  }, [user]);

  const handleStep1Next = async () => {
    const fields = Object.keys(step1Schema.shape) as (keyof IntakeFormData)[];
    const valid = await form.trigger(fields);
    if (valid) setStep(2);
  };

  const handleStep2Next = async () => {
    const fields = Object.keys(step2Schema.shape) as (keyof IntakeFormData)[];
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

  return (
    <>
      <Helmet>
        <title>Market Entry Report Creator | Market Entry Secrets</title>
        <meta name="description" content="Get your personalised AI-powered market entry report for entering the Australian market." />
      </Helmet>

      <Navigation />

      <main className="min-h-screen bg-gradient-to-b from-muted/30 to-background pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              AI Market Entry Report
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Answer a few questions and we'll generate a personalised report with matched service providers, mentors, and an action plan.
            </p>
          </div>

          <IntakeProgress currentStep={step} totalSteps={3} />

          {step === 1 && <IntakeStep1 form={form} onNext={handleStep1Next} />}
          {step === 2 && <IntakeStep2 form={form} onNext={handleStep2Next} onBack={() => setStep(1)} />}
          {step === 3 && <IntakeStep3 form={form} onBack={() => setStep(2)} onSubmit={handleGenerate} isGenerating={isGenerating} />}
        </div>
      </main>

      <GeneratingOverlay isVisible={isGenerating} />
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} defaultTab="signup" />
      <Footer />
    </>
  );
};

export default ReportCreator;
