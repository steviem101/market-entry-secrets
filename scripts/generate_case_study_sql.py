"""Generate one PL/pgSQL DO block per case study from parsed_case_studies.json.

The blocks are idempotent (skip-if-exists semantics) and produce the same
end state as scripts/import_case_studies.py, just executed via raw SQL
instead of supabase-py. Used for the initial import via Supabase MCP when
the service role key is not available locally.

Output:
  scripts/import_case_studies.sql                       - all 25 DO blocks concatenated
  scripts/import_case_study_blocks/{NN}-{slug}.sql      - one block per case study
"""

from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PARSED_PATH = REPO_ROOT / "scripts" / "parsed_case_studies.json"
OUT_BUNDLE = REPO_ROOT / "scripts" / "import_case_studies.sql"
OUT_DIR = REPO_ROOT / "scripts" / "import_case_study_blocks"

CATEGORY_MAP = {
    "Fintech Success": "0563b826-2123-4627-b912-14f63e9fbfb6",
    "Technology Market Entry": "6a837ef6-c7b5-457c-8069-2b8da9c85716",
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
    category_id = CATEGORY_MAP[case["category"]]
    title = case["title"]
    subtitle = case.get("subtitle") or None
    status = case["status"]
    read_time = case.get("read_time") or 1
    tldr = case.get("tldr") or []
    quick_facts = case.get("quick_facts") or []

    lines: list[str] = []
    lines.append("DO $do_block$")
    lines.append("DECLARE")
    lines.append("  v_id uuid;")
    # pre-declare section uuid vars
    for i in range(len(case["sections"])):
        lines.append(f"  v_sec_{i} uuid;")
    lines.append("BEGIN")

    # Upsert content_items
    lines.append("  INSERT INTO content_items (")
    lines.append("    slug, title, subtitle, category_id, content_type, status, featured,")
    lines.append("    read_time, tldr, quick_facts, researched_by, style_version")
    lines.append("  ) VALUES (")
    lines.append(f"    {sql_str(slug)}, {sql_str(title)}, {sql_str(subtitle)},")
    lines.append(f"    {sql_str(category_id)}::uuid, 'case_study', {sql_str(status)}, false,")
    lines.append(f"    {read_time}, {sql_text_array(tldr)}, {sql_jsonb(quick_facts)}, 'Stephen Browne', 2")
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

    # company profile
    founder_count = len(case.get("founders") or [])
    fc_sql = str(founder_count) if founder_count else "NULL"
    lines.append("  IF NOT EXISTS (SELECT 1 FROM content_company_profiles WHERE content_id = v_id) THEN")
    lines.append("    -- explicit NULLs for is_profitable and employee_count to override misleading column defaults")
    lines.append("    INSERT INTO content_company_profiles (")
    lines.append("      content_id, company_name, origin_country, target_market,")
    lines.append("      entry_date, industry, founder_count, employee_count, is_profitable")
    lines.append("    ) VALUES (")
    lines.append(f"      v_id, {sql_str(case['company_name'])}, {sql_str(case.get('origin_country'))}, {sql_str(case.get('target_market'))},")
    lines.append(f"      {sql_str(case.get('entry_date') or None)}, {sql_str(case.get('industry') or None)}, {fc_sql}, NULL, NULL")
    lines.append("    );")
    lines.append("  END IF;")
    lines.append("")

    # founders
    founders = case.get("founders") or []
    if founders:
        lines.append("  IF NOT EXISTS (SELECT 1 FROM content_founders WHERE content_id = v_id) THEN")
        for f in founders:
            lines.append("    INSERT INTO content_founders (content_id, name, title, is_primary) VALUES (")
            lines.append(f"      v_id, {sql_str(f['name'])}, {sql_str(f.get('title') or 'Founder')}, {'true' if f.get('is_primary') else 'false'}")
            lines.append("    );")
        lines.append("  END IF;")
        lines.append("")

    # sections + bodies
    lines.append("  IF NOT EXISTS (SELECT 1 FROM content_sections WHERE content_id = v_id) THEN")
    for i, sec in enumerate(case["sections"]):
        sec_var = f"v_sec_{i}"
        lines.append("    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)")
        lines.append(f"    VALUES (v_id, {sql_str(sec['title'])}, {sql_str(sec['slug'])}, {i+1}, true)")
        lines.append(f"    RETURNING id INTO {sec_var};")
        for j, body in enumerate(sec["bodies"]):
            lines.append(
                f"    INSERT INTO content_bodies (content_id, section_id, body_text, sort_order, content_type) "
                f"VALUES (v_id, {sec_var}, {sql_str(body)}, {j+1}, 'case_study');"
            )
    lines.append("  END IF;")
    lines.append("")

    # sources -- (case_study_id, url) is unique, use ON CONFLICT DO NOTHING
    sources = case.get("sources") or []
    for s in sources:
        url = s["url"]
        label = s["label"]
        cn = s.get("citation_number")
        cn_sql = str(cn) if cn else "NULL"
        stype = s.get("source_type") or "other"
        lines.append("  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)")
        lines.append(f"  VALUES (v_id, {sql_str(label)}, {sql_str(url)}, {cn_sql}, {sql_str(stype)})")
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
        bundle_parts.append(f"-- Case {i}/{len(cases)}: {case['company_name']}")
        bundle_parts.append(block)
    OUT_BUNDLE.write_text("\n".join(bundle_parts), encoding="utf-8")
    print(f"Wrote {len(cases)} blocks to {OUT_DIR} and bundle to {OUT_BUNDLE}")


if __name__ == "__main__":
    main()
