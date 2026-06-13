// supabase/functions/_shared/email/templates/nurtureEcosystem.ts
//
// Nurture drip (marketing, has unsubscribe). Variables: first_name, provider_count.

import { theme } from "../theme.ts";
import { layout } from "../layout.ts";
import { h1, paragraph, button, escapeHtml, plainText } from "../components.ts";

const UNSUBSCRIBE_URL = `mailto:${theme.sender.support}?subject=Unsubscribe`;

export interface RenderResult {
  subject: string;
  html: string;
}

export function render(data: Record<string, unknown>): RenderResult {
  const namePlain = plainText(data.first_name ?? data.USER_NAME, "");
  const nameHtml = escapeHtml(namePlain || "there");
  const countPlain = plainText(data.provider_count, "100+");
  const countHtml = escapeHtml(countPlain);

  const subject = namePlain
    ? `${namePlain}, ${countPlain} vetted ANZ partners are waiting`
    : `${countPlain} vetted ANZ partners are waiting`;

  const content =
    h1("Meet your ANZ partners") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(
      `Finding the right local partner is usually the slowest part of market entry. We have done the vetting for you: ${countHtml} service providers across legal, tax, recruitment, marketing, and operations, each profiled so you can shortlist fast.`
    ) +
    button("Browse service providers", `${theme.siteUrl}/service-providers`) +
    paragraph("Filter by sector, location, and service to find the few that fit.");

  const html = layout({
    preheader: "Vetted ANZ service providers, ready to shortlist.",
    contentHtml: content,
    unsubscribeUrl: UNSUBSCRIBE_URL,
  });

  return { subject, html };
}
