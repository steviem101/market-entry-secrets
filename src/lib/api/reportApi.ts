import { supabase } from '@/integrations/supabase/client';
import type { IntakeFormData } from '@/components/report-creator/intakeSchema';

export const reportApi = {
  async submitIntakeForm(data: IntakeFormData, userId: string) {
    // Map selected_goals into services_needed for backward compat with edge function
    const goalsText = (data.selected_goals || []).join('; ');
    const additionalNotes = data.additional_notes || '';
    const combinedGoals = [goalsText, additionalNotes].filter(Boolean).join('. ');

    const payload = {
      user_id: userId,
      company_name: data.company_name,
      website_url: data.website_url,
      country_of_origin: data.country_of_origin,
      industry_sector: data.industry_sector,
      company_stage: data.company_stage,
      employee_count: data.employee_count,
      target_regions: data.target_regions || [],
      services_needed: data.selected_goals || data.services_needed || [],
      timeline: data.timeline || '',
      budget_level: data.budget_level || '',
      primary_goals: combinedGoals,
      key_challenges: data.key_challenges || '',
      known_competitors: data.known_competitors || [],
      end_buyer_industries: data.end_buyer_industries || [],
      end_buyers: data.end_buyers || [],
      raw_input: data as unknown,
      status: 'pending',
    };

    const { data: result, error } = await (supabase as any)
      .from('user_intake_forms')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return result as { id: string; [key: string]: unknown };
  },

  async generateReport(intakeFormId: string) {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: { intake_form_id: intakeFormId },
    });

    if (error) throw error;
    return data as { report_id: string; status: string; [key: string]: unknown };
  },

  /** Poll report status until completed or failed. Returns the final status. */
  async pollReportStatus(
    reportId: string,
    onProgress?: (status: string) => void,
    maxAttempts = 120,
    intervalMs = 3000
  ): Promise<{ status: string; error?: string }> {
    for (let i = 0; i < maxAttempts; i++) {
      const { data, error } = await (supabase as any)
        .from('user_reports')
        .select('status, report_json')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      const status = data.status as string;
      onProgress?.(status);

      if (status === 'completed') {
        return { status: 'completed' };
      }

      if (status === 'failed') {
        const errorMsg = (data.report_json as any)?.error || 'Report generation failed';
        return { status: 'failed', error: errorMsg };
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return { status: 'timeout', error: 'Report generation timed out. Please check My Reports later.' };
  },

  async fetchReport(reportId: string) {
    const { data, error } = await (supabase as any)
      .from('user_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) throw error;
    return data as {
      id: string;
      user_id: string;
      intake_form_id: string;
      tier_at_generation: string;
      report_json: Record<string, unknown>;
      sections_generated: string[];
      status: string;
      feedback_score: number | null;
      feedback_notes: string | null;
      created_at: string;
      updated_at: string;
    };
  },

  async fetchMyReports() {
    const { data, error } = await (supabase as any)
      .from('user_reports')
      .select('*, user_intake_forms(company_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Array<{
      id: string;
      tier_at_generation: string;
      status: string;
      created_at: string;
      user_intake_forms: { company_name: string } | null;
    }>;
  },

  async submitFeedback(reportId: string, score: number, notes?: string) {
    const { error } = await (supabase as any)
      .from('user_reports')
      .update({
        feedback_score: score,
        feedback_notes: notes || null,
      })
      .eq('id', reportId);

    if (error) throw error;
  },

  async generateShareToken(reportId: string): Promise<string> {
    const token = crypto.randomUUID();
    const { error } = await (supabase as any)
      .from('user_reports')
      .update({ share_token: token })
      .eq('id', reportId);

    if (error) throw error;
    return token;
  },

  async revokeShareToken(reportId: string) {
    const { error } = await (supabase as any)
      .from('user_reports')
      .update({ share_token: null })
      .eq('id', reportId);

    if (error) throw error;
  },

  async fetchSharedReport(shareToken: string) {
    const { data, error } = await (supabase as any)
      .from('user_reports')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (error) throw error;
    return data as {
      id: string;
      user_id: string;
      intake_form_id: string;
      tier_at_generation: string;
      report_json: Record<string, unknown>;
      sections_generated: string[];
      status: string;
      created_at: string;
      updated_at: string;
      share_token: string;
    };
  },
};
