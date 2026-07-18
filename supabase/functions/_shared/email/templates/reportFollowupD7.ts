// supabase/functions/_shared/email/templates/reportFollowupD7.ts
//
// Day-7 report follow-up (marketing, has unsubscribe) — conversion plan step 4.
// The reflection-time touch: social proof (a real case study from the
// directory, via process-email-queue's shared dynamic data) + the honest
// purchase-confidence facts, then the pricing comparison. Deliberately does NOT
// re-list the locked counts (D2 did that) — this one answers "is this worth
// paying for" rather than "what is in there".
//
// Variables: first_name, report_url, featured_case_study_title,
// featured_case_study_company (both optional — copy degrades gracefully).

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, paragraph, button, microcopy, escapeHtml, plainText } from "../components.ts";

const UNSUBSCRIBE_URL = `mailto:${theme.sender.support}?subject=Unsubscribe`;

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const nameHtml = escapeHtml(plainText(data.first_name ?? data.USER_NAME, "there"));
  const reportUrl = plainText(data.report_url, `${theme.siteUrl}/my-reports`);
  const csTitle = plainText(data.featured_case_study_title, "");
  const csCompany = plainText(data.featured_case_study_company, "");

  const subject = "How companies like yours entered Australia";

  const caseStudyPara = csTitle
    ? paragraph(
        `Worth a read while you decide: <strong>${escapeHtml(csTitle)}</strong>${
          csCompany ? ` — how ${escapeHtml(csCompany)} made the move` : ""
        }. Every case study on MES is a real company's entry, not a composite.`
      )
    : paragraph(
        "Worth a read while you decide: our case-study library covers real companies' Australian market entries — what worked, what cost them time, and who helped."
      );

  const content =
    h1("A week on from your report") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      "Most teams we work with sit somewhere between “the free report was useful” and “we need the names and the introductions”. If you are weighing that up, three facts that usually decide it:"
    ) +
    paragraph(
      "1. Upgrading is a <strong>one-time payment</strong>, not a subscription.<br/>" +
      "2. Your existing report unlocks <strong>instantly</strong> — nothing regenerates.<br/>" +
      "3. Paid plans include <strong>time with a human advisor</strong>, not just more pages."
    ) +
    caseStudyPara +
    button("See what each plan unlocks", `${theme.siteUrl}/pricing`) +
    paragraph(
      `Or go straight back to <a href="${escapeHtml(reportUrl)}" style="color:${theme.color.primary};">your report</a> — the locked sections show what they found.`
    ) +
    microcopy(["One-time payment", "Secure checkout via Stripe", "No subscription"]);

  const html = layout({
    preheader: "One-time payment, instant unlock, and a human advisor included.",
    contentHtml: content,
    unsubscribeUrl: UNSUBSCRIBE_URL,
  });

  return { subject, html };
}
