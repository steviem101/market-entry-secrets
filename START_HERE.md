# START HERE — kickoff prompt for Claude Code

> Prefer `MASTER_PROMPT.md` if you want Claude Code to drive the entire process and walk you through every step with explicit stop points — it supersedes this prompt; use only one of the two.

Paste this (edited for your repo paths) as the first instruction:

---

You are implementing the MES report redesign in `steviem101/market-entry-secrets` (React 18 + Tailwind + shadcn + Supabase).

Read, in order: `design_handoff_mes_report_redesign/README.md`, `DECISIONS.md`, `contracts/report.ts`, `tickets/TICKETS.md`. The HTML files in `reference/` are visual reference only — never copy their markup; open them in a browser to see intended rendering.

Ground rules:
1. Work ONE ticket at a time, in order, one PR per ticket. Do not look ahead or scaffold future tickets.
2. Copy `contracts/report.ts` into the repo as-is (`src/types/report.ts`). It is the spec. Do not extend or "improve" it — if it seems wrong, stop and ask.
3. Copy `fixtures/*.json` into the repo (`src/fixtures/`). Before writing any component, build ticket 0 below.
4. Do not modify the generation pipeline, Edge Functions, or existing report renderer until tickets 1–12 pass. Everything new lives behind the `report_v2` feature flag.
5. Styling: use the repo's existing Tailwind tokens; map prototype hexes per `tokens.md`. No new fonts, no new colors, no inline styles.
6. Anything ambiguous: check DECISIONS.md first; if still ambiguous, ask — do not invent.
7. You cannot open the reference HTML in a browser. When you need to see how a section actually renders — before building each visual component, or when a done-check feels ambiguous — STOP and ask me to paste/attach a screenshot of that section from the reference file (I can open `reference/*.dc.html` locally). Name the exact section and fixture you need, e.g. "screenshot of §05 Service providers, Nory". Do not guess visual details from markup alone.
8. Out of scope for this handoff: the Market Entry Map visual and the design-rubric scorer. Do not build them, scaffold for them, or reference them in code — they arrive as a separate follow-up package.
9. After each ticket passes its done-check, update PARITY.md (tick the relevant rows) in the same PR. The flag stays off for all customers until PARITY.md is fully signed off.

Ticket 0 (before TICKETS.md ticket 1): create a dev-only route `/dev/report-preview` that loads `floats.json` or `nory.json` (query param) through the Report type and renders whatever components exist so far, sections stacked in order, missing components as labeled placeholders. This route is the acceptance harness for every subsequent ticket.

Definition of done for every ticket: `/dev/report-preview?fixture=floats` AND `?fixture=nory` render the ticket's component correctly, including the degradation state named in the ticket; typecheck passes; no console errors.

---

## Notes for the human running this

- Claude Code will ask you for screenshots of reference sections as it works (rule 7) — keep `reference/*.dc.html` open in a browser and screenshot the requested section. Fast and worth it: it prevents invented visual details.
- PARITY.md is your gate: only flip `report_v2` on for a customer after every row is ticked and row 19 (real production report through the adapter) passes.

- Confirm two things before ticket 4 (adapter): the real profile-page route structure (fixture URLs are platform-relative paths like `/investors/aura-ventures` — the adapter owns mapping them to actual routes), and DECISIONS.md #5 (interactions table + ops notification channel).
- Review PRs per ticket against the reference HTML side by side — the `/dev/report-preview` route makes this a 2-minute check.
- Phase B (pipeline tickets 17–20) only after you've signed off renderer parity on a real production report through the adapter.
