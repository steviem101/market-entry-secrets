#!/usr/bin/env python3
"""MES-178 follow-up: STAGED enrichment proposal for existing case studies.

Nine of the 21 drafts skipped as duplicates during the MES-178 import point at
live case studies that are either empty or thin. This script turns the richer
new drafts into a **review-gated proposal** — it writes SQL and a diff doc but
does NOT touch the database. Editorial signs off, then the SQL is applied
against the existing (already published) rows.

This is a separate workstream from the MES-178 import (which only added new
draft rows). Per the directory-data-enrichment skill, live published content is
never blind-overwritten: the proposal is staged, per-field, and the SQL only
fills blank profile fields (never overwrites curated values).

Two actions:
  fill    (2 empty pages: Netflix, Afterpay — 0 body chars live) — INSERT the
          draft's sections/bodies against the existing content_id. Nothing to
          lose; these currently render an empty article body.
  replace (7 thin stubs, ~2.4k–3.4k chars, 2-min reads) — DELETE the existing
          auto-generated sections/bodies (FK-cascade drops section bodies and
          SET NULLs any source/quote links, so case_study_sources survive) and
          INSERT the richer draft content. Slug, tldr, quick_facts and sources
          on the row are preserved.

Outputs (out/enrichment/):
  enrichment_proposal.sql   -- per-target BEGIN/COMMIT blocks; NOT executed
  enrichment-review.md      -- current vs proposed diff for editorial sign-off

sources_markdown stays editorial-only (never written) exactly as in the import.
"""

from __future__ import annotations

import csv
import re
from pathlib import Path

from transform import (
    parse_case_study,
    populate_target_sql,
    read_time_for,
    sql_str,
    table_value,
    normalise_country,
    outcome_value,
    entry_year,
    COMPANY_MAP,
)

HERE = Path(__file__).parent
CSV_PATH = HERE / "mes_case_studies_batch_65.csv"
OUT_DIR = HERE / "out" / "enrichment"

# new_slug (in CSV) -> (existing live slug, action, live_body_chars for the doc)
TARGETS: dict[str, tuple[str, str, int]] = {
    # fill — live page has zero body content
    "how-netflix-localised-its-way-to-australian-streaming-dominance":
        ("netflix-streaming-australia-launch", "fill", 0),
    "how-afterpay-invented-buy-now-pay-later-from-its-australian-home-market":
        ("afterpay-buy-now-pay-later-revolution", "fill", 0),
    # replace — thin auto-generated stubs
    "how-secretlab-sold-australia-gaming-chairs-without-a-single-store":
        ("secretlab-anz-market-entry", "replace", 2373),
    "how-shopback-used-cashback-to-break-into-australian-loyalty":
        ("shopback-anz-market-entry", "replace", 2598),
    "how-starbucks-misread-australias-coffee-culture-and-closed-61-stores":
        ("starbucks-australia-market-entry", "replace", 3048),
    "how-masters-lowes-lost-billions-challenging-bunnings":
        ("masters-australia-market-entry", "replace", 3054),
    "how-ola-won-australian-drivers-but-never-won-the-riders":
        ("ola-australia-market-entry", "replace", 3060),
    "how-topshops-australian-franchise-collapsed-under-its-own-economics":
        ("topshop-australia-market-entry", "replace", 3156),
    "how-weworks-australian-business-outlived-its-parents-bankruptcy":
        ("wework-australia-market-entry", "replace", 3449),
}


def build_block(new_slug: str, existing_slug: str, action: str, row: dict) -> str:
    body_md = row["body_markdown"].replace("\r\n", "\n")
    intro_md, sections = parse_case_study(body_md)
    read_time = read_time_for(body_md)

    company = COMPANY_MAP.get(new_slug, (None, None))[0] or table_value(body_md, "Company")
    origin = normalise_country(table_value(body_md, "Origin country", "Origin")) \
        or COMPANY_MAP.get(new_slug, (None, None))[1]
    industry = table_value(body_md, "Sector")
    entry = entry_year(table_value(body_md, "Entry year", "Key period"))
    outcome = outcome_value(table_value(body_md, "Outcome"))

    tgt = f"(SELECT id FROM public.content_items WHERE slug = {sql_str(existing_slug)} AND content_type = 'case_study')"

    lines = [f"-- {existing_slug}  ({action}; live body was {TARGETS[new_slug][2]} chars) <- {new_slug}",
             "BEGIN;"]

    if action == "replace":
        lines += [
            f"DELETE FROM public.content_bodies WHERE content_id = {tgt} AND section_id IS NULL;",
            f"DELETE FROM public.content_sections WHERE content_id = {tgt};",
            "  -- ^ cascades section-level bodies; SET NULLs case_study_sources/quotes.section_id (rows preserved)",
        ]

    lines += populate_target_sql(tgt, intro_md, sections, read_time)

    # Fill only blank profile fields — never overwrite curated values.
    profile_sets = []
    if company:
        profile_sets.append(f"company_name = COALESCE(NULLIF(company_name, ''), {sql_str(company)})")
    if origin:
        profile_sets.append(f"origin_country = COALESCE(NULLIF(origin_country, ''), {sql_str(origin)})")
    if industry:
        profile_sets.append(f"industry = COALESCE(NULLIF(industry, ''), {sql_str(industry)})")
    if entry:
        profile_sets.append(f"entry_date = COALESCE(NULLIF(entry_date, ''), {sql_str(entry)})")
    if outcome:
        profile_sets.append(f"outcome = COALESCE(NULLIF(outcome, ''), {sql_str(outcome)})")
    if profile_sets:
        lines += [
            "-- fill blank profile fields only (COALESCE/NULLIF never overwrites curated data)",
            "UPDATE public.content_company_profiles SET",
            "  " + ",\n  ".join(profile_sets),
            f"WHERE content_id = {tgt};",
        ]

    lines.append("COMMIT;")
    return "\n".join(lines)


def main() -> None:
    csv.field_size_limit(10**9)
    rows = {r["suggested_slug"]: r for r in csv.DictReader(open(CSV_PATH))}
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    blocks, doc_rows = [], []
    for new_slug, (existing_slug, action, live_chars) in TARGETS.items():
        row = rows[new_slug]
        blocks.append(build_block(new_slug, existing_slug, action, row))
        _, secs = parse_case_study(row["body_markdown"])
        new_chars = len(re.sub(r"<[^>]+>", "", row["body_markdown"]))
        doc_rows.append((existing_slug, action, live_chars, new_chars, len(secs), new_slug))

    header = (
        "-- MES-178 follow-up: STAGED case-study enrichment proposal.\n"
        "-- NOT APPLIED. Review out/enrichment/enrichment-review.md, then run against\n"
        "-- project xhziwveaiuhzdoutpgrh via the reviewed service-role path.\n"
        "-- Each target is its own transaction; safe to apply selectively.\n\n"
    )
    (OUT_DIR / "enrichment_proposal.sql").write_text(header + "\n\n".join(blocks) + "\n")

    md = [
        "# MES-178 follow-up — staged case-study enrichment proposal",
        "",
        "**Status: proposed, NOT applied.** Editorial reviews this diff, then the SQL",
        "in `out/enrichment/enrichment_proposal.sql` is applied to the existing",
        "(already published) rows. This is separate from the MES-178 import, which only",
        "added new draft rows.",
        "",
        "Scope chosen: the 2 empty live pages + the 7 thin stubs (9 of the 21 skipped",
        "duplicates). The 6 medium and 6 already-rich live pages are left untouched.",
        "",
        "## How the SQL behaves",
        "",
        "- **fill** (empty pages): inserts the draft's intro + sections + bodies against",
        "  the existing `content_id`. No deletes.",
        "- **replace** (thin stubs): deletes the existing auto-generated sections + bodies",
        "  (FK cascade drops section bodies; `case_study_sources`/`quotes` are kept, their",
        "  `section_id` SET NULL), then inserts the richer draft content.",
        "- Both: update `read_time`; fill **only blank** profile fields via COALESCE/NULLIF",
        "  (curated values are never overwritten — this is what surfaces the success/failure",
        "  badge on the thin stubs, whose `outcome` is currently blank).",
        "- `sources_markdown` is NOT written (editorial-only, per the import rule).",
        "",
        "## Targets",
        "",
        "| Live slug | Action | Live body (chars) | Draft body (chars) | Draft sections | From draft |",
        "|---|---|---:|---:|---:|---|",
    ]
    for existing_slug, action, live_chars, new_chars, n_secs, new_slug in doc_rows:
        md.append(f"| `{existing_slug}` | {action} | {live_chars:,} | {new_chars:,} | {n_secs} | `{new_slug}` |")
    md += [
        "",
        "## Apply / rollback",
        "",
        "- Apply per-target or all at once; each block is wrapped in `BEGIN;`/`COMMIT;`.",
        "- Rollback of a **fill** target: delete the sections/bodies added against that",
        "  `content_id`. Rollback of a **replace** target is not automatic — the old thin",
        "  content is dropped, so snapshot those rows before applying if reversibility is",
        "  required.",
        "",
    ]
    (OUT_DIR / "enrichment-review.md").write_text("\n".join(md))
    print(f"targets={len(blocks)} sql_bytes={len((OUT_DIR / 'enrichment_proposal.sql').read_text())}")


if __name__ == "__main__":
    main()
