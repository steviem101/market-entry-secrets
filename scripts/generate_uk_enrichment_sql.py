"""Generate one PL/pgSQL DO block per UK case study to enrich existing rows.

Reads scripts/parsed_uk_enriched.json and writes:
  scripts/uk_enrichment.sql                       - all 20 DO blocks concatenated
  scripts/uk_enrichment_blocks/{NN}-{slug}.sql    - one block per case

The blocks are idempotent (skip-if-exists / UPDATE-or-INSERT semantics) and
strictly respect the constraints:
  - NO DELETE against any table
  - NO schema changes (DDL)
  - Existing rows can be UPDATEd in place; new rows are INSERTed
  - Re-running the same block has no extra effect

Per case the block:
  1. Looks up content_items.id by slug; aborts if not found
  2. UPDATEs content_items: subtitle, tldr, quick_facts, status='published',
     read_time. (Title, slug, category_id, content_type are left untouched.)
  3. UPDATEs content_company_profiles.founder_count if founders are known
  4. INSERTs content_founders rows (skip if any already exist for content_id)
  5. For each enriched section (entry-strategy, success-factors, key-metrics,
     lessons-learned): looks up by (content_id, slug); UPDATEs each existing
     body in sort_order, INSERTs new bodies for any sort_order beyond the
     existing maximum. Existing sections not in the enrichment plan
     (e.g. challenges-faced) are left fully intact.
  6. INSERTs case_study_sources with ON CONFLICT (case_study_id, url)
     DO NOTHING.
"""

from __future__ import annotations

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PARSED_PATH = REPO_ROOT / "scripts" / "parsed_uk_enriched.json"
OUT_BUNDLE = REPO_ROOT / "scripts" / "uk_enrichment.sql"
OUT_DIR = REPO_ROOT / "scripts" / "uk_enrichment_blocks"


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
    subtitle = case.get("subtitle")
    tldr = case.get("tldr") or []
    quick_facts = case.get("quick_facts") or []
    read_time = case.get("read_time") or 2
    sections = case.get("sections") or []
    founders = case.get("founders") or []
    sources = case.get("sources") or []

    section_var_map = {
        "entry-strategy": "v_sec_entry",
        "success-factors": "v_sec_success",
        "key-metrics": "v_sec_metrics",
        "lessons-learned": "v_sec_lessons",
    }

    lines: list[str] = []
    lines.append("DO $do_block$")
    lines.append("DECLARE")
    lines.append("  v_id uuid;")
    for sec in sections:
        var = section_var_map.get(sec["slug"])
        if var:
            lines.append(f"  {var} uuid;")
    lines.append("BEGIN")
    lines.append(f"  SELECT id INTO v_id FROM content_items WHERE slug = {sql_str(slug)};")
    lines.append("  IF v_id IS NULL THEN")
    lines.append(f"    RAISE EXCEPTION 'content_items row missing for slug {slug}';")
    lines.append("  END IF;")
    lines.append("")

    # ---------------- content_items UPDATE ----------------
    lines.append("  UPDATE content_items SET")
    lines.append(f"    subtitle = {sql_str(subtitle)},")
    lines.append(f"    tldr = {sql_text_array(tldr)},")
    lines.append(f"    quick_facts = {sql_jsonb(quick_facts)},")
    lines.append("    status = 'published',")
    lines.append(f"    read_time = {read_time},")
    lines.append("    style_version = 2")
    lines.append("  WHERE id = v_id;")
    lines.append("")

    # ---------------- content_company_profiles founder_count ----------------
    if founders:
        lines.append("  UPDATE content_company_profiles")
        lines.append(f"    SET founder_count = {len(founders)}")
        lines.append("    WHERE content_id = v_id;")
        lines.append("")

    # ---------------- content_founders insert (skip if any exist) ----------------
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

    # ---------------- sections + bodies ----------------
    for sec in sections:
        slug_sec = sec["slug"]
        var = section_var_map.get(slug_sec)
        if not var:
            continue
        lines.append(f"  -- Section: {slug_sec}")
        lines.append(f"  SELECT id INTO {var} FROM content_sections")
        lines.append(f"   WHERE content_id = v_id AND slug = {sql_str(slug_sec)};")
        # Defensive: if the section is missing, create it. (All UK rows currently
        # have these 4 sections, but this keeps the block self-healing.)
        lines.append(f"  IF {var} IS NULL THEN")
        lines.append("    INSERT INTO content_sections (content_id, title, slug, sort_order, is_active)")
        lines.append(
            f"    VALUES (v_id, {sql_str(sec['title'])}, {sql_str(slug_sec)}, "
            f"COALESCE((SELECT MAX(sort_order)+1 FROM content_sections WHERE content_id = v_id), 1), true)"
        )
        lines.append(f"    RETURNING id INTO {var};")
        lines.append("  ELSE")
        lines.append("    UPDATE content_sections")
        lines.append(f"      SET title = {sql_str(sec['title'])}, is_active = true")
        lines.append(f"      WHERE id = {var};")
        lines.append("  END IF;")

        for i, body in enumerate(sec["bodies"], start=1):
            lines.append(
                f"  IF EXISTS (SELECT 1 FROM content_bodies "
                f"WHERE section_id = {var} AND sort_order = {i}) THEN"
            )
            lines.append(
                f"    UPDATE content_bodies SET body_text = {sql_str(body)}, "
                f"updated_at = now()"
            )
            lines.append(f"      WHERE section_id = {var} AND sort_order = {i};")
            lines.append("  ELSE")
            lines.append(
                "    INSERT INTO content_bodies "
                "(content_id, section_id, body_text, sort_order, content_type)"
            )
            lines.append(
                f"    VALUES (v_id, {var}, {sql_str(body)}, {i}, 'case_study');"
            )
            lines.append("  END IF;")
        lines.append("")

    # ---------------- sources ----------------
    for s in sources:
        url = s["url"]
        label = s["label"]
        cn = s.get("citation_number")
        cn_sql = str(cn) if cn else "NULL"
        stype = s.get("source_type") or "other"
        lines.append("  INSERT INTO case_study_sources (case_study_id, label, url, citation_number, source_type)")
        lines.append(
            f"  VALUES (v_id, {sql_str(label)}, {sql_str(url)}, {cn_sql}, {sql_str(stype)})"
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
        bundle_parts.append(f"-- Case {i}/{len(cases)}: {case['company_name']}")
        bundle_parts.append(block)
    OUT_BUNDLE.write_text("\n".join(bundle_parts), encoding="utf-8")
    print(f"Wrote {len(cases)} enrichment blocks to {OUT_DIR}")
    print(f"Bundle: {OUT_BUNDLE}")


if __name__ == "__main__":
    main()
