# MES-33 Track B — Supabase Dashboard Runbook (human-executed)

> Companion to `docs/audits/AUTH-JOURNEY-AUDIT.md` (§5, §6, §8). These are the
> P0/P1 items that can **only** be done in the Supabase dashboard / Google
> Cloud / Azure AD — none of them can ship from this repo. Execute top to
> bottom; each step lists exact fields and values, plus a verification check.
> The values here match the version-controlled `[auth]` block in
> `supabase/config.toml` (MES-33j) — keep the two in lockstep.
>
> Project: **MES Platform** `xhziwveaiuhzdoutpgrh`
> Dashboard: https://supabase.com/dashboard/project/xhziwveaiuhzdoutpgrh

---

## MES-33a (P0) — Site URL + redirect allow-list

Fixes: magic-link, password-reset, confirm-signup, and OAuth returns all
landing on the Lovable preview instead of the customer domain (audit §5).

**Where:** Authentication → URL Configuration

1. **Site URL** → `https://marketentrysecrets.com`
   (must never be a `*.lovable.app` origin — it is the fallback for any
   redirect not on the allow-list, which is exactly how links ended up on
   Lovable.)
2. **Redirect URLs** — replace the list with these exact entries:
   - `https://marketentrysecrets.com/auth/callback`
   - `https://marketentrysecrets.com/reset-password`
   - `https://www.marketentrysecrets.com/auth/callback`
   - `https://www.marketentrysecrets.com/reset-password`
   - `https://market-entry-secrets.lovable.app/auth/callback` *(only while
     Lovable previews are still used for QA — remove when retired)*
   - `https://market-entry-secrets.lovable.app/reset-password` *(same)*

   Keep entries explicit; avoid `**` wildcards.

**Risk / timing:** changing Site URL can disrupt in-flight auth links (old
emails will still point wherever they pointed). Do it in a quiet window.

**Verify:**
- From `https://marketentrysecrets.com`, request a magic link → the email
  link must open `marketentrysecrets.com/auth/callback` and land you back on
  the page you started from (returnTo shipped in MES-33g).
- Request a password reset → link opens `marketentrysecrets.com/reset-password`.
- Sign up with a fresh email → confirmation link lands on the prod domain.

---

## MES-33b (P0) — Google + Microsoft (Azure) OAuth providers

Fixes: "social login is buggy / lands wrong" (audit §6). The critical detail:
the provider consoles must whitelist the **Supabase** callback, not the app's
`/auth/callback` — the app route is only the final hop.

**Supabase callback URL (used in both consoles):**
`https://xhziwveaiuhzdoutpgrh.supabase.co/auth/v1/callback`

### Google
1. Google Cloud Console → APIs & Services → Credentials → the OAuth 2.0
   Client used for MES.
2. **Authorized redirect URIs** → add the Supabase callback above.
3. Copy the **Client ID** and **Client secret**.
4. Supabase → Authentication → Providers → **Google**: paste ID + secret,
   toggle **Enabled**.

### Microsoft (Azure)
1. Azure Portal → Microsoft Entra ID → App registrations → the MES app
   (create one if it doesn't exist).
2. Authentication → **Redirect URIs** (type *Web*) → add the Supabase
   callback above.
3. Certificates & secrets → create a **client secret**; note its expiry and
   diarise rotation.
4. API permissions → ensure delegated Microsoft Graph scopes: `email`,
   `openid`, `profile`.
5. Supabase → Authentication → Providers → **Azure**: Application (client)
   ID, the client secret **value** (not its ID), and the tenant URL —
   `https://login.microsoftonline.com/<tenant-id>` (or `.../common` for
   multi-tenant). Toggle **Enabled**.

**Risk / timing:** do this in a maintenance window; email/password sign-in
stays available as the fallback throughout (nothing in Track A removed it).

**Verify:** from the prod domain, "Continue with Google" and "Continue with
Microsoft" both complete and return to the page the dialog was opened on.
Check a brand-new OAuth user gets `profiles` + `user_roles` + free
`user_subscriptions` rows (signup triggers).

---

## MES-33c (P1) — Brand the auth emails

The branded email system (`supabase/functions/_shared/email/`) covers only
transactional Resend emails; the magic-link / confirm-signup / reset emails
are Supabase's unstyled defaults.

**Preferred: Resend custom SMTP** (matches the existing blue-branded module
and sender domain):
1. Resend → SMTP credentials for the MES sending domain.
2. Supabase → Project Settings → Authentication → **SMTP Settings**: enable
   custom SMTP; host `smtp.resend.com`, port `465`, user `resend`, password =
   Resend API key; sender = the address already used by `send-email`
   (check `RESEND_API_KEY` sender config).
3. Authentication → **Email Templates** → restyle *Magic Link*, *Confirm
   signup*, *Reset password* with the blue brand (mirror
   `_shared/email/theme`; logo served by the `email-assets` function).

**Verify:** trigger each of the three emails; check branding and that links
point at `marketentrysecrets.com` (depends on MES-33a). Once template HTML is
final, commit copies under version control and wire
`[auth.email.template.*] content_path` entries into `supabase/config.toml`
(follow-up to MES-33j / PR #275).

---

## MES-33n (P1) — Leaked-password protection + min length

**Where:** Authentication → Policies (a.k.a. Auth → Configuration → Passwords)

1. Enable **Leaked password protection** (HaveIBeenPwned check).
2. **Minimum password length** → `8` (client already enforces 8 since #255).

**Verify:** attempt signup with a known-breached password (e.g.
`password123`) → rejected; 7-char password → rejected server-side.

---

## MES-33o (P1) — Email OTP / magic-link expiry

**Where:** Authentication → Providers → Email

- **OTP expiry** → `3600` seconds (1 hour) or lower. Anything above 3600
  re-triggers the `auth_otp_long_expiry` advisor lint.

**Verify:** Advisors page (Security) no longer shows `auth_otp_long_expiry`.

---

## MES-33p (P2) — Postgres security-patch upgrade

**Where:** Project Settings → Infrastructure

- Current `supabase-postgres-17.4.1.041` has outstanding security patches
  (`vulnerable_postgres_version` advisor hit). Schedule the in-place upgrade
  in a maintenance window (expect a few minutes of downtime; take a backup /
  PITR point first).

**Verify:** advisor hit clears; app smoke test (sign-in, report view,
checkout) after the upgrade.

---

## Also flagged for a decision (found during Track A, 2026-07-04)

**Migration-ledger drift on the three Lovable-applied migrations.** Prod's
ledger records apply-time versions that don't match the committed filenames
(`20260704150001` vs file `20260704145954`, `20260704155258` vs `…155252`,
`20260704164219` vs `…164214`). Harmless today (the GitHub integration pushes
only new files), but any future `supabase db push` from a laptop will see
mismatched local/remote histories and demand `supabase migration repair`.
Repairing the ledger is an out-of-band prod operation — do it deliberately,
not from an agent session. See CLAUDE.md §2 migration hygiene.

## Sequencing

1. MES-33a (Site URL / allow-list) — unblocks everything link-related.
2. MES-33b (OAuth) — needs 33a in place to return to the right origin.
3. MES-33n + MES-33o — independent toggles, do any time.
4. MES-33c (email branding) — after 33a so test links land on prod.
5. MES-33p — separate maintenance window.
