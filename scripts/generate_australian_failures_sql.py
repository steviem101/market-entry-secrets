"""Generate idempotent PL/pgSQL DO blocks per Australian failure case study.

Output:
  scripts/australian_failures_import.sql                       - all blocks bundled
  scripts/australian_failures_import_blocks/{NN}-{slug}.sql    - one block per case

Each block uses:
  - INSERT … ON CONFLICT (slug) DO UPDATE for content_items
    (subtitle is NOT overwritten when preserve_existing_subtitle=True;
     this keeps existing curated subtitles for Deliveroo and Amazon intact)
  - skip-if-exists for content_company_profiles, content_founders
  - lookup-or-INSERT-or-UPDATE for content_sections
  - UPDATE-or-INSERT for content_bodies (keyed by section + sort_order)
  - INSERT ON CONFLICT (case_study_id, url) DO NOTHING for sources
  - logo.dev website + company_logo set on initial company-profile INSERT
    (no separate backfill needed — these ship with logos from day one)

Re-running any block is a no-op.
"""

from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PARSED_PATH = REPO_ROOT / "scripts" / "parsed_australian_failures.json"
OUT_BUNDLE = REPO_ROOT / "scripts" / "australian_failures_import.sql"
OUT_DIR = REPO_ROOT / "scripts" / "australian_failures_import_blocks"

CATEGORY_MAP = {
    "Fintech Success": "0563b826-2123-4627-b912-14f63e9fbfb6",
    "Legal & Compliance": "e836d932-ac9d-4333-a1bf-9c05faa12340",
    "Technology Market Entry": "6a837ef6-c7b5-457c-8069-2b8da9c85716",
}

SECTION_VAR_MAP = {
    "entry-strategy": "v_sec_entry",
    "success-factors": "v_sec_success",
    "key-metrics": "v_sec_metrics",
    "lessons-learned": "v_sec_lessons",
}

LOGO_DEV_TOKEN = "pk_L3JbJjCeT0-mUdhpPlS6SA"
LOGO_SIZE = 256


def logo_url(domain: str) -> str:
    return f"https://img.logo.dev/{domain}?token={LOGO_DEV_TOKEN}&size={LOGO_SIZE}&format=png"


def website_url(domain: str) -> str:
    return f"https://{domain}"


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


def _block_sources_only(slug: str, sources: list[dict]) -> str:
    """Enrichment block: only insert new sources for an existing curated case.

    Used for slugs that already have rich body content we don't want to
    overwrite (Deliveroo, Amazon). The existing entry stays as-is; we only
    extend the citation footprint.

    Citation numbers are auto-bumped above the existing max to avoid
    collisions with the curated numbering scheme.
    """
    lines: list[str] = []
    lines.append("DO $do_block$")
    lines.append("DECLARE")
    lines.append("  v_id uuid;")
    lines.append("  v_next_cn int;")
    lines.append("BEGIN")
    lines.append(
        f"  SELECT id INTO v_id FROM content_items WHERE slug = {sql_str(slug)};"
    )
    lines.append("  IF v_id IS NULL THEN")
    lines.append(
        f"    RAISE NOTICE 'Skipping source-only enrichment — slug {slug} not found';"
    )
    lines.append("    RETURN;")
    lines.append("  END IF;")
    lines.append(
        "  SELECT COALESCE(MAX(citation_number), 0) + 1 INTO v_next_cn "
        "FROM case_study_sources WHERE case_study_id = v_id;"
    )
    lines.append("")
    for i, s in enumerate(sources):
        stype = s.get("source_type") or "other"
        lines.append(
            "  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)"
        )
        lines.append(
            f"  VALUES (v_id, {sql_str(s['label'])}, {sql_str(s['url'])}, "
            f"v_next_cn + {i}, {sql_str(stype)})"
        )
        lines.append("  ON CONFLICT (case_study_id, url) DO NOTHING;")
    lines.append("END")
    lines.append("$do_block$;")
    lines.append("")
    return "\n".join(lines)


def block_for_case(case: dict) -> str:
    slug = case["slug"]
    title = case["title"]
    subtitle = case.get("subtitle")
    preserve = case.get("preserve_existing_subtitle", False)
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
    origin_country = case.get("origin_country") or "Unknown"
    logo_domain = case.get("logo_domain")

    # In-place enrichment mode: only add new sources, don't touch the row
    # itself or its sections/bodies — the existing curated content stays.
    if preserve:
        return _block_sources_only(slug, sources)

    lines: list[str] = []
    lines.append("DO $do_block$")
    lines.append("DECLARE")
    lines.append("  v_id uuid;")
    for sec in sections:
        var = SECTION_VAR_MAP.get(sec["slug"])
        if var:
            lines.append(f"  {var} uuid;")
    lines.append("BEGIN")

    # content_items upsert
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

    # content_company_profiles — insert if missing, otherwise backfill website + logo
    fc = len(founders) if founders else "NULL"
    web_sql = sql_str(website_url(logo_domain)) if logo_domain else "NULL"
    logo_sql = sql_str(logo_url(logo_domain)) if logo_domain else "NULL"
    entry_date_sql = sql_str(f"{entry_year}-01-01") if entry_year else "NULL"

    lines.append("  IF NOT EXISTS (SELECT 1 FROM content_company_profiles WHERE content_id = v_id) THEN")
    lines.append("    INSERT INTO content_company_profiles (")
    lines.append("      content_id, company_name, company_logo, website, origin_country, target_market,")
    lines.append("      entry_date, industry, founder_count, employee_count, is_profitable")
    lines.append("    ) VALUES (")
    lines.append(
        f"      v_id, {sql_str(company)}, {logo_sql}, {web_sql}, "
        f"{sql_str(origin_country)}, 'Australia',"
    )
    lines.append(
        f"      {entry_date_sql}, {sql_str(industry)}, {fc}, NULL, NULL"
    )
    lines.append("    );")
    lines.append("  ELSE")
    lines.append("    -- Backfill logo + website on existing rows that are still missing them.")
    lines.append("    UPDATE content_company_profiles")
    lines.append(f"      SET website = COALESCE(website, {web_sql}),")
    lines.append(f"          company_logo = COALESCE(company_logo, {logo_sql})")
    lines.append("      WHERE content_id = v_id;")
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

    # content_sections + content_bodies
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
        # Trim any orphan body rows beyond the new body count.
        max_sort = len(sec["bodies"])
        lines.append(
            f"  DELETE FROM content_bodies WHERE section_id = {var} AND sort_order > {max_sort};"
        )
        lines.append("")

    # case_study_sources
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
