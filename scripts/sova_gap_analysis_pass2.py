#!/usr/bin/env python3
"""MES-146 second pass: loose fuzzy matching over the first-pass "missing" rows.

The first pass (sova_gap_analysis.py) only proposes a match at name similarity
>= 0.72 or on a domain hit. This pass re-checks data/outputs/sova-gap-analysis/
missing-from-mes.csv at a much looser threshold, routed by Sova category to the
MES tables where that kind of record actually lives:

- Funding (grants live in `investors` on MES)  -> investors_public, trade_investment_agencies
- Connections/Community (associations)         -> innovation_ecosystem, trade_investment_agencies
- Advice/Expert (mentors + service providers)  -> community_members_public, service_providers
- Programs/Government                          -> innovation_ecosystem, trade_investment_agencies, investors_public

Extra signals beyond pass 1:
- generic tokens (program, grant, fund, network, ...) are stripped before
  comparing, so "NSW Clean Technology Innovation Grants" can hit a
  "Clean Technology Innovation" style investor record;
- for mentors, the Sova org name is also searched inside the mentor's
  title/description ("Founder of Sprintlaw" style bios).

Outputs (same folder):
- second-pass-candidates.csv  — missing rows with >=1 loose candidate (top 3 each)
- missing-confirmed.csv       — rows with no candidate even at the loose bar (Sova format)

Read-only: consumes the local snapshot; never talks to Supabase.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sova_gap_analysis import (  # noqa: E402
    OUT_DIR, SOVA_CSV, SNAPSHOT_SOURCES, name_similarity, normalise_name,
)

# 0.45 was trialled and produced ~148/158 rows of noise; 0.60 keeps the file
# small enough to actually review while still catching the real near-misses.
LOOSE_THRESHOLD = 0.60
TOP_N = 3

# Generic tokens that carry no identity: strip for the "core name" comparison.
GENERIC_TOKENS = {
    "the", "of", "and", "for", "a", "in",
    "program", "programs", "programme", "grant", "grants", "fund", "funds",
    "funding", "scheme", "initiative", "loan", "loans", "support",
    "network", "hub", "group", "club", "association", "foundation",
    "australia", "australian", "aus", "national",
    "nsw", "vic", "qld", "wa", "sa", "nt", "act", "tas", "tasmania",
    "queensland", "victoria", "sydney", "melbourne", "brisbane", "perth",
    "adelaide", "canberra", "darwin", "hobart",
}

CATEGORY_TABLES = {
    "Funding": ["investors_public", "trade_investment_agencies"],
    "Connections": ["innovation_ecosystem", "trade_investment_agencies"],
    "Advice": ["community_members_public", "service_providers"],
    "Programs": ["innovation_ecosystem", "trade_investment_agencies", "investors_public"],
}


def core_name(norm: str) -> str:
    tokens = [t for t in norm.split() if t not in GENERIC_TOKENS]
    return " ".join(tokens)


def loose_similarity(sova_norm: str, mes_norm: str) -> tuple[float, str]:
    """Best of full-name and generic-token-stripped comparison."""
    full = name_similarity(sova_norm, mes_norm)
    ca, cb = core_name(sova_norm), core_name(mes_norm)
    core = name_similarity(ca, cb) if ca and cb else 0.0
    if core > full:
        return core, f"core-name '{ca}' ~ '{cb}'"
    return full, "full normalised name"


def bio_mention(sova_norm: str, rec: dict) -> bool:
    """Does the mentor's title/description mention the Sova org?"""
    if rec["table"] != "community_members_public" or len(sova_norm) < 5:
        return False
    return sova_norm in rec["bio_norm"]


def main() -> None:
    import argparse
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--snapshot-dir", type=Path, required=True)
    args = ap.parse_args()

    mes: dict[str, list[dict]] = {}
    for table in SNAPSHOT_SOURCES:
        rows = json.load((args.snapshot_dir / f"{table}.json").open())
        mes[table] = [{
            "table": table,
            "id": r.get("id"),
            "name": r.get("name") or "",
            "norm": normalise_name(r.get("name") or ""),
            "bio_norm": re.sub(r"[^a-z0-9\s]", " ",
                               f"{r.get('title') or ''} {r.get('description') or ''}".lower()),
        } for r in rows]

    missing_csv = OUT_DIR / "missing-from-mes.csv"
    with missing_csv.open() as fh:
        reader = csv.DictReader(fh)
        sova_columns = reader.fieldnames or []
        missing = list(reader)

    cand_cols = []
    for i in range(1, TOP_N + 1):
        cand_cols += [f"candidate_{i}_table", f"candidate_{i}_name", f"candidate_{i}_score", f"candidate_{i}_basis"]
    out_cols = sova_columns + ["target_tables"] + cand_cols

    with_candidates, confirmed_missing = [], []
    for row in missing:
        norm = normalise_name(row["Name"])
        tables = CATEGORY_TABLES.get(row["Category"], list(SNAPSHOT_SOURCES))
        scored = []
        for table in tables:
            for rec in mes[table]:
                sim, basis = loose_similarity(norm, rec["norm"])
                if bio_mention(norm, rec):
                    sim, basis = max(sim, 0.75), "org name appears in mentor bio"
                if sim >= LOOSE_THRESHOLD:
                    scored.append((sim, basis, rec))
        scored.sort(key=lambda t: t[0], reverse=True)
        # keep at most one candidate per MES record
        seen, top = set(), []
        for sim, basis, rec in scored:
            if rec["id"] in seen:
                continue
            seen.add(rec["id"])
            top.append((sim, basis, rec))
            if len(top) == TOP_N:
                break

        if not top:
            confirmed_missing.append(row)
            continue
        out = {c: row.get(c, "") for c in sova_columns}
        out["target_tables"] = "; ".join(tables)
        for i, (sim, basis, rec) in enumerate(top, start=1):
            out[f"candidate_{i}_table"] = rec["table"]
            out[f"candidate_{i}_name"] = rec["name"]
            out[f"candidate_{i}_score"] = f"{sim:.3f}"
            out[f"candidate_{i}_basis"] = basis
        with_candidates.append(out)

    with_candidates.sort(key=lambda r: -float(r["candidate_1_score"]))
    with (OUT_DIR / "second-pass-candidates.csv").open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=out_cols, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(with_candidates)
    with (OUT_DIR / "missing-confirmed.csv").open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=sova_columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(confirmed_missing)

    print(json.dumps({
        "missing_in": len(missing),
        "with_loose_candidates": len(with_candidates),
        "confirmed_missing": len(confirmed_missing),
    }, indent=2))


if __name__ == "__main__":
    main()
