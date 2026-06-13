// supabase/functions/_shared/email/components.ts
//
// Reusable, inline-styled, email-safe HTML fragments built from the theme.
// Every component returns a string of HTML with all styles inlined (email
// clients strip <style>/<head>). Deno-free.

import { theme } from "./theme.ts";

const { color, font, radius, size } = theme;

/** Escape a value for safe interpolation into HTML body content. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Sanitise a value for use in a plain-text header (e.g. the subject line). */
export function plainText(value: unknown, fallback = ""): string {
  const s = String(value ?? "").replace(/[\r\n\t]+/g, " ").trim();
  return s.length ? s : fallback;
}

export function h1(textHtml: string): string {
  return `<h1 class="mes-h" style="margin:0 0 16px;font-family:${font.stack};font-size:${size.h1};line-height:1.25;font-weight:700;color:${color.ink};">${textHtml}</h1>`;
}

export function h2(textHtml: string): string {
  return `<h2 class="mes-h" style="margin:0 0 12px;font-family:${font.stack};font-size:${size.h2};line-height:1.3;font-weight:700;color:${color.ink};">${textHtml}</h2>`;
}

export function paragraph(html: string): string {
  return `<p class="mes-t" style="margin:0 0 16px;font-family:${font.stack};font-size:${size.body};line-height:1.6;color:${color.body};">${html}</p>`;
}

/** Bulletproof CTA button (VML for Outlook, padded anchor elsewhere). */
export function button(label: string, href: string, widthPx = 300): string {
  const safeLabel = escapeHtml(label);
  const safeHref = escapeHtml(href);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;">
  <tr><td align="center" bgcolor="${color.primary}" style="border-radius:${radius.button};">
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeHref}" style="height:48px;v-text-anchor:middle;width:${widthPx}px;" arcsize="25%" strokecolor="${color.primary}" fillcolor="${color.primary}">
    <w:anchorlock/>
    <center style="color:#ffffff;font-family:${font.stack};font-size:16px;font-weight:700;">${safeLabel}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-->
    <a href="${safeHref}" style="display:inline-block;padding:14px 28px;font-family:${font.stack};font-size:16px;font-weight:700;line-height:20px;color:#ffffff;text-decoration:none;border-radius:${radius.button};background:${color.primary};mso-hide:all;">${safeLabel}</a>
    <!--<![endif]-->
  </td></tr>
</table>`;
}

/** Soft, rounded callout panel on a light tint (app card style). */
export function infoBox(innerHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;">
  <tr><td class="mes-box" style="background:${color.skyTint};border:1px solid ${color.line};border-radius:${radius.box};padding:20px 22px;">
    ${innerHtml}
  </td></tr>
</table>`;
}

/** Unordered list with brand styling. Items are raw HTML (escape upstream if needed). */
export function bulletList(itemsHtml: string[]): string {
  const lis = itemsHtml
    .map(
      (it) =>
        `<li style="margin:0 0 8px;">${it}</li>`
    )
    .join("");
  return `<ul class="mes-t" style="margin:0 0 16px;padding-left:20px;font-family:${font.stack};font-size:${size.body};line-height:1.6;color:${color.body};">${lis}</ul>`;
}

/** Confident, concise microcopy line with middle-dot separators. */
export function microcopy(parts: string[]): string {
  const joined = parts.map((p) => escapeHtml(p)).join(" &middot; ");
  return `<p class="mes-t" style="margin:0 0 16px;font-family:${font.stack};font-size:${size.small};line-height:1.5;color:${color.muted};">${joined}</p>`;
}

export function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="mes-rule" style="border-top:1px solid ${color.line};font-size:0;line-height:0;height:1px;">&nbsp;</td></tr></table>`;
}

export function spacer(px: number): string {
  return `<div style="line-height:${px}px;height:${px}px;font-size:0;">&nbsp;</div>`;
}
