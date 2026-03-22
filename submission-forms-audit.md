# Submission Forms Audit — Market Entry Secrets

> **Date:** 2026-03-22 | **Phase:** 1 & 2 (Read-Only Audit + Recommendations) | **Status:** Complete

---

## 1. Form Inventory

### 1.1 Summary Table

| # | Form Name | Section/Page | Trigger CTA | Field Count | Required Fields | Destination Table | Post-Submit UX | Admin Visibility | Status Field |
|---|-----------|-------------|-------------|-------------|-----------------|-------------------|----------------|------------------|-------------|
| 1 | **Email Capture** | Homepage hero, various CTAs | "Uncover Secrets" | 1 | 1 | `lead_submissions` | Toast + reset | Admin-only SELECT | `status` (default: `new`) |
| 2 | **Directory: Mentor** | Community, Mentors pages | "Become a Mentor" | 8 | 4 (name, email, location, experience) | `directory_submissions` | Toast + close | SELECT blocked (`USING(false)`) | `status` (default: `pending`) |
| 3 | **Directory: Service Provider** | Service Providers page | "List Your Service" | 8 | 5 (name, email, location, org, services) | `directory_submissions` | Toast + close | SELECT blocked | `status` (default: `pending`) |
| 4 | **Directory: Event** | Events page | "Submit Event" | 13 | 8 (name, email, location, title, date, time, category, org) | `directory_submissions` | Toast + close | SELECT blocked | `status` (default: `pending`) |
| 5 | **Directory: Content** | Content page | "Submit Content" | 10 | 7 (name, email, location, title, org, industry, category, story, outcomes) | `directory_submissions` | Toast + close | SELECT blocked | `status` (default: `pending`) |
| 6 | **Directory: Case Study** | Case Studies page | "Submit Case Study" | 21 | 10 (name, email, location, title, org, industry, origin, entry date, outcome, founder name, story, outcomes) | `directory_submissions` | Toast + close | SELECT blocked | `status` (default: `pending`) |
| 7 | **Directory: Guide** | Content page | "Submit Guide" | 13 | 6 (name, email, location, title, category, body, experience) | `directory_submissions` | Toast + close | SELECT blocked | `status` (default: `pending`) |
| 8 | **Directory: Data Request** | Leads page | "Request Data" | 11 | 7 (name, email, location, org, industry, target, data reqs, use case) | `directory_submissions` | Toast + close | SELECT blocked | `status` (default: `pending`) |
| 9 | **Directory: Trade Agency** | Trade & Investment page | "Submit Your Organisation" | 8 | 5 (name, email, location, org, services) | `directory_submissions` | Toast + close | SELECT blocked | `status` (default: `pending`) |
| 10 | **Directory: Innovation Org** | Innovation Ecosystem page | "Join the Ecosystem" | 8 | 5 (name, email, location, org, services) | `directory_submissions` | Toast + close | SELECT blocked | `status` (default: `pending`) |
| 11 | **Directory: Investor** | Investors page | "Submit Investor" | 8 | 5 (name, email, location, org, services) | `directory_submissions` | Toast + close | SELECT blocked | `status` (default: `pending`) |
| 12 | **Mentor Contact** | Mentor detail cards | "Send Request" | 5 | 3 (name, email, message) | `mentor_contact_requests` → fallback `directory_submissions` | Toast + close | Unknown (cast table) | None |
| 13 | **Event Submission (Direct)** | Events page (alternate) | "Submit Event" (blue +) | 10 | 9 (title, desc, date, time, location, type, category, attendees, organizer) | `events` (direct insert) | Toast + close | Public table | None (goes live immediately) |
| 14 | **Contact Page** | `/contact` | "Send Message" | 7 | 4 (first name, last name, email, subject, message) | **NOWHERE** (toast only) | Toast + reset | None | N/A |
| 15 | **Report Creator** | `/report-creator` | "Generate Report" | 15-20 (across 3 steps) | ~8 | `user_intake_forms` → `user_reports` | Redirect to report | Owner-only | `status` (pending→completed/failed) |

---

## 2. Data Flow Diagrams

### 2.1 Directory Submissions (Forms #2–11)

```
[User clicks CTA button on directory page]
    ↓
[SubmissionButton.tsx] → opens SubmissionModal
    ↓
[SubmissionModal.tsx] → renders BaseFormFields + type-specific fields
    ↓
[handleSubmit()] → builds { submission_type, contact_email, form_data: { submission_version: 2, content_type, ...allFields } }
    ↓
[supabase.from('directory_submissions').insert()]
    ↓
[Supabase RLS: INSERT allowed for anyone (WITH CHECK true)]
    ↓
[Row created with status='pending', auto timestamps]
    ↓
[Toast: "Submission Successful!" → form reset → modal close]
    ↓
[NO admin notification, NO email confirmation, NO admin can view (SELECT blocked)]
```

### 2.2 Email Capture (Form #1)

```
[User enters email in hero section]
    ↓
[EmailCaptureForm.tsx] → validates email format
    ↓
[supabase.from('lead_submissions').insert([{ email, source }])]
    ↓
[Supabase RLS: INSERT allowed for anyone]
    ↓
[Toast: "Thank you! We'll be in touch soon" → reset after 3s]
    ↓
[Admin can view via has_role() check]
```

**Note:** The `lead_submissions` table has columns `phone`, `sector`, `target_market` (all NOT NULL) but `EmailCaptureForm` only sends `email` and `source`. This insert likely fails silently or Supabase provides defaults. This is a potential bug.

### 2.3 Mentor Contact (Form #12)

```
[User clicks contact button on mentor card]
    ↓
[MentorContactModal.tsx] → 5-field form
    ↓
[handleSubmit()] → try insert to mentor_contact_requests (via (supabase as any))
    ↓
[If error (table may not exist)] → fallback to directory_submissions with type="mentor_contact"
    ↓
[Toast: "Contact request sent!" → reset → close]
    ↓
[NO email sent to mentor, NO notification system]
```

**Bug:** The fallback inserts `submission_type: "mentor_contact"` but the `directory_submissions` CHECK constraint only allows: `mentor`, `service_provider`, `trade_agency`, `innovation_organization`, `event`, `content`, `case_study`, `guide`, `data_request`. `"mentor_contact"` will be rejected by the CHECK constraint.

### 2.4 Direct Event Submission (Form #13)

```
[User clicks blue "Submit Event" button with + icon]
    ↓
[EventSubmissionForm.tsx] → Zod-validated form
    ↓
[onSubmit()] → generates slug → supabase.from('events').insert()
    ↓
[Row goes LIVE immediately in events table — NO review, NO pending status]
    ↓
[Toast: "Event submitted successfully" → reset → close]
```

**Security concern:** This bypasses any review process. Events go directly into the public `events` table. Check if RLS restricts INSERT to authenticated users.

### 2.5 Contact Page (Form #14)

```
[User fills out contact form on /contact page]
    ↓
[handleSubmit()] → toast.success("Message sent!") → form reset
    ↓
[DATA GOES NOWHERE — no backend integration]
```

### 2.6 Report Creator (Form #15)

```
[User completes 3-step intake wizard]
    ↓
[IntakeStep3 → onSubmit()]
    ↓
[reportApi.submitIntakeForm()] → (supabase as any).from('user_intake_forms').insert()
    ↓
[reportApi.generateReport()] → supabase.functions.invoke('generate-report')
    ↓
[Edge function: 5-phase pipeline → saves to user_reports]
    ↓
[Redirect to /report/:reportId]
```

---

## 3. Consistency Analysis

### 3.1 Field Count Comparison

| Form Type | Total Fields | Required | Optional | Required:Optional Ratio |
|-----------|-------------|----------|----------|------------------------|
| Email Capture | 1 | 1 | 0 | 1:0 |
| Mentor Contact | 5 | 3 | 2 | 3:2 |
| Mentor Application | 8 | 4 | 4 | 1:1 |
| Service Provider | 8 | 5 | 3 | 5:3 |
| Trade Agency | 8 | 5 | 3 | 5:3 |
| Innovation Org | 8 | 5 | 3 | 5:3 |
| Investor | 8 | 5 | 3 | 5:3 |
| Event Submission | 13 | 8 | 5 | 8:5 |
| Content/Story | 10 | 7 | 3 | 7:3 |
| Data Request | 11 | 7 | 4 | 7:4 |
| Guide | 13 | 6 | 7 | 6:7 |
| Case Study | **21** | **10** | 11 | 10:11 |
| Contact Page | 7 | 4 | 3 | 4:3 |
| Event (Direct) | 10 | 9 | 1 | 9:1 |

**Key finding:** The Case Study form at 21 fields is by far the longest. Most directory forms share a 4-field base (name, email, phone, location) but diverge significantly after that.

### 3.2 Shared vs Unique Fields

**Shared across ALL directory forms (BaseFormFields):**
- `name` (required) — Full Name
- `email` (required) — Email Address
- `phone` (optional) — Phone Number
- `location` (required) — City, Country

**Shared across MOST directory forms:**
- `organization` — Company/org name (required for all except mentor)
- `website` — URL (optional everywhere)

**Unique per form type:**
- Event: `eventTitle`, `eventDate`, `eventTime`, `eventCategory`, `expectedAttendees`, `eventLogoUrl`
- Content: `contentTitle`, `contentCategory`, `successStory`, `outcomes`, `industry`
- Case Study: `originCountry`, `entryDate`, `outcomeResult`, `monthlyRevenue`, `startupCosts`, `businessModel`, `founderName`, `founderTitle`, `founderLinkedin`, `employeeCount`, `founderCount`
- Guide: `guideTitle`, `guideSubtitle`, `guideBody`, `guideSectorTags`
- Data Request: `businessSize`, `targetMarket`, `dataRequirements`, `useCase`

### 3.3 Layout/UX Pattern Differences

| Pattern | Forms Using It |
|---------|---------------|
| BaseFormFields at top → type-specific below | All directory forms |
| Section headers with dividers | Case Study, Guide, Default (Mentor/SP/etc.) |
| No section headers | Event, Content, Data Request |
| 2-column grid layout | All (via BaseFormFields) |
| Zod validation | Event (Direct) only |
| HTML5 required attribute | All directory forms |
| Select dropdowns | Event, Content, Case Study, Guide, Data Request |
| Textarea fields | All except Email Capture |
| Dynamic field arrays | None (only in Report Creator intake) |

### 3.4 Inconsistencies Found

1. **Two competing event submission forms:** `EventFormFields.tsx` (via SubmissionModal → `directory_submissions` with review) and `EventSubmissionForm.tsx` (direct insert to `events` table, no review)
2. **Validation approach:** Directory forms use HTML5 `required` attributes only. Event (Direct) uses Zod. Report Creator uses Zod. No consistent pattern.
3. **Toast library:** Directory forms use `useToast` (shadcn). Contact page uses `sonner` (`toast()`). Both available but mixed.
4. **Form state management:** Directory forms use `useState` with `FormData` interface. Report Creator uses `react-hook-form`. Mentor Contact uses `useState` with inline object. No consistent pattern.
5. **The `FormData` interface** has an index signature `[key: string]: string` making all values strings — even `expectedAttendees` and `founderCount` which should be numbers.

---

## 4. Gap Analysis

### 4.1 Forms That Submit to Nowhere

| Form | Issue | Severity |
|------|-------|----------|
| **Contact Page** (`/contact`) | `handleSubmit` only shows a toast — no Supabase insert, no email, no edge function. User data is lost. | **Critical** |

### 4.2 Broken or Risky Submissions

| Form | Issue | Severity |
|------|-------|----------|
| **Mentor Contact fallback** | Inserts `submission_type: "mentor_contact"` which violates the `directory_submissions` CHECK constraint (not in allowed values). Fallback will always fail. | **Critical** |
| **EmailCaptureForm → lead_submissions** | Table has NOT NULL columns (`phone`, `sector`, `target_market`) but form only sends `email` and `source`. Insert may fail unless DB has defaults. | **High** |
| **Event (Direct)** | Inserts directly into `events` table — no review, no pending status. Events go live immediately. Need to verify INSERT RLS. | **High** |
| **eventLogoUrl field** | Used in `EventFormFields.tsx` but NOT defined in the `FormData` interface in `types.ts`. TypeScript may not catch this due to index signature `[key: string]: string`. | **Medium** |

### 4.3 Missing Admin Review Capability

| Gap | Detail |
|-----|--------|
| **No admin dashboard** | No `/admin` route, no admin page components exist |
| **directory_submissions SELECT is blocked** | RLS policy uses `USING(false)` — even admins cannot query submissions. Comment says "Will be updated when admin roles are implemented" but never was. |
| **No status update mechanism** | `status` column exists (default: `pending`) but no API, UI, or edge function can change it |
| **No moderation workflow** | No approve/reject flow, no way to move submissions into live directory tables |

### 4.4 Missing Notifications

| Missing Notification | Impact |
|---------------------|--------|
| **No email to submitter** | User submits a form and gets only a toast. No email confirmation, no reference number, no "what happens next" communication. |
| **No email to admin** | No one is notified when new submissions arrive. They sit in a table no one can query. |
| **Mentor contact doesn't reach mentor** | User thinks they contacted a mentor, but the message goes to a DB table. The mentor never sees it. |
| **Email service not configured** | `send-lead-followup` edge function has a TODO comment: "Integrate with an email service (Resend, SendGrid, Amazon SES)". Returns `email_sent: false`. |

### 4.5 Tables With Submission Columns But No Corresponding Form

| Table | Observation |
|-------|-------------|
| `email_leads` | Has `email`, `source`, `created_at` but **no form writes to this table**. The `EmailCaptureForm` writes to `lead_submissions` instead. Possible dead/legacy table. |
| `mentor_contact_requests` | Referenced in `MentorContactModal` via `(supabase as any)` cast, but table may not exist (uses defensive fallback). Not in auto-generated types. |

### 4.6 Hardcoded Dropdown Options (Should Be Database-Driven)

| Component | Hardcoded Values |
|-----------|-----------------|
| `EventFormFields.tsx` | Event categories: networking, conference, workshop, seminar, trade_show, other |
| `ContentFormFields.tsx` | Content categories: market_entry, expansion, partnership, regulatory, funding, other |
| `CaseStudyFormFields.tsx` | Outcome: successful, unsuccessful |
| `CaseStudyFormFields.tsx` | Business model: subscription, one-time, freemium, marketplace, saas, ecommerce, services, other |
| `GuideFormFields.tsx` | Guide categories: market_entry, legal_compliance, business_expansion, regulatory, funding, best_practices, other |
| `DataRequestFormFields.tsx` | Business size: startup (1-10), small (11-50), medium (51-200), large (200+) |
| `Contact.tsx` | Inquiry type: general, enterprise, partnership, support |

### 4.7 Security Concerns

| Concern | Detail | Severity |
|---------|--------|----------|
| **Unauthenticated inserts** | `directory_submissions`, `lead_submissions`, and `email_leads` all allow public INSERT via `WITH CHECK (true)`. No rate limiting, no CAPTCHA, no bot protection. Vulnerable to spam. | **High** |
| **Direct event insert** | `EventSubmissionForm.tsx` inserts directly to the `events` table. If INSERT RLS is open, anyone can add events to the public listing without review. | **High** |
| **No input sanitization** | Form data is inserted as-is into JSONB `form_data`. No XSS sanitization on text fields before storage. Risk if form_data is rendered without escaping. | **Medium** |

---

## 5. Field-by-Field Assessment

### 5.1 Mentor Application (8 fields)

| Field | Current | Recommendation | Rationale |
|-------|---------|---------------|-----------|
| name | Required | **Keep required** | Essential |
| email | Required | **Keep required** | Essential for follow-up |
| phone | Optional | **Remove from initial form** | Can collect later |
| location | Required | **Keep required** | Relevant for matching |
| organization | Optional | **Move to Phase 2** | Nice to have, not blocking |
| website | Optional | **Move to Phase 2** | Can collect later |
| services/expertise | Optional (mentor) | **Keep required** — rename to "Areas you can mentor in" | Core value prop |
| experience | Required | **Simplify** — change to short bio (3 lines max) | Too intimidating as-is |

**Recommended MVP:** 4 fields — name, email, location, expertise areas

### 5.2 Service Provider / Trade Agency / Innovation Org / Investor (8 fields each)

| Field | Current | Recommendation |
|-------|---------|---------------|
| name | Required | **Keep required** |
| email | Required | **Keep required** |
| phone | Optional | **Remove from initial form** |
| location | Required | **Keep required** |
| organization | Required | **Keep required** |
| website | Optional | **Keep optional** — useful for enrichment |
| services | Required | **Keep required** — core info |
| description | Optional | **Move to Phase 2** |

**Recommended MVP:** 5 fields — name, email, location, organization, services

### 5.3 Event Submission (13 fields)

| Field | Current | Recommendation |
|-------|---------|---------------|
| name | Required | **Keep required** |
| email | Required | **Keep required** |
| phone | Optional | **Remove** |
| location | Required | **Keep required** (repurpose as event venue) |
| eventTitle | Required | **Keep required** |
| eventDate | Required | **Keep required** |
| eventTime | Required | **Make optional** — many events don't have confirmed times |
| expectedAttendees | Optional | **Move to Phase 2** |
| eventCategory | Required | **Keep required** |
| organization | Required | **Keep required** |
| website | Optional | **Keep optional** |
| eventLogoUrl | Optional | **Remove** — broken field, not in types.ts |
| description | Required | **Keep required** but shorten placeholder |

**Recommended MVP:** 7 fields — name, email, eventTitle, eventDate, eventCategory, organization, description

### 5.4 Content / Success Story (10 fields)

| Field | Current | Recommendation |
|-------|---------|---------------|
| name | Required | **Keep required** |
| email | Required | **Keep required** |
| phone | Optional | **Remove** |
| location | Required | **Make optional** |
| contentTitle | Required | **Keep required** |
| organization | Required | **Keep required** |
| industry | Required | **Keep required** |
| contentCategory | Required | **Keep required** |
| website | Optional | **Move to Phase 2** |
| successStory | Required | **Keep required** |
| outcomes | Required | **Move to Phase 2** — can be added during editorial review |

**Recommended MVP:** 6 fields — name, email, contentTitle, organization, contentCategory, successStory

### 5.5 Case Study (21 fields — the worst offender)

| Field | Current | Recommendation |
|-------|---------|---------------|
| name | Required | **Keep required** |
| email | Required | **Keep required** |
| phone | Optional | **Remove** |
| location | Required | **Remove** — redundant with originCountry |
| contentTitle | Required | **Keep required** |
| organization | Required | **Keep required** |
| industry | Required | **Keep required** |
| originCountry | Required | **Keep required** |
| targetMarket | Disabled (always "Australia") | **Remove entirely** — adds no value |
| entryDate | Required | **Make optional** — Phase 2 |
| outcomeResult | Required | **Keep required** — core differentiator |
| website | Optional | **Move to Phase 2** |
| monthlyRevenue | Optional | **Move to Phase 2** — sensitive, discourages submission |
| startupCosts | Optional | **Move to Phase 2** |
| businessModel | Optional | **Move to Phase 2** |
| founderCount | Optional | **Remove** — low value |
| employeeCount | Optional | **Remove** — low value |
| founderName | Required | **Remove** — redundant with `name` field |
| founderTitle | Optional | **Move to Phase 2** |
| founderLinkedin | Optional | **Move to Phase 2** |
| successStory | Required | **Keep required** |
| outcomes | Required | **Move to Phase 2** |

**Recommended MVP:** 7 fields — name, email, contentTitle, organization, industry, originCountry, outcomeResult, successStory

**This form should drop from 21 to 8 fields (62% reduction).**

### 5.6 Guide (13 fields)

| Field | Current | Recommendation |
|-------|---------|---------------|
| name | Required | **Keep required** |
| email | Required | **Keep required** |
| phone | Optional | **Remove** |
| location | Required | **Make optional** |
| guideTitle | Required | **Keep required** |
| guideSubtitle | Optional | **Move to Phase 2** |
| contentCategory | Required | **Keep required** |
| guideSectorTags | Optional | **Move to Phase 2** |
| guideBody | Required | **Keep required** — core content |
| organization | Optional | **Move to Phase 2** |
| website | Optional | **Move to Phase 2** |
| experience | Required | **Move to Phase 2** — intimidating upfront |

**Recommended MVP:** 5 fields — name, email, guideTitle, contentCategory, guideBody

### 5.7 Data Request (11 fields)

| Field | Current | Recommendation |
|-------|---------|---------------|
| name | Required | **Keep required** |
| email | Required | **Keep required** |
| phone | Optional | **Remove** |
| location | Required | **Make optional** |
| organization | Required | **Keep required** |
| businessSize | Required | **Move to Phase 2** |
| industry | Required | **Keep required** |
| targetMarket | Required | **Keep required** |
| website | Optional | **Move to Phase 2** |
| dataRequirements | Required | **Keep required** — core request |
| useCase | Required | **Move to Phase 2** |

**Recommended MVP:** 5 fields — name, email, organization, industry, dataRequirements

### 5.8 Mentor Contact (5 fields)

| Field | Current | Recommendation |
|-------|---------|---------------|
| name | Required | **Keep required** |
| email | Required | **Keep required** |
| company | Optional | **Keep optional** |
| country | Optional | **Remove** — low value for a contact request |
| message | Required | **Keep required** |

**Already lean.** Consider pre-filling name/email from auth profile.

### 5.9 Contact Page (7 fields)

| Field | Current | Recommendation |
|-------|---------|---------------|
| firstName | Required | **Keep required** |
| lastName | Required | **Make optional** |
| email | Required | **Keep required** |
| company | Optional | **Keep optional** |
| inquiryType | Optional | **Keep optional** |
| subject | Required | **Remove** — inquiryType covers this |
| message | Required | **Keep required** |

**Recommended MVP:** 4 fields — name (single field), email, inquiryType, message. **But first: actually connect it to a backend.**

---

## Phase 2: Recommendations

### 6. Universal Submission Pattern

#### 6.1 Proposed Reusable Component: `<SubmissionForm>`

All forms should follow a consistent 3-zone layout:

```
┌─────────────────────────────────────────┐
│  HEADER                                 │
│  Title + 1-line description             │
├─────────────────────────────────────────┤
│  ZONE 1: Core Fields (3-5 max)          │
│  ┌─────────────┐ ┌─────────────┐       │
│  │ Name        │ │ Email       │       │
│  └─────────────┘ └─────────────┘       │
│  ┌─────────────────────────────┐       │
│  │ [Type-specific required #1] │       │
│  └─────────────────────────────┘       │
│  ┌─────────────────────────────┐       │
│  │ [Type-specific required #2] │       │
│  └─────────────────────────────┘       │
├─────────────────────────────────────────┤
│  ▶ Add more details (collapsible)       │
│  ZONE 2: Optional/Progressive Fields    │
│  (hidden by default, expands on click)  │
├─────────────────────────────────────────┤
│  ZONE 3: Actions                        │
│  [Cancel]              [Submit ▶]       │
│  "We'll review and respond within 48h"  │
└─────────────────────────────────────────┘
```

#### 6.2 Standard Post-Submit Flow

1. **Immediate:** Toast notification with submission reference (e.g., "Submission #SUB-2026-0042 received")
2. **Modal transforms:** Instead of closing, show a confirmation state inside the modal:
   - Checkmark animation
   - "What happens next" text: "Our team reviews submissions within 48 hours. You'll receive an email at {email} when your submission is approved."
   - "Close" button
3. **Email confirmation** (when email service is configured): Send to submitter with reference number and expected timeline
4. **Admin notification** (when email service is configured): Alert admin of new submission with link to review

#### 6.3 Submission Status Model

```
submitted → in_review → approved → published
                      → rejected (with reason)
                      → needs_info (request more details from submitter)
```

#### 6.4 Smart Defaults

- **Pre-fill from auth profile:** If user is logged in, auto-fill `name`, `email`, `location`, `organization` from `profiles` table
- **Remember last submission:** Store non-sensitive form data in localStorage for repeat submitters
- **Browser geolocation:** Suggest location based on browser (with user consent)

---

### 7. Per-Form Recommended Field Counts

| Form | Current Fields | Recommended MVP | Reduction |
|------|---------------|-----------------|-----------|
| Mentor Application | 8 | 4 | 50% |
| Service Provider | 8 | 5 | 37% |
| Trade Agency | 8 | 5 | 37% |
| Innovation Org | 8 | 5 | 37% |
| Investor | 8 | 5 | 37% |
| Event | 13 | 7 | 46% |
| Content/Story | 10 | 6 | 40% |
| **Case Study** | **21** | **8** | **62%** |
| Guide | 13 | 5 | 62% |
| Data Request | 11 | 5 | 55% |
| Mentor Contact | 5 | 4 | 20% |
| Contact Page | 7 | 4 | 43% |

---

### 8. Backend Recommendations

#### 8.1 Keep `directory_submissions` as the Unified Submissions Table

**Rationale:** The current architecture is sound — one table with `submission_type` discriminator and flexible `form_data` JSONB. Do NOT create per-entity submission tables. Instead:

1. **Fix the SELECT RLS policy** — change from `USING(false)` to `USING(public.has_role(auth.uid(), 'admin'::app_role))`
2. **Add `investor` to CHECK constraint** — it's in the frontend `SubmissionType` but missing from the DB CHECK (currently only 9 types, needs 10)
3. **Add `mentor_contact` to CHECK constraint** — to support the MentorContactModal fallback
4. **Add `contact_inquiry` to CHECK constraint** — to support the Contact page form

#### 8.2 Schema Changes Needed

```sql
-- 1. Fix directory_submissions RLS for admin SELECT
DROP POLICY IF EXISTS "Only admins can view submissions" ON directory_submissions;
CREATE POLICY "Only admins can view submissions"
  ON directory_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Add missing submission types to CHECK constraint
ALTER TABLE directory_submissions
  DROP CONSTRAINT directory_submissions_submission_type_check;
ALTER TABLE directory_submissions
  ADD CONSTRAINT directory_submissions_submission_type_check
  CHECK (submission_type IN (
    'mentor', 'service_provider', 'trade_agency', 'innovation_organization',
    'investor', 'event', 'content', 'case_study', 'guide', 'data_request',
    'mentor_contact', 'contact_inquiry'
  ));

-- 3. Add tracking columns
ALTER TABLE directory_submissions
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS submitter_user_id UUID REFERENCES auth.users(id);

-- 4. Add submitter-can-view-own policy
CREATE POLICY "Submitters can view their own submissions"
  ON directory_submissions FOR SELECT
  USING (submitter_user_id = auth.uid());
```

#### 8.3 Contact Page Backend

Route the Contact page form to `directory_submissions` with `submission_type: 'contact_inquiry'`. This avoids creating yet another table.

#### 8.4 Admin Review Workflow

Minimal admin UI needed:
1. Add an admin route `/admin/submissions`
2. Table view of all `directory_submissions` with filters by type and status
3. Status update buttons (approve/reject with notes)
4. For approved entries: "Publish" action that creates the corresponding row in the live table (`events`, `community_members`, `service_providers`, etc.)

#### 8.5 Email Notification Triggers

When email service (Resend) is configured:
1. **On submission INSERT** — send confirmation to `contact_email`
2. **On status change to `in_review`** — send "We're reviewing your submission" to submitter
3. **On status change to `approved`** — send "Your submission has been approved" to submitter
4. **On status change to `rejected`** — send "Submission update" with reason to submitter
5. **On any new submission** — send admin notification email

These can be implemented via Supabase Database Webhooks or a Postgres trigger calling an edge function.

---

### 9. Priority Tiers

#### Tier 1: Quick Wins (< 1 hour each)

| # | Task | Impact |
|---|------|--------|
| 1 | Remove `phone` field from all directory forms (BaseFormFields) | Reduces friction |
| 2 | Remove `targetMarket` disabled field from Case Study form | Removes dead weight |
| 3 | Remove `eventLogoUrl` from Event form (broken field) | Fixes bug |
| 4 | Remove `founderName` from Case Study (redundant with `name`) | Removes confusion |
| 5 | Remove `founderCount` and `employeeCount` from Case Study | Reduces fields |
| 6 | Add pre-fill from auth profile for logged-in users | Reduces typing |
| 7 | Fix toast messages to include "what happens next" text | Sets expectations |
| 8 | Connect Contact page form to `directory_submissions` | Fixes data loss |

#### Tier 2: Medium Effort (1-4 hours each)

| # | Task | Impact |
|---|------|--------|
| 9 | Build progressive disclosure (collapsible "Add more details" section) for all forms | Major UX improvement |
| 10 | Fix `directory_submissions` RLS policy to allow admin SELECT | Enables admin access |
| 11 | Add `investor` and `mentor_contact` to CHECK constraint | Fixes insert failures |
| 12 | Create post-submit confirmation state (in-modal, not just toast) | Better UX |
| 13 | Add `submitter_user_id` column and populate from auth | Enables "my submissions" view |
| 14 | Merge/remove duplicate event submission flow (keep SubmissionModal, remove direct EventSubmissionForm or gate it to admin) | Removes confusion |
| 15 | Standardize validation (adopt Zod for all forms or HTML5 for all) | Consistency |

#### Tier 3: Architectural (4+ hours)

| # | Task | Impact |
|---|------|--------|
| 16 | Build admin `/admin/submissions` dashboard with filtering, status management | Enables review workflow |
| 17 | Create reusable `<SubmissionForm>` component with universal pattern | Consistency + maintainability |
| 18 | Implement status lifecycle (submitted → in_review → approved/rejected → published) | Complete workflow |
| 19 | Configure email service (Resend) and wire up notification triggers | User + admin notifications |
| 20 | Build "Publish" action that promotes approved submissions to live directory tables | End-to-end pipeline |
| 21 | Replace hardcoded dropdown options with database-driven values | Flexibility |
| 22 | Add rate limiting / CAPTCHA to public submission endpoints | Security |

---

## 10. Key Files Reference

| Purpose | Path |
|---------|------|
| Submission modal (main) | `src/components/directory-submissions/SubmissionModal.tsx` |
| Submission button trigger | `src/components/directory-submissions/SubmissionButton.tsx` |
| Submission type config | `src/components/directory-submissions/submissionConfig.ts` |
| Form data types | `src/components/directory-submissions/types.ts` |
| Base form fields (shared) | `src/components/directory-submissions/BaseFormFields.tsx` |
| Event form fields | `src/components/directory-submissions/EventFormFields.tsx` |
| Content form fields | `src/components/directory-submissions/ContentFormFields.tsx` |
| Case study form fields | `src/components/directory-submissions/CaseStudyFormFields.tsx` |
| Guide form fields | `src/components/directory-submissions/GuideFormFields.tsx` |
| Data request form fields | `src/components/directory-submissions/DataRequestFormFields.tsx` |
| Default form fields | `src/components/directory-submissions/DefaultFormFields.tsx` |
| Mentor contact modal | `src/components/mentors/MentorContactModal.tsx` |
| Event direct submission | `src/components/events/EventSubmissionForm.tsx` |
| Email capture | `src/components/EmailCaptureForm.tsx` |
| Contact page | `src/pages/Contact.tsx` |
| Report intake API | `src/lib/api/reportApi.ts` |
| Supabase auto-generated types | `src/integrations/supabase/types.ts` |
| DB migration (directory_submissions) | `supabase/migrations/20250628040324-bb4aac18-25e0-4656-89ce-383387b795bc.sql` |
| Email function (not connected) | `supabase/functions/send-lead-followup/index.ts` |

---

*End of audit. Phase 3 implementation awaits explicit confirmation.*

