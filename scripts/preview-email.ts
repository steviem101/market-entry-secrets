// scripts/preview-email.ts
//
// Dev utility: render a transactional email template to HTML for local review.
// Does NOT send anything. Pure render of the shared email module.
//
// Usage:
//   node --experimental-strip-types scripts/preview-email.ts welcome > /tmp/welcome.html
//
// (The shared module is Deno-style .ts; Node strips types and resolves the
//  .ts import specifiers. None of the rendered code uses Deno APIs.)

import { renderEmail } from "../supabase/functions/_shared/email/render.ts";

const SAMPLES: Record<string, Record<string, unknown>> = {
  welcome: { first_name: "Sarah" },
  payment_confirmation: { first_name: "Sarah", tier: "Growth", amount: "490.00", currency: "AUD" },
  report_completed: { first_name: "Sarah", company_name: "Nimbus Robotics", report_url: "https://marketentrysecrets.com/my-reports" },
  nurture_ecosystem: { first_name: "Sarah", provider_count: "240" },
  nurture_case_studies: { first_name: "Sarah", featured_case_study_company: "Atlassian" },
  nurture_ai_report: { first_name: "Sarah", report_count: "1,200" },
  nurture_events: { first_name: "Sarah", upcoming_event_title: "SouthStart 2026", upcoming_event_date: "Wednesday, 9 September 2026" },
  nurture_upgrade: { first_name: "Sarah", current_tier: "free" },
};

const type = process.argv[2] || "welcome";
const data = SAMPLES[type] ?? {};
const result = renderEmail(type, data);

if (!result) {
  process.stderr.write(
    `No code template registered for "${type}" yet. Registered: see render.ts REGISTRY.\n`
  );
  process.exit(1);
}

process.stderr.write(`email_type : ${type}\n`);
process.stderr.write(`subject    : ${result.subject}\n`);
process.stderr.write(`html bytes : ${Buffer.byteLength(result.html, "utf8")}\n`);
process.stdout.write(result.html);
