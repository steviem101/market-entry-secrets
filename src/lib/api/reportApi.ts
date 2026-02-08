import { supabase } from '@/integrations/supabase/client';
import type { IntakeFormData } from '@/components/report-creator/intakeSchema';

export const reportApi = {
  async submitIntakeForm(data: IntakeFormData, userId: string) {
    const payload = {
      user_id: userId,
      company_name: data.company_name,
      website_url: data.website_url,
      country_of_origin: data.country_of_origin,
      industry_sector: data.industry_sector,
      company_stage: data.company_stage,
      employee_count: data.employee_count,
      target_regions: data.target_regions,
      services_needed: data.services_needed,
      timeline: data.timeline,
      budget_level: data.budget_level,
      primary_goals: data.primary_goals || '',
      key_challenges: data.key_challenges || '',
      known_competitors: data.known_competitors || [],
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
    return data as { report_id: string; [key: string]: unknown };
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
};
