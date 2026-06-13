// supabase/functions/_shared/email/layout.ts
//
// Wraps email body content in the full 600px document: head (resets, fonts,
// dark-mode), hidden preheader, light header (logo + thin azure rule), the
// white content card on the off-white canvas, and the brand footer.
// Deno-free.

import { theme } from "./theme.ts";
import { escapeHtml } from "./components.ts";

const { color, font, size, radius } = theme;

export interface LayoutOptions {
  /** Hidden preview text shown in the inbox list. */
  preheader: string;
  /** Pre-rendered HTML for the body of the card. */
  contentHtml: string;
  /** If provided, renders an unsubscribe line (use for marketing/nurture mail). */
  unsubscribeUrl?: string;
}

export function layout({ preheader, contentHtml, unsubscribeUrl }: LayoutOptions): string {
  const year = new Date().getFullYear();
  const unsubHtml = unsubscribeUrl
    ? `<br><a href="${escapeHtml(unsubscribeUrl)}" style="color:${color.muted};text-decoration:underline;">Unsubscribe</a> from these updates at any time.`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(theme.brandName)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <link rel="stylesheet" href="${theme.font.googleHref}">
  <style>
    html, body { margin:0 !important; padding:0 !important; height:100% !important; width:100% !important; }
    * { -ms-text-size-adjust:100%; -webkit-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
    a { color:${color.primary}; }
    body { background:${color.canvas}; }
    @media (prefers-color-scheme: dark) {
      body, .mes-canvas { background:${color.darkCanvas} !important; }
      .mes-card { background:${color.darkCard} !important; }
      .mes-h { color:${color.darkInk} !important; }
      .mes-t { color:${color.darkBody} !important; }
      .mes-box { background:#0F2236 !important; border-color:${color.darkLine} !important; }
      .mes-rule { border-color:${color.darkLine} !important; }
      .mes-foot, .mes-foot * { color:${color.darkBody} !important; }
    }
    @media only screen and (max-width:600px) {
      .mes-card { width:100% !important; border-radius:0 !important; }
      .mes-pad { padding-left:24px !important; padding-right:24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${color.canvas};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${color.canvas};">${escapeHtml(preheader)}&#8204;&nbsp;&#8203;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;</div>
  <table role="presentation" class="mes-canvas" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${color.canvas};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="mes-card" width="${size.width}" cellpadding="0" cellspacing="0" border="0" style="width:${size.width}px;max-width:${size.width}px;background:${color.card};border-radius:${radius.card};overflow:hidden;box-shadow:0 10px 26px rgba(16,42,67,0.06);">
          <!-- azure top accent rule -->
          <tr><td style="height:3px;line-height:3px;font-size:0;background:${color.primary};">&nbsp;</td></tr>
          <!-- header / logo -->
          <tr>
            <td align="center" style="padding:28px 32px 8px;">
              <a href="${theme.siteUrl}" style="text-decoration:none;">
                <img src="${theme.logoUrl}" width="${theme.logoWidth}" alt="${escapeHtml(theme.brandName)}" class="mes-h" style="display:block;border:0;max-width:${theme.logoWidth}px;height:auto;font-family:${font.stack};font-size:20px;font-weight:700;color:${color.ink};">
              </a>
            </td>
          </tr>
          <!-- content -->
          <tr>
            <td class="mes-pad" style="padding:16px 40px 8px;">
              ${contentHtml}
            </td>
          </tr>
          <!-- in-card footer rule + spacing -->
          <tr><td style="padding:8px 40px 28px;"></td></tr>
        </table>
        <!-- footer on canvas -->
        <table role="presentation" width="${size.width}" cellpadding="0" cellspacing="0" border="0" style="width:${size.width}px;max-width:${size.width}px;">
          <tr>
            <td class="mes-foot mes-pad" style="padding:20px 40px;text-align:center;font-family:${font.stack};font-size:${size.small};line-height:1.6;color:${color.muted};">
              <strong style="color:${color.muted};">${escapeHtml(theme.brandName)}</strong><br>
              Helping global companies enter the Australian and ANZ market.<br>
              Just reply to this email and it reaches our team.${unsubHtml}
              <br><br>
              <span style="color:${color.muted};">&copy; ${year} ${escapeHtml(theme.brandName)} &middot; <a href="${theme.siteUrl}" style="color:${color.muted};text-decoration:underline;">marketentrysecrets.com</a></span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
