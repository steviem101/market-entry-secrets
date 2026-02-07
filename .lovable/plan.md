

# Replace Beehiiv Embed with Native Email Capture Form

## What's Changing

The Beehiiv newsletter iframe in the footer's "Stay Updated" section will be replaced with your own email capture form -- the same one already used in the hero section. This keeps email leads in your own Supabase database and removes the third-party iframe that looks out of place (as shown in your screenshot).

## Changes

### 1. Footer Component (`src/components/Footer.tsx`)
- Remove the Beehiiv iframe block (the `dangerouslySetInnerHTML` section)
- Import and use `EmailCaptureForm` instead
- Pass a `source` prop of `"footer_newsletter"` so you can distinguish footer signups from hero signups in your database
- The form will be styled compactly to fit the footer column

### 2. EmailCaptureForm Enhancement (`src/components/EmailCaptureForm.tsx`)
- Add an optional `source` prop (defaults to `"homepage_hero"` for backward compatibility)
- Add optional `buttonText` prop so the footer can say "Subscribe" instead of "Uncover Secrets"
- Use the `source` prop in the Supabase insert so you can track where each lead came from

### 3. Remove Beehiiv Scripts (`index.html`)
- Remove the two Beehiiv `<script>` tags (`embed.js` and `attribution.js`) since they are no longer needed anywhere in the app

## Result
- The footer will show a clean email input + "Subscribe" button that matches your site's design
- Emails are saved directly to your `email_leads` table with source `"footer_newsletter"`
- No more third-party iframe or external scripts loading on every page

## Technical Details

**Footer.tsx** -- replace lines 126-142:
- Import `EmailCaptureForm`
- Render `<EmailCaptureForm source="footer_newsletter" buttonText="Subscribe" />`

**EmailCaptureForm.tsx** -- add props:
- `source?: string` (default: `"homepage_hero"`)
- `buttonText?: string` (default: `"Uncover Secrets"`)
- Use `source` in the Supabase `.insert()` call
- Use `buttonText` in the button label

**index.html** -- remove lines 28-29 (the two Beehiiv script tags)

