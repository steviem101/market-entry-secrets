# MASTER PROMPT — paste this whole file into Claude Code as your first message

You are implementing the MES report redesign in this repo (React 18 + Tailwind + shadcn + Supabase). The handoff package lives in `design_handoff_mes_report_redesign/`. You will run the ENTIRE implementation as a guided, step-by-step process: you drive, and you walk ME (the owner) through every step, asking for exactly what you need, when you need it. I may not remember the package details — you own the process.

## Your operating mode
- Work in numbered STEPS. At each step: say what you're doing, do it, then tell me exactly what you need from me (if anything) before continuing. One thing at a time — never ask me two unrelated questions at once.
- STOP and wait at every checkpoint marked ⛔. Never continue past a ⛔ without my explicit answer.
- If anything is ambiguous: check `DECISIONS.md`, then `contracts/contracts.md`, then ask me. Never invent.
- If I ask you to deviate from the package, warn me once about the consequence, then do as I say.

## Ground rules (non-negotiable)
1. One ticket per PR/commit scope. Do not look ahead or scaffold future tickets.
2. `contracts/report.ts` is law — copy it into the repo as-is (`src/types/report.ts`). Never extend or "improve" it; if it seems wrong, stop and ask me.
3. Do NOT modify the existing report renderer, generation pipeline, or Edge Functions until tickets 1–16 are done and I sign PARITY.md. Everything new lives in new files behind the `report_v2` feature flag.
4. Styling: existing Tailwind tokens mapped per `tokens.md`. No new fonts, colors, or inline styles.
5. You cannot see rendered HTML. Before building each VISUAL component, ask me for a screenshot: name the exact section and fixture ("please screenshot §05 Service providers from reference/Nory Report v2.dc.html"). Never guess visual details from markup.
6. Out of scope: the Market Entry Map and the design-rubric scorer. Do not build, scaffold, or reference them.
7. After each ticket passes, tick its rows in `PARITY.md` in the same commit.
8. Mobile + PDF behavior per `MOBILE_AND_PDF.md` (tickets 15–16 acceptance).

## The steps

### STEP 0 — Orientation (you, now)
Read: `README.md`, `DECISIONS.md`, `contracts/report.ts`, `contracts/contracts.md`, `tickets/TICKETS.md`, `tokens.md`, `MOBILE_AND_PDF.md`, `PARITY.md`. Then explore the repo: locate the current report renderer, the profile-page routes, the Tailwind config, and the Supabase client setup. Report back a 10-line summary of what you found and where the new code will live.

### STEP 1 — ⛔ Setup questions (me)
Ask me, one at a time, and record my answers at the top of PARITY.md as "Build decisions":
1. What are the real profile route patterns? (Show me 3 examples you found in the repo and ask me to confirm, e.g. `/investors/:slug` vs `/investor/:slug`.)
2. Supabase table for interactions — is `report_interactions` (reportId, type, payload jsonb, created_at) acceptable, or name another?
3. Where should request-hook submissions notify? (existing intake email / Slack webhook / table-only for now)
4. Where do platform profile assets (logos, headshots) live, and what's the URL shape for `platform:<slug>` resolution?
5. Which branch should I work on? (suggest `report-v2`)

### STEP 2 — Fixtures + types in
Copy `contracts/report.ts` → `src/types/report.ts` and `fixtures/*.json` → `src/fixtures/`. Typecheck the three fixtures against the Report type; report any mismatches to me (fix the FIXTURE only if it's clearly a typo; ask me otherwise).

### STEP 3 — Ticket 0: acceptance harness
Build dev-only route `/dev/report-preview?fixture=floats|nory|lemlist`: loads the fixture through the Report type, renders whatever components exist in section order, missing components as labeled placeholders. ⛔ Ask me to open it and confirm I see 16 labeled placeholders for each fixture.

### STEP 4 — Tickets 1–4 (P0), one at a time
For each ticket in `tickets/TICKETS.md`: announce the ticket, ask for any screenshot you need (rule 5), build it, run the done-check on ALL THREE fixtures, tick PARITY.md, then ⛔ ask me to review in the harness before starting the next. Ticket 4 (adapter) ends with: ⛔ ask me for a real production report's JSON (or DB access pattern) and render it through the adapter — log every mismatch, fix mapping in the ADAPTER only, and show me the log (PARITY row 19).

### STEP 5 — Tickets 5–12 (P1), same loop
Same per-ticket loop. Degradation states named in each ticket are part of the done-check — point me at them explicitly during review ("check the lemlist zero-briefed ICP card").

### STEP 6 — Tickets 13–16 (P2)
13 shortlist (⛔ confirm persistence works: star → refresh → still starred), 14 request persistence + notification (⛔ ask me to submit a test request and confirm it arrived where step-1 Q3 said), 15 feature flag + mobile pass (⛔ ask me to check 375px/768px on all fixtures), 16 PDF (⛔ ask me to print each fixture to PDF and check against MOBILE_AND_PDF.md acceptance list).

### STEP 7 — ⛔ Final parity sign-off (me)
Walk me through PARITY.md row by row; I tick and sign. Then show me exactly how to: (a) flip `report_v2` on for one of MY report IDs only, (b) flip it off, (c) hard-revert (delete which folder). Do NOT enable it for any customer.

### STEP 8 — Wrap
Summarise what was built, what's behind the flag, the two rollback paths, and what Phase B (tickets 17–20) would involve — but do not start it. Phase B is a separate future session.

Begin with STEP 0 now.
