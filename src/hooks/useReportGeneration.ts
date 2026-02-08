import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { reportApi } from '@/lib/api/reportApi';
import type { IntakeFormData } from '@/components/report-creator/intakeSchema';

const LOCALSTORAGE_KEY = 'mes_intake_form_draft';

export const useReportGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const saveDraft = (data: IntakeFormData) => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
  };

  const loadDraft = (): IntakeFormData | null => {
    try {
      const raw = localStorage.getItem(LOCALSTORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  };

  const generate = async (data: IntakeFormData) => {
    if (!user) {
      saveDraft(data);
      return { needsAuth: true };
    }

    setIsGenerating(true);
    setGenerationStatus('Submitting your information...');

    try {
      // 1. Submit intake form to database
      const intakeForm = await reportApi.submitIntakeForm(data, user.id);

      setGenerationStatus('Starting report generation...');

      // 2. Call generate-report edge function (returns immediately with report_id)
      const result = await reportApi.generateReport(intakeForm.id);

      setGenerationStatus('Researching your market — this takes 2-4 minutes...');

      // 3. Poll for completion
      const pollResult = await reportApi.pollReportStatus(
        result.report_id,
        (status) => {
          if (status === 'processing') {
            setGenerationStatus('Generating your report — analysing market data...');
          }
        }
      );

      if (pollResult.status === 'completed') {
        clearDraft();

        toast({
          title: 'Report Generated!',
          description: 'Your market entry report is ready to view.',
        });

        navigate(`/report/${result.report_id}`);
      } else if (pollResult.status === 'failed') {
        toast({
          title: 'Generation Failed',
          description: pollResult.error || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      } else {
        // Timeout — report may still complete
        toast({
          title: 'Report Still Processing',
          description: 'Your report is taking longer than expected. Check My Reports shortly.',
        });
        navigate('/my-reports');
      }

      return { needsAuth: false };
    } catch (error: any) {
      console.error('Report generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return { needsAuth: false };
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  return {
    isGenerating,
    generationStatus,
    generate,
    saveDraft,
    loadDraft,
    clearDraft,
  };
};
