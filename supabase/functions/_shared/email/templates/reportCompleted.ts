// supabase/functions/_shared/email/templates/reportCompleted.ts
//
// Report ready (transactional, no unsubscribe). Sent by generate-report when a
// report finishes. Two variants keyed by the user's tier at send time (MES-197
// / T16a) so the email continues the journey instead of just announcing it:
//
//   free  → report link + what the locked sections FOUND (counts only, no
//           names — grounding-safe) + one self-serve next step (see pricing).
//   paid  → report link + book-your-included-session (T13 Calendly link) +
//           what's coming to the member hub and when (SLA copy).
//
// Variables: first_name, company_name, report_url, tier, locked_findings
// (Array<{ key, count }> from generate-report). SLA + booking links are sourced
// from the shared fulfilment module (the ONE constant — T16a acceptance).

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, h2, paragraph, button, bulletList, divider, escapeHtml, plainText } from "../components.ts";
import { FULFILMENT, normalizeTier, hubSlaSentence } from "../fulfilment.ts";

export interface RenderResult {
  subject: string;
  html: string;
}

export interface LockedFinding {
  key: string;
  count: number;
}

// Human phrasing for a locked section's match count. Counts only — never names
// (the whole point of gating). Unknown keys fall back to a humanised label.
const LOCKED_LABELS: Record<string, (n: number) => string> = {
  mentor_recommendations: (n) => `${n} mentor${n === 1 ? "" : "s"} matched to your situation`,
  investor_recommendations: (n) => `${n} investor${n === 1 ? "" : "s"} matched to your stage`,
  lead_list: (n) => `${n} lead source${n === 1 ? "" : "s"} for your target buyers`,
  competitor_landscape: (n) => `${n} competitor${n === 1 ? "" : "s"} analysed`,
};

function lockedFindingLabel(key: string, count: number): string {
  const fn = LOCKED_LABELS[key];
  if (fn) return fn(count);
  return `${count} ${key.replace(/_/g, " ")}`;
}

/** Coerce the loosely-typed `locked_findings` payload into clean rows. */
export function parseLockedFindings(raw: unknown): LockedFinding[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      const key = plainText((r as Record<string, unknown>)?.key, "");
      const count = Number((r as Record<string, unknown>)?.count ?? 0);
      return { key, count };
    })
    .filter((r) => r.key && Number.isFinite(r.count) && r.count > 0);
}

export function render(data: Record<string, unknown>): RenderResult {
  const nameHtml = escapeHtml(plainText(data.first_name ?? data.USER_NAME, "there"));
  const companyPlain = plainText(data.company_name, "your company");
  const companyHtml = escapeHtml(companyPlain);
  const reportUrl = plainText(data.report_url, `${theme.siteUrl}/my-reports`);
  const tier = normalizeTier(data.tier);
  const isPaid = tier === "growth" || tier === "scale" || tier === "enterprise";

  const subject = `Your ${companyPlain} market entry report is ready`;

  const intro =
    h1("Your market entry report is ready") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      `Your market entry report for ${companyHtml} is ready. Inside you will find the market landscape, competitor analysis, matched service providers, mentor recommendations, and a step by step action plan.`,
    ) +
    button("View my report", reportUrl);

  let body = "";

  if (isPaid) {
    // Paid variant: booking + what's coming to the hub (SLA). The booking link
    // and SLA both come from the shared fulfilment constant.
    const fulfilment = FULFILMENT[tier];
    if (fulfilment) {
      body =
        divider() +
        h2("Book your included session") +
        paragraph(
          `Your plan includes a session with your advisor — the fastest way to turn the report into a plan. After it, we broker your introductions (made in good faith, never guaranteed).`,
        ) +
        button(fulfilment.bookLabel, fulfilment.calendly) +
        h2("What's coming to your hub") +
        bulletList(fulfilment.whatsComing.map((item) => escapeHtml(item))) +
        paragraph(escapeHtml(hubSlaSentence(tier)));
    } else {
      // Enterprise/bespoke: no self-serve booking link — the account manager
      // drives fulfilment.
      body =
        divider() +
        paragraph(
          "Your enterprise programme is bespoke — your account manager will be in touch to line up your sessions and introductions.",
        );
    }
  } else {
    // Free variant: tease the locked findings by count (no names), then one
    // self-serve next step.
    const findings = parseLockedFindings(data.locked_findings);
    if (findings.length > 0) {
      body =
        divider() +
        h2("What your locked sections found") +
        paragraph(
          "Your report also surfaced matches in sections your current plan keeps locked:",
        ) +
        bulletList(findings.map((f) => escapeHtml(lockedFindingLabel(f.key, f.count)))) +
        paragraph("Unlocking is a one-time upgrade — no subscription.") +
        button("See what unlocking includes", `${theme.siteUrl}/pricing`);
    } else {
      body =
        paragraph(
          "Your report stays in your dashboard, and upgrading unlocks any gated sections instantly.",
        ) +
        button("See what unlocking includes", `${theme.siteUrl}/pricing`);
    }
  }

  const content = intro + body;

  const html = layout({
    preheader: `Your ${companyPlain} report is ready to view.`,
    contentHtml: content,
  });

  return { subject, html };
}
