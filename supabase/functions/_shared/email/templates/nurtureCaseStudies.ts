// supabase/functions/_shared/email/templates/nurtureCaseStudies.ts
//
// Nurture drip (marketing, has unsubscribe).
// Variables: first_name, featured_case_study_company.

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, paragraph, button, escapeHtml, plainText } from "../components.ts";

const UNSUBSCRIBE_URL = `mailto:${theme.sender.support}?subject=Unsubscribe`;

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const nameHtml = escapeHtml(plainText(data.first_name ?? data.USER_NAME, "there"));
  const companyPlain = plainText(data.featured_case_study_company, "a global company");
  const companyHtml = escapeHtml(companyPlain);

  const subject = `How ${companyPlain} entered the Australian market`;

  const content =
    h1("A market entry that worked") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      `The best way to plan your entry is to study one that worked. See how ${companyHtml} approached the Australian market, what they got right, and where the real costs and timelines landed.`
    ) +
    button("Read the case study", `${theme.siteUrl}/case-studies`) +
    paragraph("Real numbers, real decisions, no fluff.");

  const html = layout({
    preheader: "A real market entry: the numbers and the decisions.",
    contentHtml: content,
    unsubscribeUrl: UNSUBSCRIBE_URL,
  });

  return { subject, html };
}
