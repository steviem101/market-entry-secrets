import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { reportApi } from '@/lib/api/reportApi';
import type { IntakeFormDataV2 } from '@/components/report-creator/intakeSchema.v2';
import { resolveCountryOfOrigin } from '@/lib/countryOfOrigin';
import { trackIntakeEvent, trackFunnelEvent } from '@/lib/analytics/intakeFunnel';

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
  // Clears ONLY the form draft. The scrape-provenance key (SCRAPE_META_KEY) is
  // owned by Step1Company and deliberately NOT cleared here: coupling it to the
  // draft-clear left a mounted Step 1 with live form values but null provenance
  // after a failed run, blinding the company-switch clear (MES-226 E2). A stale
  // provenance only ever clears *matching* values (a no-op on a fresh form) and
  // self-corrects on the next domain change, so leaving it is safe.
  const clearDraft = () => {
    try { localStorage.removeItem(LOCALSTORAGE_KEY_V2); } catch { /* ignore */ }
  };

  // `heroOriginated` is passed by the caller from its in-memory hero-intent state
  // (ReportCreatorV2), NOT re-read from the sessionStorage marker here. The marker
  // is consumed + cleared at report-creator mount, so reading it at completion
  // would miscredit a later non-hero report in the same tab (and can't survive an
  // abandoned attempt). Keying off the caller's state attributes THIS generation.
  const generate = async (
    data: IntakeFormDataV2,
    opts?: { heroOriginated?: boolean },
  ): Promise<{ needsAuth: boolean }> => {
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
        // PD-7: resolve "Other" + free text to the real country so the member
        // profile records e.g. "Brazil", not the literal "Other" (mirrors the
        // resolution mapV2ToLegacyIntake applies to the report's top-level column).
        country: resolveCountryOfOrigin(data.country_of_origin, data.country_of_origin_other),
        target_market: 'Australia',
        use_case: data.persona === 'startup' ? 'founder' : 'corporate',
        onboarding_completed: true,
      }).catch(() => {});

      setGenerationStatus('Starting report generation…');
      const result = await reportApi.generateReport(intakeForm.id);

      // Clear the draft only once a report row exists (generateReport returned a
      // report_id). Earlier failures — a 429 rate-limit or network error, which
      // reject BEFORE generate-report inserts the row — must keep the draft so
      // the user can resume; there's no /my-reports row to retry from in that
      // case (MES-226 R1/B1). A failed/timed-out run AFTER this point still has
      // its report row, and the draft is already gone so it can't re-seed the
      // next intake (the original weakness-10 this ticket also fixes).
      clearDraft();

      setGenerationStatus('Researching your market — this takes 2–4 minutes…');
      const pollResult = await reportApi.pollReportStatus(result.report_id, (status) => {
        if (status === 'processing') setGenerationStatus('Generating your report — analysing market data…');
      });

      if (pollResult.status === 'completed') {
        trackIntakeEvent('report_completed', {
          persona: data.persona,
          intake_form_id: intakeForm.id,
          user_id: user.id,
        });
        // MES-158: attribute completions that originated on the homepage intent
        // hero (flag from the caller's in-memory state — see the generate() note).
        if (opts?.heroOriginated) {
          trackFunnelEvent('report_completed_from_hero_intent', {
            source: 'homepage_hero',
            persona: data.persona,
            intake_form_id: intakeForm.id,
            user_id: user.id,
          });
        }
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
