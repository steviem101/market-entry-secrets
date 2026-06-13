// supabase/functions/_shared/email/theme.ts
//
// Single source of truth for the MES transactional-email design system.
// Values map 1:1 to the app's repo design tokens (src/index.css `--rc-*`),
// which are blue-led. There is intentionally NO teal here.
//
// Deno-free: pure constants, safe to import from a Node preview script.

export const theme = {
  color: {
    primary: "#1AA3E0", // --rc-primary  (buttons, links, accents)
    primary700: "#0F6FA0", // --rc-primary-700 (pressed / gradient end)
    ink: "#102A43", // --rc-ink   (headings, wordmark)
    body: "#41566B", // --rc-body  (body copy)
    muted: "#7387A0", // --rc-muted (footer, hints)
    line: "#E6EDF3", // --rc-line  (borders, dividers)
    canvas: "#F5F8FB", // --rc-canvas (page background, cool off-white)
    skyTint: "#F3FAFE", // --rc-sky-tint (callout / info box bg)
    skySoft: "#E6F4FC", // --rc-sky-soft (badge / chip bg)
    success: "#10B981", // --rc-success
    warning: "#F5A623", // --mes-warning (star / rating accent, sparingly)
    card: "#FFFFFF",
    white: "#FFFFFF",
    // Dark-mode counterparts (used only inside the prefers-color-scheme block)
    darkCanvas: "#0D1B2A",
    darkCard: "#13283D",
    darkInk: "#E8EEF5",
    darkBody: "#AFC0D4",
    darkLine: "#23415C",
  },
  font: {
    // Custom web fonts are unreliable in email; brand font first, system fallback after.
    stack:
      "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    googleHref:
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
  },
  radius: {
    card: "16px",
    button: "12px",
    box: "12px",
    pill: "999px",
  },
  size: {
    width: 600,
    h1: "26px",
    h2: "19px",
    body: "16px",
    small: "13px",
  },
  // Sender identity standard (decided Phase 2: keep .com, friendly hello@ + reply-to).
  sender: {
    from: "Market Entry Secrets <hello@marketentrysecrets.com>",
    replyTo: "stephen@marketentrysecrets.com",
    support: "hello@marketentrysecrets.com",
  },
  brandName: "Market Entry Secrets",
  siteUrl: "https://marketentrysecrets.com",
  // Optimised logo served by the public `email-assets` edge function, which is
  // deploy-independent of the frontend. Mirror committed at public/email/logo.png.
  logoUrl: "https://xhziwveaiuhzdoutpgrh.supabase.co/functions/v1/email-assets/logo.png",
  logoWidth: 220,
} as const;

export type Theme = typeof theme;
