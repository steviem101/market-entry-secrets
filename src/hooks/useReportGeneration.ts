import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { reportApi } from '@/lib/api/reportApi';
import type { IntakeFormData } from '@/components/report-creator/intakeSchema';

const LOCALSTORAGE_KEY = 'mes_intake_form_draft';

export const useReportGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
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

    try {
      // 1. Submit intake form to database
      const intakeForm = await reportApi.submitIntakeForm(data, user.id);

      // 2. Call generate-report edge function (handles enrich + search + generate)
      const result = await reportApi.generateReport(intakeForm.id);

      clearDraft();

      toast({
        title: 'Report Generated!',
        description: 'Your market entry report is ready to view.',
      });

      // Navigate to the report
      navigate(`/report/${result.report_id}`);
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
    }
  };

  return {
    isGenerating,
    generate,
    saveDraft,
    loadDraft,
    clearDraft,
  };
};
