// supabase/functions/process-email-queue/index.ts
//
// Processes the email nurture sequence queue. Designed to run on a cron
// schedule (every 6 hours). For each user with a due sequence step, it:
//   1. Fetches the step config from email_sequence_steps
//   2. Gathers dynamic data (provider count, events, case studies, etc.)
//   3. Calls the send-email function with the right template + data
//   4. Advances the sequence to the next step or marks it complete

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { log, logError } from "../_shared/log.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EMAIL_INTERNAL_SECRET = Deno.env.get("EMAIL_INTERNAL_SECRET")!;

interface SequenceRow {
  id: string;
  user_id: string;
  sequence_name: string;
  current_step: number;
  next_send_at: string;
}

interface StepConfig {
  template_name: string;
  subject: string;
  delay_days: number;
}

interface DynamicData {
  provider_count: string;
  featured_case_study_title: string;
  featured_case_study_company: string;
  upcoming_event_title: string;
  upcoming_event_date: string;
  report_count: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  // Auth: require internal secret (used by pg_cron and manual invocations)
  const secret = req.headers.get("x-internal-secret");
  if (secret !== EMAIL_INTERNAL_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Fetch due sequences
    const { data: dueSequences, error: fetchErr } = await supabase
      .from("email_sequences")
      .select("id, user_id, sequence_name, current_step, next_send_at")
      .is("completed_at", null)
      .eq("paused", false)
      .lte("next_send_at", new Date().toISOString())
      .limit(50);

    if (fetchErr) {
      logError("process-email-queue", "Failed to fetch due sequences", fetchErr);
      return new Response(JSON.stringify({ error: "Failed to fetch sequences" }), { status: 500 });
    }

    if (!dueSequences || dueSequences.length === 0) {
      log("process-email-queue", "No due sequences to process");
      return new Response(JSON.stringify({ processed: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    log("process-email-queue", `Processing ${dueSequences.length} due sequence(s)`);

    // 2. Pre-fetch dynamic data (shared across all emails)
    const dynamicData = await fetchDynamicData(supabase);

    // 3. Pre-fetch all step configs for referenced sequences
    const sequenceNames = [...new Set(dueSequences.map((s: SequenceRow) => s.sequence_name))];
    const { data: allSteps } = await supabase
      .from("email_sequence_steps")
      .select("sequence_name, step_number, template_name, subject, delay_days")
      .in("sequence_name", sequenceNames)
      .eq("is_active", true)
      .order("step_number", { ascending: true });

    const stepMap = new Map<string, StepConfig[]>();
    for (const step of (allSteps || [])) {
      const key = step.sequence_name;
      if (!stepMap.has(key)) stepMap.set(key, []);
      stepMap.get(key)!.push(step);
    }

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    // 4. Process each due sequence
    for (const seq of dueSequences as SequenceRow[]) {
      try {
        const steps = stepMap.get(seq.sequence_name) || [];
        const currentStepConfig = steps.find(
          (s: StepConfig & { step_number?: number }) =>
            (s as any).step_number === seq.current_step
        ) as (StepConfig & { step_number: number }) | undefined;

        if (!currentStepConfig) {
          // No more steps — mark sequence as complete
          await supabase
            .from("email_sequences")
            .update({ completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("id", seq.id);
          log("process-email-queue", "Sequence completed (no more steps)", {
            user_id: seq.user_id,
            sequence: seq.sequence_name,
          });
          continue;
        }

        // 4a. Fetch user data
        const { data: userData } = await supabase.auth.admin.getUserById(seq.user_id);
        if (!userData?.user?.email) {
          log("process-email-queue", "Skipping — user has no email", { user_id: seq.user_id });
          skipped++;
          continue;
        }

        // 4b. Check if user has upgraded (skip nurture_upgrade for paid users,
        //     or skip all nurture emails for paid users on upgrade step)
        const { data: subscription } = await supabase
          .from("user_subscriptions")
          .select("tier")
          .eq("user_id", seq.user_id)
          .maybeSingle();

        const userTier = subscription?.tier || "free";
        const isPaid = userTier !== "free";

        // Skip upgrade-pitch emails entirely for paid users. Covers the generic
        // nurture_upgrade step AND the report_followup_* steps (conversion plan
        // step 4) — once they've bought, the goal is achieved and a "here's
        // what's locked" email would be wrong as well as annoying.
        const isUpgradePitch =
          currentStepConfig.template_name === "nurture_upgrade" ||
          currentStepConfig.template_name.startsWith("report_followup");
        if (isPaid && isUpgradePitch) {
          // Advance past this step
          const nextStep = seq.current_step + 1;
          const nextStepConfig = steps.find(
            (s: any) => s.step_number === nextStep
          );
          if (nextStepConfig) {
            await supabase
              .from("email_sequences")
              .update({
                current_step: nextStep,
                next_send_at: new Date(
                  Date.now() + (nextStepConfig as any).delay_days * 86400000
                ).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", seq.id);
          } else {
            await supabase
              .from("email_sequences")
              .update({ completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
              .eq("id", seq.id);
          }
          log("process-email-queue", "Skipped upgrade email for paid user", {
            user_id: seq.user_id,
            tier: userTier,
          });
          skipped++;
          continue;
        }

        // 4c. Fetch user profile for first_name
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", seq.user_id)
          .maybeSingle();

        // 4d. Build template data
        const templateData: Record<string, unknown> = {
          first_name: profile?.first_name || userData.user.user_metadata?.first_name || "there",
          current_tier: userTier,
          ...dynamicData,
        };

        // 4d-ii. report_followup steps carry the member's own report context:
        // link + locked-section match COUNTS (never names — that's what gating
        // protects), recomputed fresh from their latest completed report so a
        // regenerated report is reflected. Zero-match (or no-report) users skip
        // the step silently — "unlock 0 mentors" is negative advertising.
        if (currentStepConfig.template_name.startsWith("report_followup")) {
          const followupData = await fetchReportFollowupData(supabase, seq.user_id);
          if (!followupData) {
            await advanceSequence(supabase, seq, steps);
            log("process-email-queue", "Skipped report_followup (no report / zero locked matches)", {
              user_id: seq.user_id,
              step: seq.current_step,
            });
            skipped++;
            continue;
          }
          Object.assign(templateData, followupData);
        }

        // 4e. Send via send-email
        const sendRes = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": EMAIL_INTERNAL_SECRET,
          },
          body: JSON.stringify({
            email_type: currentStepConfig.template_name,
            recipient_email: userData.user.email,
            user_id: seq.user_id,
            data: templateData,
          }),
        });

        const sendResult = await sendRes.json();

        if (!sendRes.ok && !sendResult.reason) {
          logError("process-email-queue", "send-email failed", {
            user_id: seq.user_id,
            template: currentStepConfig.template_name,
            error: sendResult,
          });
          errors++;
          continue;
        }

        // 4f. Advance sequence to next step
        const nextStep = seq.current_step + 1;
        const nextStepConfig = steps.find((s: any) => s.step_number === nextStep);

        if (nextStepConfig) {
          // Calculate next_send_at relative to now
          const nextDelay = (nextStepConfig as any).delay_days - currentStepConfig.delay_days;
          const delayMs = Math.max(nextDelay, 1) * 86400000; // minimum 1 day between sends
          await supabase
            .from("email_sequences")
            .update({
              current_step: nextStep,
              next_send_at: new Date(Date.now() + delayMs).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", seq.id);
        } else {
          // No more steps — complete
          await supabase
            .from("email_sequences")
            .update({
              current_step: nextStep,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", seq.id);
        }

        log("process-email-queue", "Processed sequence step", {
          user_id: seq.user_id,
          template: currentStepConfig.template_name,
          sent: sendResult.sent,
          reason: sendResult.reason || null,
        });
        processed++;
      } catch (seqErr) {
        logError("process-email-queue", "Error processing sequence", {
          sequence_id: seq.id,
          error: seqErr instanceof Error ? seqErr.message : String(seqErr),
        });
        errors++;
      }
    }

    const result = { processed, skipped, errors, total: dueSequences.length };
    log("process-email-queue", "Queue processing complete", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    logError("process-email-queue", "Unhandled error", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
});

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Advance a sequence past its current step WITHOUT sending (used when a step is
 * skipped — paid user, or a report_followup step with nothing to tease). Same
 * delta semantics as the post-send advance (4f): next_send_at = now + the gap
 * between the two steps' delay_days, minimum 1 day. Completes the sequence when
 * there is no next step.
 */
// deno-lint-ignore no-explicit-any
async function advanceSequence(supabase: any, seq: SequenceRow, steps: StepConfig[]): Promise<void> {
  const current = steps.find((s: StepConfig & { step_number?: number }) => (s as any).step_number === seq.current_step);
  const nextStep = seq.current_step + 1;
  const next = steps.find((s: StepConfig & { step_number?: number }) => (s as any).step_number === nextStep);
  if (next) {
    const delayDays = Math.max((next as any).delay_days - ((current as any)?.delay_days ?? 0), 1);
    await supabase
      .from("email_sequences")
      .update({
        current_step: nextStep,
        next_send_at: new Date(Date.now() + delayDays * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", seq.id);
  } else {
    await supabase
      .from("email_sequences")
      .update({ completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", seq.id);
  }
}

/**
 * Report context for the report_followup steps: the member's latest completed
 * report's URL + locked-section match COUNTS (never names — that is what tier
 * gating protects; same counts-only rule as the T16a completion email).
 * Recomputed fresh at send time so a regenerated report is reflected. Returns
 * null when there is no completed report or every gated section matched
 * nothing (callers skip the step — teasing zero matches is negative
 * advertising). Recipients here are always free-tier (paid users are skipped
 * before this runs), so "locked" = any section whose visibility_tier != free.
 */
// deno-lint-ignore no-explicit-any
async function fetchReportFollowupData(supabase: any, userId: string): Promise<Record<string, unknown> | null> {
  const { data: report } = await supabase
    .from("user_reports")
    .select("id, report_json, intake_form_id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!report?.id) return null;

  const { data: templates } = await supabase
    .from("report_templates")
    .select("section_name, visibility_tier")
    .neq("visibility_tier", "free");

  const sections = (report.report_json as Record<string, any> | null)?.sections ?? {};
  const lockedFindings = (templates ?? [])
    .map((t: { section_name: string }) => {
      const matches = sections[t.section_name]?.matches;
      const arr = Array.isArray(matches) ? matches : [];
      const count = t.section_name === "lead_list"
        ? arr.filter((x: any) => x?.card_group === "leads").length
        : arr.length;
      return { key: t.section_name, count };
    })
    .filter((f: { count: number }) => f.count > 0);
  if (lockedFindings.length === 0) return null;

  const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://marketentrysecrets.com";
  // company_name for the D2 copy, best-effort from the intake.
  let companyName: string | null = null;
  if (report.intake_form_id) {
    const { data: intake } = await supabase
      .from("user_intake_forms")
      .select("company_name")
      .eq("id", report.intake_form_id)
      .maybeSingle();
    companyName = intake?.company_name ?? null;
  }

  return {
    report_url: `${frontendUrl}/report/${report.id}`,
    locked_findings: lockedFindings,
    ...(companyName ? { company_name: companyName } : {}),
  };
}

async function fetchDynamicData(
  // Bare `ReturnType<typeof createClient>` resolves the schema generics to
  // `never` under strict Deno type-checking (supabase-js v2 defaults), making
  // every `.from()` result `never` — type loosely like the other functions.
  // deno-lint-ignore no-explicit-any
  supabase: any
): Promise<DynamicData> {
  const defaults: DynamicData = {
    provider_count: "100+",
    featured_case_study_title: "",
    featured_case_study_company: "",
    upcoming_event_title: "",
    upcoming_event_date: "",
    report_count: "",
  };

  try {
    // Run queries in parallel
    const [providerRes, caseStudyRes, eventRes, reportRes] = await Promise.all([
      supabase.from("service_providers").select("id", { count: "exact", head: true }),
      supabase
        .from("content_items")
        .select("id, title, slug")
        .eq("content_type", "case_study")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("events")
        .select("title, date, location")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle(),
      (supabase as any).from("user_reports").select("id", { count: "exact", head: true }),
    ]);

    if (providerRes.count) {
      defaults.provider_count = String(providerRes.count);
    }

    if (caseStudyRes.data) {
      defaults.featured_case_study_title = caseStudyRes.data.title || "";
      // Case studies use content_items — company name may be in content_company_profiles
      const { data: companyProfile } = await supabase
        .from("content_company_profiles")
        .select("company_name")
        .eq("content_id", caseStudyRes.data.id || "")
        .maybeSingle();
      defaults.featured_case_study_company = companyProfile?.company_name || "";
    }

    if (eventRes.data) {
      defaults.upcoming_event_title = eventRes.data.title || "";
      if (eventRes.data.date) {
        const d = new Date(eventRes.data.date);
        defaults.upcoming_event_date = d.toLocaleDateString("en-AU", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }

    if (reportRes.count) {
      defaults.report_count = String(reportRes.count);
    }
  } catch (err) {
    logError("process-email-queue", "Error fetching dynamic data (using defaults)", err);
  }

  return defaults;
}
