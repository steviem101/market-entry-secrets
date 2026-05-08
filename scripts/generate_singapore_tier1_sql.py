"""Generate idempotent PL/pgSQL DO blocks per Singapore Tier 1 case study.

Output:
  scripts/singapore_tier1_import.sql                       - all blocks bundled
  scripts/singapore_tier1_import_blocks/{NN}-{slug}.sql    - one block per case

Each block uses:
  - INSERT … ON CONFLICT (slug) DO UPDATE for content_items
  - skip-if-exists for content_company_profiles, content_founders
  - lookup-or-INSERT for content_sections
  - UPDATE-or-INSERT for content_bodies
  - INSERT ON CONFLICT (case_study_id, url) DO NOTHING for sources

Re-running any block is a no-op.
"""

from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PARSED_PATH = REPO_ROOT / "scripts" / "parsed_singapore_tier1.json"
OUT_BUNDLE = REPO_ROOT / "scripts" / "singapore_tier1_import.sql"
OUT_DIR = REPO_ROOT / "scripts" / "singapore_tier1_import_blocks"

CATEGORY_MAP = {
    "Fintech Success": "0563b826-2123-4627-b912-14f63e9fbfb6",
    "Technology Market Entry": "6a837ef6-c7b5-457c-8069-2b8da9c85716",
}

SECTION_VAR_MAP = {
    "entry-strategy": "v_sec_entry",
    "success-factors": "v_sec_success",
    "key-metrics": "v_sec_metrics",
    "lessons-learned": "v_sec_lessons",
}


def sql_str(s: str | None) -> str:
    if s is None or s == "":
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def sql_text_array(items: list[str]) -> str:
    if not items:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ", ".join(sql_str(i) for i in items) + "]::text[]"


def sql_jsonb(obj) -> str:
    return sql_str(json.dumps(obj, ensure_ascii=False)) + "::jsonb"


def block_for_case(case: dict) -> str:
    slug = case["slug"]
    title = case["title"]
    subtitle = case.get("subtitle")
    category_id = CATEGORY_MAP[case["category"]]
    tldr = case.get("tldr") or []
    quick_facts = case.get("quick_facts") or []
    read_time = case.get("read_time") or 2
    sections = case.get("sections") or []
    founders = case.get("founders") or []
    sources = case.get("sources") or []
    company = case["company_name"]
    industry = case.get("industry")
    entry_year = case.get("entry_year")

    lines: list[str] = []
    lines.append("DO $do_block$")
    lines.append("DECLARE")
    lines.append("  v_id uuid;")
    for sec in sections:
        var = SECTION_VAR_MAP.get(sec["slug"])
        if var:
            lines.append(f"  {var} uuid;")
    lines.append("BEGIN")

    lines.append("  INSERT INTO content_items (")
    lines.append("    slug, title, subtitle, category_id, content_type, status, featured,")
    lines.append("    read_time, tldr, quick_facts, researched_by, style_version")
    lines.append("  ) VALUES (")
    lines.append(f"    {sql_str(slug)}, {sql_str(title)}, {sql_str(subtitle)},")
    lines.append(f"    {sql_str(category_id)}::uuid, 'case_study', 'published', false,")
    lines.append(
        f"    {read_time}, {sql_text_array(tldr)}, {sql_jsonb(quick_facts)}, "
        "'Stephen Browne', 2"
    )
    lines.append("  )")
    lines.append("  ON CONFLICT (slug) DO UPDATE SET")
    lines.append("    title = EXCLUDED.title,")
    lines.append("    subtitle = EXCLUDED.subtitle,")
    lines.append("    category_id = EXCLUDED.category_id,")
    lines.append("    status = EXCLUDED.status,")
    lines.append("    read_time = EXCLUDED.read_time,")
    lines.append("    tldr = EXCLUDED.tldr,")
    lines.append("    quick_facts = EXCLUDED.quick_facts,")
    lines.append("    researched_by = EXCLUDED.researched_by,")
    lines.append("    style_version = EXCLUDED.style_version")
    lines.append("  RETURNING id INTO v_id;")
    lines.append("")

    lines.append("  IF NOT EXISTS (SELECT 1 FROM content_company_profiles WHERE content_id = v_id) THEN")
    lines.append("    INSERT INTO content_company_profiles (")
    lines.append("      content_id, company_name, origin_country, target_market,")
    lines.append("      entry_date, industry, founder_count, employee_count, is_profitable")
    lines.append("    ) VALUES (")
    fc = len(founders) if founders else "NULL"
    lines.append(
        f"      v_id, {sql_str(company)}, 'Singapore', 'Australia & New Zealand',"
    )
    entry_date_sql = sql_str(f"{entry_year}-01-01") if entry_year else "NULL"
    lines.append(
        f"      {entry_date_sql}, {sql_str(industry)}, {fc}, NULL, NULL"
    )
    lines.append("    );")
    lines.append("  END IF;")
    lines.append("")

    if founders:
        lines.append("  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN")
        for f in founders:
            primary = "true" if f.get("is_primary") else "false"
            lines.append("    INSERT INTO content_founders (content_id, name, title, is_primary)")
            lines.append(
                f"    VALUES (v_id, {sql_str(f['name'])}, "
                f"{sql_str(f.get('title') or 'Founder')}, {primary});"
            )
        lines.append("  END IF;")
        lines.append("")

    for i, sec in enumerate(sections, start=1):
        slug_sec = sec["slug"]
        var = SECTION_VAR_MAP.get(slug_sec)
        if not var:
            continue
        lines.append(f"  -- Section: {slug_sec}")
        lines.append(f"  SELECT id INTO {var} FROM content_sections")
        lines.append(f"   WHERE content_id = v_id AND slug = {sql_str(slug_sec)};")
        lines.append(f"  IF {var} IS NULL THEN")
        lines.append(
            "    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)"
        )
        lines.append(
            f"    VALUES (v_id, {sql_str(sec['title'])}, {sql_str(slug_sec)}, {i}, true)"
        )
        lines.append(f"    RETURNING id INTO {var};")
        lines.append("  ELSE")
        lines.append("    UPDATE content_sections")
        lines.append(f"      SET title = {sql_str(sec['title'])}, sort_order = {i}, is_active = true")
        lines.append(f"      WHERE id = {var};")
        lines.append("  END IF;")
        for j, body in enumerate(sec["bodies"], start=1):
            lines.append(
                f"  IF EXISTS (SELECT 1 FROM content_bodies "
                f"WHERE section_id = {var} AND sort_order = {j}) THEN"
            )
            lines.append(
                f"    UPDATE content_bodies SET body_text = {sql_str(body)}, updated_at = now()"
            )
            lines.append(f"      WHERE section_id = {var} AND sort_order = {j};")
            lines.append("  ELSE")
            lines.append(
                "    INSERT INTO content_bodies "
                "(content_id, section_id, body_text, sort_order, content_type)"
            )
            lines.append(
                f"    VALUES (v_id, {var}, {sql_str(body)}, {j}, 'case_study');"
            )
            lines.append("  END IF;")
        lines.append("")

    for s in sources:
        cn = s.get("citation_number")
        cn_sql = str(cn) if cn else "NULL"
        stype = s.get("source_type") or "other"
        lines.append(
            "  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)"
        )
        lines.append(
            f"  VALUES (v_id, {sql_str(s['label'])}, {sql_str(s['url'])}, {cn_sql}, {sql_str(stype)})"
        )
        lines.append("  ON CONFLICT (case_study_id, url) DO NOTHING;")

    lines.append("END")
    lines.append("$do_block$;")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    cases = json.loads(PARSED_PATH.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    bundle_parts: list[str] = []
    for i, case in enumerate(cases, start=1):
        block = block_for_case(case)
        per_file = OUT_DIR / f"{i:02d}-{case['slug']}.sql"
        per_file.write_text(block, encoding="utf-8")
        bundle_parts.append(f"-- Case {i}/{len(cases)}: {case['company_name']} ({case['slug']})")
        bundle_parts.append(block)
    OUT_BUNDLE.write_text("\n".join(bundle_parts), encoding="utf-8")
    print(f"Wrote {len(cases)} import blocks to {OUT_DIR}")
    print(f"Bundle: {OUT_BUNDLE}")


if __name__ == "__main__":
    main()
