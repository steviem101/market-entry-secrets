// supabase/functions/_shared/email/templates/nurtureEvents.ts
//
// Nurture drip (marketing, has unsubscribe).
// Variables: first_name, upcoming_event_title, upcoming_event_date.

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
  const titlePlain = plainText(data.upcoming_event_title, "");
  const datePlain = plainText(data.upcoming_event_date, "");
  const titleHtml = escapeHtml(titlePlain);
  const dateHtml = escapeHtml(datePlain);

  const subject = titlePlain
    ? `On your radar: ${titlePlain}${datePlain ? ` · ${datePlain}` : ""}`
    : "Connect with the ANZ market entry community";

  const intro = titlePlain
    ? `Market entry moves faster when you are in the room. ${titleHtml} is coming up${dateHtml ? ` on ${dateHtml}` : ""}, and it is a strong place to meet partners, mentors, and other founders entering ANZ.`
    : "Market entry moves faster when you are in the room. Our upcoming events are a strong place to meet partners, mentors, and other founders entering ANZ.";

  const content =
    h1("Get in the room") +
    paragraph(`Hi ${nameHtml},`) +
    paragraph(intro) +
    button("See upcoming events", `${theme.siteUrl}/events`);

  const html = layout({
    preheader: "Meet partners, mentors, and founders entering ANZ.",
    contentHtml: content,
    unsubscribeUrl: UNSUBSCRIBE_URL,
  });

  return { subject, html };
}
