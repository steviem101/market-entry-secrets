#!/usr/bin/env python3
"""MES-147 Phase 3: generate the idempotent seed migration from the approved
per-table proposal CSVs (data/outputs/sova-import/proposed-*.csv).

Emits INSERT ... ON CONFLICT (slug) DO NOTHING for each target table so the
migration is safe to replay (preview branches, re-runs). Only rows with
proposed_action == 'import' are included. Writes the .sql to supabase/migrations/.

Run: python3 scripts/sova_generate_migration.py
"""

from __future__ import annotations

import csv
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "data" / "outputs" / "sova-import"
MIGRATION = REPO / "supabase" / "migrations" / "20260711120000_seed_sova_directory_import.sql"
SOURCE_TAG = "sova_directory_2026-07"


def q(v: str) -> str:
    """Quote a SQL string literal, or NULL for empty."""
    if v is None or v == "":
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def qs(v: str) -> str:
    """Quote a SQL string literal, emitting '' (not NULL) for empty — for
    NOT NULL text columns whose 'unknown' convention is an empty string
    (founded/employees on ecosystem/provider/agency tables)."""
    return "'" + str(v or "").replace("'", "''") + "'"


def arr(items) -> str:
    """Postgres text[] literal from a '; '-joined string or list."""
    if isinstance(items, str):
        items = [x.strip() for x in items.split(";") if x.strip()]
    if not items:
        return "'{}'::text[]"
    inner = ", ".join(q(x) for x in items)
    return f"ARRAY[{inner}]::text[]"


def rows(table: str):
    path = SRC / f"proposed-{table}.csv"
    with path.open() as fh:
        return [r for r in csv.DictReader(fh) if r["proposed_action"] == "import"]


def loc_id(r) -> str:
    v = r.get("proposed_location_id", "")
    return f"'{v}'::uuid" if v else "NULL"


def bool_lit(r) -> str:
    return "true" if r.get("proposed_sector_agnostic") == "true" else "false"


def block(table, columns, values_fn, rs):
    lines = [f"insert into public.{table} ({', '.join(columns)}) values"]
    vals = [f"  ({values_fn(r)})" for r in rs]
    lines.append(",\n".join(vals))
    lines.append("on conflict (slug) do nothing;")
    return "\n".join(lines)


def main() -> None:
    inv = rows("investors")
    ie = rows("innovation_ecosystem")
    sp = rows("service_providers")
    tia = rows("trade_investment_agencies")
    ev = rows("events")
    total = len(inv) + len(ie) + len(sp) + len(tia) + len(ev)

    out = [
        "-- MES-147: seed the missing Sova directory entries into MES directories.",
        "-- Source: data/outputs/sova-import/ (reviewer-approved 2026-07-10).",
        "-- Idempotent: ON CONFLICT (slug) DO NOTHING — safe to replay on preview branches.",
        f"-- {total} rows: investors {len(inv)}, innovation_ecosystem {len(ie)}, "
        f"service_providers {len(sp)}, trade_investment_agencies {len(tia)}, events {len(ev)}.",
        "-- Additive only; no updates to existing rows; provenance carried in source columns.",
        "",
    ]

    # investors
    inv_cols = ["name", "description", "investor_type", "location", "website", "slug",
                "country", "sector_focus", "sector_tags", "sector_agnostic"]
    out.append(block("investors", inv_cols, lambda r: ", ".join([
        q(r["proposed_name"]), q(r["proposed_description"]), q(r["proposed_investor_type"]),
        q(r["proposed_location"]), q(r["proposed_website"]), q(r["proposed_slug"]),
        q(r.get("proposed_country", "Australia")), arr(r.get("proposed_sector_focus", "")),
        arr(r["proposed_sector_tags"]), bool_lit(r),
    ]), inv))
    out.append("")

    # innovation_ecosystem
    ie_cols = ["name", "description", "location", "founded", "employees", "website", "slug",
               "type", "sectors", "sector_tags", "sector_agnostic"]
    out.append(block("innovation_ecosystem", ie_cols, lambda r: ", ".join([
        q(r["proposed_name"]), q(r["proposed_description"]), q(r["proposed_location"]),
        qs(r.get("proposed_founded", "")), qs(r.get("proposed_employees", "")),
        q(r["proposed_website"]), q(r["proposed_slug"]),
        arr(r.get("proposed_type", "")), arr(r.get("proposed_sectors", "")),
        arr(r["proposed_sector_tags"]), bool_lit(r),
    ]), ie))
    out.append("")

    # service_providers
    sp_cols = ["name", "description", "location", "founded", "employees", "services",
               "website", "slug", "sector_tags", "sector_agnostic"]
    out.append(block("service_providers", sp_cols, lambda r: ", ".join([
        q(r["proposed_name"]), q(r["proposed_description"]), q(r["proposed_location"]),
        qs(r.get("proposed_founded", "")), qs(r.get("proposed_employees", "")),
        arr(r.get("proposed_services", "Advisory")), q(r["proposed_website"]),
        q(r["proposed_slug"]), arr(r["proposed_sector_tags"]), bool_lit(r),
    ]), sp))
    out.append("")

    # trade_investment_agencies
    tia_cols = ["name", "description", "location", "founded", "employees", "services",
                "website", "website_url", "slug", "organisation_type", "government_level",
                "is_government_funded", "sector_tags", "sector_agnostic"]
    out.append(block("trade_investment_agencies", tia_cols, lambda r: ", ".join([
        q(r["proposed_name"]), q(r["proposed_description"]), q(r["proposed_location"]),
        qs(r.get("proposed_founded", "")), qs(r.get("proposed_employees", "")),
        arr("Government & Industry Support"), q(r["proposed_website"]), q(r["proposed_website"]),
        q(r["proposed_slug"]), q(r.get("proposed_organisation_type", "")),
        q(r.get("proposed_government_level", "")),
        "true" if r.get("proposed_is_government_funded") == "true" else "false",
        arr(r["proposed_sector_tags"]), bool_lit(r),
    ]), tia))
    out.append("")

    # events (undated recurring festivals -> date_precision 'tbc', status needs_review)
    ev_cols = ["title", "description", "location", "type", "category", "website_url", "slug",
               "city", "state_region", "status", "date_precision", "frequency",
               "sector_tags", "sector_agnostic"]
    out.append(block("events", ev_cols, lambda r: ", ".join([
        q(r["proposed_name"]), q(r["proposed_description"]), q(r["proposed_location"]),
        q(r["proposed_type"]), q(r["proposed_category"]), q(r["proposed_website"]),
        q(r["proposed_slug"]), q(r.get("proposed_city", "")), q(r.get("proposed_state_region", "")),
        q("needs_review"), q("tbc"), q(r.get("proposed_frequency", "Annual")),
        arr(r["proposed_sector_tags"]), bool_lit(r),
    ]), ev))
    out.append("")

    MIGRATION.write_text("\n".join(out))
    print(f"wrote {MIGRATION.relative_to(REPO)} ({total} rows)")


if __name__ == "__main__":
    main()
