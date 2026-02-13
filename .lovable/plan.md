

# Claude Code Preprocessor File (CLAUDE.md) for Market Entry Secrets

This will create a single `CLAUDE.md` file at the project root -- the standard preprocessor file that Claude Code reads automatically before every task. It will contain the complete project knowledge, architecture, conventions, database schema, edge function patterns, security constraints, and coding guidelines needed for productive autonomous work on this codebase.

---

## What the file will cover

### 1. Project Identity and Stack
- Market Entry Secrets: B2B SaaS directory + AI report platform for ANZ market entry
- React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui frontend
- Supabase (Lovable Cloud) backend: Postgres, Auth, Edge Functions, Storage
- Stripe payments, Firecrawl scraping, Perplexity research, Lovable AI Gateway (Gemini)

### 2. Critical Build and Type Safety Rules
- The auto-generated `src/integrations/supabase/types.ts` file must never be hand-edited
- When Supabase types don't match runtime tables (e.g. `user_intake_forms`, `user_reports`), cast via `(supabase as any)` -- this is the established pattern throughout `reportApi.ts`
- The `directory_submissions` insert requires exactly `{ submission_type, contact_email, form_data }` -- no extra top-level keys
- Edge functions use Deno runtime with `esm.sh` imports, not npm

### 3. Complete Route Map
All 30+ routes with their page components and purposes.

### 4. Database Schema Reference
All tables grouped by domain (directory, content, auth/user, reports, payments) with key columns and RLS notes.

### 5. Edge Function Inventory
All 10 edge functions with their purpose, auth requirements (`verify_jwt` settings from `config.toml`), and external API dependencies.

### 6. Authentication Architecture
- `AuthProvider` -> `useAuthState` -> `useAuth` hook composition
- `useRoleHelpers` for admin/moderator checks
- `requireAdmin()` shared helper for edge functions
- Database triggers: `handle_new_user` (profile + role), `handle_new_user_subscription` (free tier)

### 7. Report Generation Pipeline
The 5-phase parallel pipeline in `generate-report`:
1. Deep company scrape (Firecrawl map + scrape)
2. Perplexity market research (6 parallel queries)
3. Database directory matching (7 tables)
4. Competitor + end buyer scraping
5. AI section generation (batched) + polish pass

### 8. Subscription and Tier System
- Tiers: free -> growth -> scale -> enterprise
- Legacy mapping: premium -> growth, concierge -> enterprise
- `useSubscription` hook with `canAccessFeature()` and tier hierarchy
- `useCheckout` hook for Stripe checkout flow
- Report section gating via `TIER_REQUIREMENTS` in `ReportView.tsx`

### 9. Coding Conventions and Patterns
- Directory pages: Hero + Filters + Results grid (consistent pattern)
- Hooks per domain: `useEvents`, `useCommunityMembers`, `useSectorEvents`, etc.
- `useMasterSearch` searches 7 tables with ilike queries
- All pages include `Navigation` + `Footer` via `Layout` wrapper + SEO via `react-helmet-async`
- Toast notifications: `useToast` (shadcn) and `sonner` (both are available)
- Edge function shared modules: `_shared/http.ts` (CORS), `_shared/log.ts` (logging), `_shared/auth.ts` (admin check)

### 10. Security Constraints
- RLS policies: admin-only on `email_leads`, `lemlist_*`, `lead_submissions`; own-profile on `profiles`
- Edge functions: JWT verification enabled on all functions via `config.toml`
- `create-checkout`: URL allowlist validation for redirect URLs
- `sync-lemlist`: admin role check via `requireAdmin()`
- Never log PII (emails, tokens) to console

### 11. Environment Secrets Reference
All required secrets: `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_GROWTH_PRICE_ID`, `STRIPE_SCALE_PRICE_ID`, `FIRECRAWL_API_KEY`, `PERPLEXITY_API_KEY`, `LOVABLE_API_KEY`, `FRONTEND_URL`

### 12. Known Gotchas
- `form_data` column is `Json` type -- pass structured objects, not flat form fields at the insert root level
- `user_intake_forms` and `user_reports` tables are not in the auto-generated types -- always use `(supabase as any)` cast
- Stripe webhook uses raw body (`ArrayBuffer` -> `TextDecoder`) for signature verification
- The `callAI` function targets `ai.gateway.lovable.dev` (Lovable AI Gateway), not OpenAI directly
- Freemium gate: 3 free views tracked in localStorage + `user_usage` table; signed-in users bypass

---

## Technical Details

**File:** `CLAUDE.md` (new file at project root)

The file will be approximately 400-500 lines of markdown, structured as a flat reference document optimized for LLM context window consumption. No nested folders or multiple files -- Claude Code reads `CLAUDE.md` automatically.

