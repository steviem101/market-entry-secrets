# How to add this handoff to GitHub for Claude Code

You're running Claude Code against your GitHub repo (`steviem101/market-entry-secrets`), not local
folders. The goal: get this handoff package **committed into the repo** so Claude Code can read it as
context, then point CC at the build brief.

Recommended location in your repo: **`docs/redesign/handoff/`** (sits beside the draft schema + SQL
already on PR #197).

---

## Step 1 — Download this package

In this tool, use the **Download** card (or "Download project") to get the
`design_handoff_report_intake_v2` folder as a `.zip`. Unzip it. You'll have:

```
design_handoff_report_intake_v2/
├── START_HERE.md                              ← point Claude Code at this
├── README.md                                  ← design spec
├── ENGINEERING_TODO.md                        ← repo-anchored tasks + the P0 bug
├── HOW_TO_ADD_TO_GITHUB.md                    ← this file (you can drop it after)
├── Intake v2 - Field Mapping.html             ← field → DB → report-section map
├── Report Intake Redesign (self-contained).html  ← clickable visual reference
└── reference_src/                             ← prototype source, split by screen
```

---

## Step 2 — Get it into the repo (pick ONE path)

### Path A — GitHub web UI (no terminal, easiest)
1. Open `github.com/steviem101/market-entry-secrets` → make sure you're on the branch you want
   (e.g. create `redesign/intake-v2-handoff` or use the PR #197 branch).
2. Navigate into `docs/redesign/` (or create it). Click **Add file → Upload files**.
3. Drag the **contents** of the unzipped folder in. To keep them grouped, first rename the local folder
   to `handoff`, then drag that folder in so they land at `docs/redesign/handoff/...`.
   - GitHub's uploader preserves the `reference_src/` subfolder.
4. Commit straight to the branch (or open a PR).

### Path B — Git CLI (if you work locally too)
```bash
git checkout -b redesign/intake-v2-handoff
mkdir -p docs/redesign/handoff
cp -R /path/to/design_handoff_report_intake_v2/* docs/redesign/handoff/
git add docs/redesign/handoff
git commit -m "docs: add intake v2 redesign handoff (spec, plan, reference build)"
git push -u origin redesign/intake-v2-handoff
```

### Path C — Let Claude Code commit it
If you'd rather not touch git yourself: upload just the `.zip` to the repo (or attach it in your CC
session) and tell CC: *"Unpack this into `docs/redesign/handoff/` and commit it."* Then continue to
Step 3.

---

## Step 3 — Point Claude Code at the brief

Once `docs/redesign/handoff/` is on a branch CC can see, start your CC session with a prompt like:

> Read `docs/redesign/handoff/START_HERE.md` and the files it references
> (`README.md`, `ENGINEERING_TODO.md`, `Intake v2 - Field Mapping.html`, and `reference_src/`). This is
> the approved design + build plan for redesigning the `/report-creator` intake flow. Confirm you
> understand the phased plan and the Phase 1 shim bug, then **start with Phase 0 (scaffold & tokens)**.
> Do not build the prototype's control bar or Tweaks panel. Ask me before starting each new phase.

Work **one phase at a time** (they're sequential PRs in `START_HERE.md`). After each, ask CC to run the
phase's **Acceptance** checks before moving on. Land **Phase 1 first or alongside Phase 2** — it's the
correctness blocker (the goal-label shim bug) that otherwise silently breaks report matching.

---

## Step 4 (recommended) — Make the brief auto-load in every CC session

This package includes a ready-made **`CLAUDE.md`**. Copy it to your **repo root** (CC reads a root
`CLAUDE.md` automatically every session) so the guardrails and the pointer to `docs/redesign/handoff/`
are always in context — even in a fresh chat where the brief wasn't pasted.

- GitHub web UI: open the repo root → **Add file → Upload files** → drop `CLAUDE.md` in → commit.
- Git CLI: `cp docs/redesign/handoff/CLAUDE.md ./CLAUDE.md && git add CLAUDE.md && git commit -m "docs: add CLAUDE.md conventions"`

If a `CLAUDE.md` already exists at root, paste the "Active project" section from this one into it rather
than overwriting.

---

## Tips for a smooth CC build

- **Show CC the visual target.** Open `Report Intake Redesign (self-contained).html` in your browser
  while reviewing CC's output so you can compare pixel-for-pixel. (It needs internet — Tailwind Play CDN
  + Google Fonts aren't inlined.)
- **Keep `reference_src/` as reference only.** Tell CC to read it for exact logic/markup but to implement
  with the repo's real components — not to import the `.jsx` files.
- **Gate on Acceptance criteria.** Each phase in `START_HERE.md` lists them; have CC self-check before
  opening the next PR.
- **Protect the pipeline.** After Phase 1, ask CC for a quick test that a seeded v2 intake still returns
  non-empty provider/mentor/lead matches — that's the canary for the shim bug.
