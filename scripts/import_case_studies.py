"""Import parsed ANZ case studies into MES Supabase project (xhziwveaiuhzdoutpgrh).

Reads:
  scripts/parsed_case_studies.json (output of parse_case_studies.py)

Env (loaded from repo-root .env via python-dotenv):
  SUPABASE_URL - should be https://xhziwveaiuhzdoutpgrh.supabase.co
  SUPABASE_SERVICE_ROLE_KEY - MES platform service role key

Halts immediately if either env var is missing.

Insert order is fixed by FK dependencies:
  1. content_items (UPSERT on slug)
  2. content_company_profiles (skip if exists for content_id)
  3. content_founders (insert when source has named founders, skip if exists)
  4. content_sections (skip if section slug already exists for content_id)
  5. content_bodies (skip if section already has bodies)
  6. case_study_sources (skip if URL already exists for case_study_id)

Re-running is safe: every insert checks for existence and reports skip.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from supabase import create_client, Client

REPO_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = REPO_ROOT / ".env"
PARSED_PATH = REPO_ROOT / "scripts" / "parsed_case_studies.json"

CATEGORY_MAP = {
    "Fintech Success": "0563b826-2123-4627-b912-14f63e9fbfb6",
    "Technology Market Entry": "6a837ef6-c7b5-457c-8069-2b8da9c85716",
}


def fail(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def init() -> Client:
    if not ENV_PATH.exists():
        fail(f".env not found at {ENV_PATH}")
    load_dotenv(ENV_PATH)
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url:
        fail("SUPABASE_URL is not set in .env")
    if not key:
        fail("SUPABASE_SERVICE_ROLE_KEY is not set in .env (required for inserts that bypass RLS)")
    if "xhziwveaiuhzdoutpgrh" not in url:
        fail(f"SUPABASE_URL must point to MES platform project (xhziwveaiuhzdoutpgrh); got {url}")
    return create_client(url, key)


def upsert_content_item(supabase: Client, case: dict[str, Any]) -> str:
    payload = {
        "slug": case["slug"],
        "title": case["title"],
        "subtitle": case.get("subtitle") or None,
        "category_id": CATEGORY_MAP[case["category"]],
        "content_type": "case_study",
        "status": case["status"],
        "featured": False,
        "read_time": case.get("read_time"),
        "tldr": case.get("tldr") or [],
        "quick_facts": case.get("quick_facts") or [],
        "researched_by": "Stephen Browne",
        "style_version": 2,
    }
    res = (
        supabase.table("content_items")
        .upsert(payload, on_conflict="slug")
        .execute()
    )
    if not res.data:
        # supabase-py may return empty data for upserts depending on PostgREST behavior;
        # fall back to a select.
        sel = supabase.table("content_items").select("id").eq("slug", case["slug"]).single().execute()
        return sel.data["id"]
    return res.data[0]["id"]


def insert_company_profile(supabase: Client, content_id: str, case: dict[str, Any]) -> int:
    existing = (
        supabase.table("content_company_profiles")
        .select("id")
        .eq("content_id", content_id)
        .execute()
    )
    if existing.data:
        return 0
    payload = {
        "content_id": content_id,
        "company_name": case["company_name"],
        "origin_country": case.get("origin_country"),
        "target_market": case.get("target_market"),
        "entry_date": case.get("entry_date") or None,
        "industry": case.get("industry") or None,
        "founder_count": len(case.get("founders") or []) or None,
    }
    supabase.table("content_company_profiles").insert(payload).execute()
    return 1


def insert_founders(supabase: Client, content_id: str, founders: list[dict[str, Any]]) -> int:
    if not founders:
        return 0
    existing = (
        supabase.table("content_founders")
        .select("id")
        .eq("content_id", content_id)
        .execute()
    )
    if existing.data:
        return 0
    rows = [
        {
            "content_id": content_id,
            "name": f["name"],
            "title": f.get("title") or "Founder",
            "is_primary": bool(f.get("is_primary")),
        }
        for f in founders
    ]
    supabase.table("content_founders").insert(rows).execute()
    return len(rows)


def insert_sections(
    supabase: Client, content_id: str, sections: list[dict[str, Any]]
) -> tuple[dict[str, str], int]:
    existing = (
        supabase.table("content_sections")
        .select("id, slug")
        .eq("content_id", content_id)
        .execute()
    )
    section_id_by_slug: dict[str, str] = {row["slug"]: row["id"] for row in (existing.data or [])}
    inserted = 0
    if not section_id_by_slug:
        rows = [
            {
                "content_id": content_id,
                "title": s["title"],
                "slug": s["slug"],
                "sort_order": i + 1,
                "is_active": True,
            }
            for i, s in enumerate(sections)
        ]
        res = supabase.table("content_sections").insert(rows).execute()
        for row in res.data or []:
            section_id_by_slug[row["slug"]] = row["id"]
        inserted = len(rows)
    return section_id_by_slug, inserted


def insert_bodies(
    supabase: Client,
    content_id: str,
    sections: list[dict[str, Any]],
    section_id_by_slug: dict[str, str],
) -> int:
    total = 0
    for sec in sections:
        section_id = section_id_by_slug.get(sec["slug"])
        if not section_id:
            continue
        existing = (
            supabase.table("content_bodies")
            .select("id")
            .eq("section_id", section_id)
            .execute()
        )
        if existing.data:
            continue
        rows = [
            {
                "content_id": content_id,
                "section_id": section_id,
                "body_text": body,
                "sort_order": i + 1,
                "content_type": "case_study",
            }
            for i, body in enumerate(sec["bodies"])
        ]
        if rows:
            supabase.table("content_bodies").insert(rows).execute()
            total += len(rows)
    return total


def insert_sources(supabase: Client, content_id: str, sources: list[dict[str, Any]]) -> int:
    if not sources:
        return 0
    existing = (
        supabase.table("case_study_sources")
        .select("url")
        .eq("case_study_id", content_id)
        .execute()
    )
    seen = {row["url"] for row in (existing.data or [])}
    rows = []
    for s in sources:
        if s["url"] in seen:
            continue
        rows.append({
            "case_study_id": content_id,
            "label": s["label"],
            "url": s["url"],
            "citation_number": s.get("citation_number"),
            "source_type": s.get("source_type") or "other",
        })
    if rows:
        supabase.table("case_study_sources").insert(rows).execute()
    return len(rows)


def main() -> None:
    if not PARSED_PATH.exists():
        fail(f"parsed JSON not found at {PARSED_PATH}; run scripts/parse_case_studies.py first")
    cases: list[dict[str, Any]] = json.loads(PARSED_PATH.read_text(encoding="utf-8"))
    if not cases:
        fail("parsed JSON is empty")
    supabase = init()

    summary = {
        "items": 0,
        "profiles": 0,
        "founders": 0,
        "sections": 0,
        "bodies": 0,
        "sources": 0,
    }
    for i, case in enumerate(cases, start=1):
        content_id = upsert_content_item(supabase, case)
        summary["items"] += 1
        prof = insert_company_profile(supabase, content_id, case)
        summary["profiles"] += prof
        fnd = insert_founders(supabase, content_id, case.get("founders") or [])
        summary["founders"] += fnd
        section_ids, sec_n = insert_sections(supabase, content_id, case["sections"])
        summary["sections"] += sec_n
        body_n = insert_bodies(supabase, content_id, case["sections"], section_ids)
        summary["bodies"] += body_n
        src_n = insert_sources(supabase, content_id, case.get("sources") or [])
        summary["sources"] += src_n
        print(
            f"[{i}/{len(cases)}] {case['company_name']:25s} "
            f"profile={prof} founders={fnd} sections={sec_n} bodies={body_n} sources={src_n}"
        )

    print("\nSummary:")
    for k, v in summary.items():
        print(f"  {k}: {v} inserted")


if __name__ == "__main__":
    main()
