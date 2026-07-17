import { supabase } from '@/integrations/supabase/client';
import type { IntakeFormData } from '@/components/report-creator/intakeSchema';
import { mapV2ToLegacyIntake, type IntakeFormDataV2 } from '@/components/report-creator/intakeSchema.v2';
import { isFeatureEnabled } from '@/lib/featureFlags';

export const reportApi = {
  /**
   * v2 intake submit. Projects the redesigned schema into the flat
   * user_intake_forms shape (incl. the new goal_ids + structured columns) via
   * the fixed mapV2ToLegacyIntake() shim, then inserts.
   */
  async submitIntakeFormV2(data: IntakeFormDataV2, userId: string) {
    const payload = mapV2ToLegacyIntake(data, userId);
    const { data: result, error } = await (supabase as any)
      .from('user_intake_forms')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return result as { id: string; [key: string]: unknown };
  },

  async submitIntakeForm(data: IntakeFormData, userId: string) {
    // Map selected_goals into services_needed for backward compat with edge function
    const goalsText = (data.selected_goals || []).join('; ');

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
      primary_goals: goalsText,
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
      // Session refresh failed — proceed anyway; getSession check below will catch expired sessions
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
      const errorName = error.name || '';

      if (
        msg.includes('Failed to send a request') ||
        msg.includes('FetchError') ||
        msg.includes('TypeError') ||
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError') ||
        msg.includes('CORS') ||
        errorName === 'FunctionsFetchError'
      ) {
        throw new Error(
          'Unable to reach the report generation service. This may be a CORS or network issue — please check the browser console for details.'
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
      // Status-only select: do NOT pull report_json here. Post-P0-3 the
      // report_json carries tier-gated content with `visible:false`, and
      // pulling it every 3s of polling leaked premium content to the owner's
      // network panel before any payment. fetchReport() goes through the
      // get_tier_gated_report RPC which strips that content server-side.
      const { data, error } = await (supabase as any)
        .from('user_reports')
        .select('status')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      const status = data.status as string;
      onProgress?.(status);

      if (status === 'completed') {
        return { status: 'completed' };
      }

      if (status === 'failed') {
        // Surface the failure message via the tier-gated RPC rather than a
        // direct report_json select: MES-38 revokes SELECT on report_json for
        // authenticated, so the SECURITY DEFINER RPC is the only read path.
        const { data: gatedJson } = await supabase
          .rpc('get_tier_gated_report', { p_report_id: reportId });
        const errorMsg =
          (gatedJson as Record<string, unknown> | null)?.['error'] as string | undefined
          || 'Report generation failed';
        return { status: 'failed', error: errorMsg };
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return { status: 'timeout', error: 'Report generation timed out. Please check My Reports later.' };
  },

  async fetchReport(reportId: string) {
    // Fetch report metadata (without full report_json content for gated sections)
    const { data: meta, error: metaError } = await (supabase as any)
      .from('user_reports')
      .select('id, user_id, intake_form_id, tier_at_generation, sections_generated, status, feedback_score, feedback_notes, created_at, updated_at')
      .eq('id', reportId)
      .single();

    if (metaError) throw metaError;

    // Use the server-side tier-gated function to get filtered report_json.
    // T4 (MES-188): request redacted teasers for locked sections when the
    // `report_teasers` flag is on. With it off the RPC strips exactly as before.
    // Only spread the p_include_teasers arg when the flag is on: the T4 migration
    // recreated the function as 2-arg (DEFAULT false), so a bare 1-arg call
    // resolves against BOTH the pre- and post-migration function. Passing the arg
    // unconditionally would hard-require the new signature, 500ing every report
    // view in any window where the published SPA runs ahead of the applied
    // migration (CLAUDE.md §2/§10 — frontend publishes independently of migrate).
    // Cast: the p_include_teasers arg (T4) isn't in the generated types until
    // the migration lands + types regenerate — same `(supabase as any)` style
    // the rest of this module uses for the report tables (CLAUDE.md §5).
    const { data: gatedJson, error: rpcError } = await (supabase as any)
      .rpc('get_tier_gated_report', {
        p_report_id: reportId,
        ...(isFeatureEnabled('report_teasers') ? { p_include_teasers: true } : {}),
      });

    if (rpcError) throw rpcError;

    return {
      ...meta,
      report_json: gatedJson ?? {},
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

    // List columns only — never `*`. Selecting `*` shipped the full
    // report_json (including tier-gated premium prose) to the /my-reports
    // network panel for free-tier owners (MES-38 / audit R1).
    // intake_form_id powers the failed-report Retry button (MES-148 1b):
    // regeneration re-enters generate-report, which resumes from the run's
    // persisted stage artifacts instead of re-paying research.
    const { data, error } = await (supabase as any)
      .from('user_reports')
      .select('id, status, tier_at_generation, created_at, intake_form_id, user_intake_forms(company_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Array<{
      id: string;
      tier_at_generation: string;
      status: string;
      created_at: string;
      intake_form_id: string | null;
      user_intake_forms: { company_name: string } | null;
    }>;
  },

  /**
   * Mentor recommendations across the user's completed reports, read via the
   * tier-gated RPC — list rows no longer carry report_json (MES-38), so this
   * is the only sanctioned way to get match data outside a report view.
   * Deduped by mentor name (first occurrence wins), matching the previous
   * client-side behaviour in MemberHub/MentorConnections.
   */
  async fetchMyMentorMatches() {
    const reports = await this.fetchMyReports();
    const completed = reports.filter((r) => r.status === 'completed');

    const perReport = await Promise.all(
      completed.map(async (report) => {
        const { data: gatedJson, error } = await supabase
          .rpc('get_tier_gated_report', { p_report_id: report.id });
        if (error || !gatedJson) return [];
        const matches = (gatedJson as any)?.matches?.mentor_recommendations;
        if (!Array.isArray(matches)) return [];
        return matches.map((mentor: any) => ({
          ...mentor,
          reportId: report.id,
          reportName: report.user_intake_forms?.company_name || 'Market Entry Report',
        }));
      })
    );

    const seen = new Set<string>();
    return perReport.flat().filter((mentor) => {
      if (!mentor.name || seen.has(mentor.name)) return false;
      seen.add(mentor.name);
      return true;
    }) as Array<Record<string, unknown> & { name: string; reportId: string; reportName: string }>;
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
