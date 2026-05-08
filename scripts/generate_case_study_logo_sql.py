"""Generate idempotent UPDATE SQL to backfill website + company_logo for the
53 published case studies that are missing both fields.

Reads:  scripts/parsed_case_study_logos.json (output of build_case_study_logos.py)
Writes: scripts/backfill_case_study_logos.sql

The UPDATEs are idempotent and only touch rows where both fields are still
NULL — re-running is a no-op, and existing rows that already have a website
or logo are deliberately left alone (per the task scope of 53-only).
"""

from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INPUT = REPO_ROOT / "scripts" / "parsed_case_study_logos.json"
OUTPUT = REPO_ROOT / "scripts" / "backfill_case_study_logos.sql"


def sql_str(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main() -> None:
    rows = json.loads(INPUT.read_text())
    lines: list[str] = [
        "-- Backfill website + company_logo for 53 published case studies",
        "-- missing both fields. Idempotent: only updates rows where website",
        "-- and company_logo are both still NULL.",
        "",
    ]
    for r in rows:
        slug = r["slug"]
        website = r["website"]
        logo = r["company_logo"]
        lines.append(f"-- {slug} ({r['company_name']})")
        lines.append("UPDATE content_company_profiles cp")
        lines.append(f"   SET website = {sql_str(website)},")
        lines.append(f"       company_logo = {sql_str(logo)}")
        lines.append("  FROM content_items ci")
        lines.append("  WHERE cp.content_id = ci.id")
        lines.append(f"    AND ci.slug = {sql_str(slug)}")
        lines.append("    AND cp.website IS NULL")
        lines.append("    AND cp.company_logo IS NULL;")
        lines.append("")
    OUTPUT.write_text("\n".join(lines))
    print(f"Wrote {len(rows)} UPDATE statements to {OUTPUT}")


if __name__ == "__main__":
    main()
