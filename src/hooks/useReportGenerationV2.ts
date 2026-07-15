import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { reportApi } from '@/lib/api/reportApi';
import type { IntakeFormDataV2 } from '@/components/report-creator/intakeSchema.v2';
import { trackIntakeEvent } from '@/lib/analytics/intakeFunnel';

/**
 * v2 generation hook. Separate from the legacy useReportGeneration so the live
 * flow is untouched. Persists the v2 draft under its own localStorage key and
 * submits via reportApi.submitIntakeFormV2 (the fixed shim).
 *
 * Auth ordering (P0.3): callers gate on `needsAuth` BEFORE generation — the v2
 * flow never invokes the pipeline unauthenticated.
 */
const LOCALSTORAGE_KEY_V2 = 'mes_intake_form_draft_v2';

export const useReportGenerationV2 = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, deriveProfileFromIntake } = useAuth();

  const saveDraft = (data: Partial<IntakeFormDataV2>) => {
    try { localStorage.setItem(LOCALSTORAGE_KEY_V2, JSON.stringify(data)); } catch { /* ignore */ }
  };
  const loadDraft = (): Partial<IntakeFormDataV2> | null => {
    try {
      const raw = localStorage.getItem(LOCALSTORAGE_KEY_V2);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const clearDraft = () => {
    try { localStorage.removeItem(LOCALSTORAGE_KEY_V2); } catch { /* ignore */ }
  };

  const generate = async (data: IntakeFormDataV2): Promise<{ needsAuth: boolean }> => {
    if (!user) {
      saveDraft(data);
      return { needsAuth: true };
    }

    setIsGenerating(true);
    setGenerationStatus('Submitting your information…');

    try {
      const intakeForm = await reportApi.submitIntakeFormV2(data, user.id);

      // MES-187 A1: derive the member profile from the intake we just collected
      // so the onboarding modal never asks again for what we already have.
      // Best-effort + silent — never blocks or fails generation (if it errors,
      // the modal simply defers to a later non-report visit, still suppressed on
      // the report flow by the OnboardingGate / A2).
      void deriveProfileFromIntake({
        company_name: data.company_name,
        country: data.country_of_origin,
        target_market: 'Australia',
        use_case: data.persona === 'startup' ? 'founder' : 'corporate',
        onboarding_completed: true,
      }).catch(() => {});

      setGenerationStatus('Starting report generation…');
      const result = await reportApi.generateReport(intakeForm.id);

      setGenerationStatus('Researching your market — this takes 2–4 minutes…');
      const pollResult = await reportApi.pollReportStatus(result.report_id, (status) => {
        if (status === 'processing') setGenerationStatus('Generating your report — analysing market data…');
      });

      if (pollResult.status === 'completed') {
        clearDraft();
        trackIntakeEvent('report_completed', {
          persona: data.persona,
          intake_form_id: intakeForm.id,
          user_id: user.id,
        });
        toast({ title: 'Report generated!', description: 'Your report is ready to view.' });
        navigate(`/report/${result.report_id}`);
      } else if (pollResult.status === 'failed') {
        toast({
          title: 'Generation failed',
          description: pollResult.error || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Report still processing',
          description: 'This is taking longer than expected. Check My Reports shortly.',
        });
        navigate('/my-reports');
      }

      return { needsAuth: false };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Generation failed',
        description: errorMsg.length > 200 ? `${errorMsg.slice(0, 200)}…` : errorMsg,
        variant: 'destructive',
      });
      return { needsAuth: false };
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  return { isGenerating, generationStatus, generate, saveDraft, loadDraft, clearDraft };
};
