import { supabase } from '@/integrations/supabase/client';
import type { IntakeFormData } from '@/components/report-creator/intakeSchema';

export const reportApi = {
  async submitIntakeForm(data: IntakeFormData, userId: string) {
    // Map selected_goals into services_needed for backward compat with edge function
    const goalsText = (data.selected_goals || []).join('; ');
    const additionalNotes = data.additional_notes || '';
    const combinedGoals = [goalsText, additionalNotes].filter(Boolean).join('. ');

    // Filter out empty competitor/end-buyer entries (user clicked Add but left blank)
    const cleanedCompetitors = (data.known_competitors || []).filter(
      (c) => c.name.trim() || c.website.trim()
    );
    const cleanedEndBuyers = (data.end_buyers || []).filter(
      (b) => b.name.trim() || b.website.trim()
    );

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
      known_competitors: cleanedCompetitors,
      end_buyer_industries: data.end_buyer_industries || [],
      end_buyers: cleanedEndBuyers,
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
    // Ensure the session token is fresh before calling the edge function.
    // A stale/expired JWT causes Supabase's gateway to return a 401 without
    // CORS headers, which the browser surfaces as a network error (FetchError).
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.warn('Session refresh failed before report generation:', refreshError.message);
    }

    // Check we have a valid session before calling the edge function
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error('Your session has expired. Please sign in again and retry.');
    }

    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: { intake_form_id: intakeFormId },
    });

    if (error) {
      const msg = error.message || '';
      console.error('generate-report invoke error:', msg, error);

      if (msg.includes('Failed to send a request') || msg.includes('FetchError') || msg.includes('TypeError')) {
        throw new Error(
          'Unable to reach the report generation service. This may be a temporary issue — please try again in a moment.'
        );
      }
      if (msg.includes('non-2xx')) {
        const statusMatch = msg.match(/(\d{3})/);
        const status = statusMatch ? statusMatch[1] : 'unknown';
        if (status === '401') {
          throw new Error(
            'Your session has expired. Please sign in again and retry.'
          );
        }
        throw new Error(
          'The report generation service returned an error. Please try again or contact support if the issue persists.'
        );
      }
      throw error;
    }

    // Handle edge case where invoke returns a non-error response but contains an error body
    if (data && typeof data === 'object' && 'error' in data && !('report_id' in data)) {
      throw new Error((data as any).error || 'Report generation failed');
    }

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
    // Fetch report including report_json so we have a fallback
    const { data: meta, error: metaError } = await (supabase as any)
      .from('user_reports')
      .select('id, user_id, intake_form_id, tier_at_generation, report_json, sections_generated, status, feedback_score, feedback_notes, created_at, updated_at')
      .eq('id', reportId)
      .single();

    if (metaError) throw metaError;

    // Try the server-side tier-gated function for filtered report_json.
    // Fall back to the raw report_json if the RPC function doesn't exist
    // (e.g. migration not yet applied).
    let reportJson = meta.report_json ?? {};
    try {
      const { data: gatedJson, error: rpcError } = await supabase
        .rpc('get_tier_gated_report', { p_report_id: reportId });

      if (!rpcError && gatedJson != null) {
        reportJson = gatedJson;
      } else if (rpcError) {
        console.warn('get_tier_gated_report RPC failed, using raw report_json:', rpcError.message);
      }
    } catch (e) {
      console.warn('get_tier_gated_report RPC unavailable, using raw report_json:', e);
    }

    return {
      ...meta,
      report_json: reportJson,
    } as {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('user_reports')
      .select('*, user_intake_forms(company_name)')
      .eq('user_id', user.id)
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
    const { data, error } = await supabase
      .rpc('get_shared_report', { p_share_token: shareToken })
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
