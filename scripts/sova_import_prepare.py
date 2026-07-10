#!/usr/bin/env python3
"""MES-147 Phase 1: prepare staged-import proposals for the Sova missing entries.

Transforms data/outputs/sova-gap-analysis/missing-from-mes.csv (the MES-146
"missing" bucket) into per-target-table proposal CSVs under
data/outputs/sova-import/, ready for human diff-review. NO database writes —
this only produces review artefacts. The apply step (Phase 3) is a separate,
approval-gated idempotent data-seed migration.

Routing (per MES-147):
- Category Funding                  -> investors (investor_type: grant/vc/angel/accelerator/venture_debt)
- Type Government (non-funding)     -> trade_investment_agencies
- Category Connections / Programs   -> innovation_ecosystem (introduces a new "Community" type value)
- Category Advice                   -> service_providers

Every row carries confidence (high|medium|low), validation_flags, and
proposed_action (import|review|skip-candidate). Rows the rules can't place
confidently are downgraded, never dropped.

Usage:
    python3 scripts/sova_import_prepare.py --snapshot-dir <dir>

where <dir> holds the MES snapshots from sova_gap_analysis.py --fetch plus
locations.json / sector_vocabulary.json / slugs_*.json (see SNAPSHOT_FILES).
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sova_gap_analysis import OUT_DIR as GAP_DIR, parse_host, registrable_domain  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "data" / "outputs" / "sova-import"
SOURCE_TAG = "sova_directory_2026-07"

SNAPSHOT_FILES = {
    "locations": "locations.json",
    "sector_vocabulary": "sector_vocabulary.json",
    "slugs_investors": "investors_public.json",   # has slug column
    "slugs_ie": "slugs_ie.json",
    "slugs_sp": "slugs_sp.json",
    "slugs_tia": "slugs_tia.json",
}

# Sova State -> (location text, locations.name for location_id, flag)
STATE_TO_LOCATION = {
    "VIC": ("Melbourne, VIC", "Victoria", None),
    "NSW": ("Sydney, NSW", "New South Wales", None),
    "QLD": ("Brisbane, QLD", "Queensland", None),
    "WA": ("Perth, WA", "Western Australia", None),
    "SA": ("Adelaide, SA", "South Australia", None),
    "NT": ("Darwin, NT", "Northern Territory", None),
    "ACT": ("Canberra, ACT", "ACT", None),
    "TAS": ("Hobart, TAS", None, "no Tasmania row in locations table"),
    "National": ("Australia", None, "national org — no matching locations row"),
}

PLATFORM_HOST_FLAG = "source URL is a platform/social page, not an org website"

# Sova industry spellings -> sector_vocabulary raw_value (verified 2026-07-10)
INDUSTRY_ALIASES = {
    "tech": "technology",
    "agtech": "agritech",
    "retail": "retail & e-commerce",
    "biotech": "healthtech",  # nearest vocab entry; flagged below
}


def slugify(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return re.sub(r"-{2,}", "-", s)


def load_lookups(snapshot_dir: Path):
    loc_by_name = {r["name"]: r["id"] for r in json.load((snapshot_dir / "locations.json").open())}
    vocab = {}
    for r in json.load((snapshot_dir / "sector_vocabulary.json").open()):
        vocab[r["raw_value"].strip().lower()] = (r.get("sector_slugs") or [], bool(r.get("is_agnostic")))
    taken = {
        "investors": {r.get("slug") for r in json.load((snapshot_dir / "investors_public.json").open())},
        "innovation_ecosystem": {r.get("slug") for r in json.load((snapshot_dir / "slugs_ie.json").open())},
        "service_providers": {r.get("slug") for r in json.load((snapshot_dir / "slugs_sp.json").open())},
        "trade_investment_agencies": {r.get("slug") for r in json.load((snapshot_dir / "slugs_tia.json").open())},
    }
    return loc_by_name, vocab, taken


def map_sectors(industries: str, vocab) -> tuple[list[str], bool, list[str]]:
    """Sova 'Industries' ('Tech; HealthTech') -> (sector_slugs, agnostic, flags)."""
    raw_terms = [t.strip() for t in (industries or "").replace(",", ";").split(";") if t.strip()]
    if not raw_terms:
        return [], True, []
    slugs, flags, agnostic = [], [], False
    for term in raw_terms:
        key = term.lower()
        if key in INDUSTRY_ALIASES:
            if key == "biotech":
                flags.append("BioTech mapped via healthtech (no biotech vocab entry)")
            key = INDUSTRY_ALIASES[key]
        hit = vocab.get(key)
        if hit is None:
            flags.append(f"industry '{term}' not in sector_vocabulary")
        else:
            term_slugs, is_agn = hit
            agnostic = agnostic or is_agn
            slugs.extend(s for s in term_slugs if s not in slugs)
    if not slugs and not agnostic:
        flags.append("no industries mapped — defaulting sector_agnostic=true")
        agnostic = True
    return slugs, agnostic, flags


def investor_type_for(row: dict) -> tuple[str, str, list[str]]:
    """-> (investor_type, confidence, flags) for Category=Funding rows."""
    t, text = row["Type"], f"{row['Name']} {row['Description']}".lower()
    if t in ("Grant", "Scholarship"):
        return "grant", "high", []
    if t == "Government":
        return "grant", "high", []
    if t == "Accelerator":
        return "accelerator", "high", []
    if t == "Competition":
        return "grant", "medium", ["competition mapped to investor_type=grant — prize money, review fit"]
    if t == "University":
        return "grant", "medium", ["university funding mapped to grant — review fit"]
    if t == "Finance":
        if "debt" in text or "loan" in text or "revenue" in text:
            return "venture_debt", "medium", []
        return "venture_debt", "low", ["Finance type — verify venture_debt fits"]
    if t == "Corporate":
        return "vc", "medium", ["corporate investor mapped to vc (no cvc value exists)"]
    # Investor
    if "angel" in text:
        return "angel", "high", []
    return "vc", "high", []


def route(row: dict) -> tuple[str, str, list[str]]:
    """-> (target_table, confidence, flags)."""
    cat, typ = row["Category"], row["Type"]
    if typ == "Government" and cat != "Funding":
        return "trade_investment_agencies", "high", []
    if cat == "Funding":
        return "investors", "high", []
    if cat == "Advice":
        if typ == "Tool":
            return "service_providers", "low", ["Advice/Tool — may not belong in a directory at all"]
        return "service_providers", "high", []
    if cat in ("Connections", "Programs"):
        conf, flags = "high", []
        if typ == "Tool":
            conf, flags = "low", ["Tool routed to innovation_ecosystem — review whether to skip"]
        elif typ == "Corporate":
            conf, flags = "medium", ["corporate program — review fit"]
        return "innovation_ecosystem", conf, flags
    return "innovation_ecosystem", "low", [f"unmapped category '{cat}' — defaulted"]


def ie_type_for(sova_type: str) -> tuple[str, list[str]]:
    existing = {"Accelerator": "Accelerator", "Incubator": "Incubator", "University": "Incubator"}
    if sova_type in existing:
        flags = ["university program mapped to Incubator"] if sova_type == "University" else []
        return existing[sova_type], flags
    if sova_type in ("Community", "Competition", "Program", "Corporate", "Tool"):
        return "Community", [] if sova_type == "Community" else [f"type '{sova_type}' mapped to Community"]
    return "Community", [f"unknown Sova type '{sova_type}' mapped to Community"]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--snapshot-dir", type=Path, required=True)
    args = ap.parse_args()

    loc_by_name, vocab, taken_slugs = load_lookups(args.snapshot_dir)
    with (GAP_DIR / "missing-from-mes.csv").open() as fh:
        missing = list(csv.DictReader(fh))
    # MES-146 second pass reclassified this row to needs-review (parent org exists)
    reclassified = {"AgriFutures Funding"}

    proposals: dict[str, list[dict]] = {t: [] for t in taken_slugs}
    for row in missing:
        if row["Name"] in reclassified:
            continue
        table, conf, flags = route(row)
        flags = list(flags)

        host = parse_host(row["Source URL"])
        website = row["Source URL"].strip()
        if host and registrable_domain(host) in ("getsova.com.au",):
            website = ""
            flags.append("no canonical website — Source URL points back to the Sova directory")
        elif host and registrable_domain(host) in (
            "linkedin.com", "facebook.com", "instagram.com", "eventbrite.com", "meetup.com",
        ):
            flags.append(PLATFORM_HOST_FLAG)

        loc_text, loc_name, loc_flag = STATE_TO_LOCATION.get(
            row["State"], (row["State"], None, f"unknown state '{row['State']}'"))
        if loc_flag:
            flags.append(loc_flag)
        location_id = loc_by_name.get(loc_name, "") if loc_name else ""

        sector_slugs, agnostic, sector_flags = map_sectors(row["Industries"], vocab)
        flags.extend(sector_flags)

        slug = base_slug = slugify(row["Name"])
        n = 2
        while slug in taken_slugs[table]:
            slug = f"{base_slug}-{n}"
            n += 1
        taken_slugs[table].add(slug)
        if not row["Description"].strip():
            flags.append("empty description — target column is NOT NULL")

        prop = {
            "proposed_name": row["Name"],
            "proposed_slug": slug,
            "proposed_description": row["Description"].strip(),
            "proposed_website": website,
            "proposed_location": loc_text,
            "proposed_location_id": location_id,
            "proposed_sector_tags": "; ".join(sector_slugs),
            "proposed_sector_agnostic": str(agnostic).lower(),
        }
        if table == "investors":
            itype, iconf, iflags = investor_type_for(row)
            flags.extend(iflags)
            conf = min(conf, iconf, key=["low", "medium", "high"].index)
            prop["proposed_investor_type"] = itype
            prop["proposed_country"] = "Australia"
        elif table == "innovation_ecosystem":
            ie_type, tflags = ie_type_for(row["Type"])
            flags.extend(tflags)
            if ie_type == "Community":
                flags.append("introduces NEW innovation_ecosystem type value 'Community' (product decision)")
            prop["proposed_type"] = ie_type
            prop["proposed_founded"] = ""
            prop["proposed_employees"] = ""
        elif table == "trade_investment_agencies":
            is_state_gov = bool(host) and any(
                f".{s}.gov.au" in f".{host}" for s in ("vic", "nsw", "qld", "wa", "sa", "tas", "nt", "act"))
            prop["proposed_organisation_type"] = "state_body" if is_state_gov else "federal_agency"
            prop["proposed_government_level"] = "state" if is_state_gov else "federal"
            prop["proposed_is_government_funded"] = "true"
            prop["proposed_founded"] = ""
            prop["proposed_employees"] = ""
        elif table == "service_providers":
            text = f"{row['Name']} {row['Description']}".lower()
            if re.search(r"\blegal\b|\blaw(yers?| firm)?\b|solicitor", text):
                services = ["Legal Services"]
            elif re.search(r"account|tax|r&d|grant consult", text):
                services = ["Accounting & Tax"]
            elif re.search(r"media|news|podcast|magazine|publication", text):
                services, _ = ["Media & Content"], flags.append("startup media outlet — review directory fit")
            elif re.search(r"mentor|coach", text):
                services = ["Mentoring & Advisory"]
            else:
                services = ["Advisory"]
                flags.append("generic 'Advisory' services tag — refine in review")
            prop["proposed_services"] = "; ".join(services)
            prop["proposed_founded"] = ""
            prop["proposed_employees"] = ""

        if conf == "low":
            action = "review"
        elif any("review" in f or "NEW" in f or "decision" in f for f in flags):
            action = "review"
        else:
            action = "import"
        proposals[table].append({
            **{c: row.get(c, "") for c in ("Name", "Category", "Type", "State", "Amount",
                                           "Timing / Deadline", "Status", "Industries",
                                           "Founder tags", "Description", "Source URL",
                                           "Notion page URL")},
            **prop,
            "confidence": conf,
            "validation_flags": " | ".join(flags),
            "proposed_action": action,
            "source": SOURCE_TAG,
        })

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    summary = {}
    for table, rows in proposals.items():
        if not rows:
            continue
        rows.sort(key=lambda r: (["high", "medium", "low"].index(r["confidence"]), r["Name"]))
        path = OUT_DIR / f"proposed-{table}.csv"
        with path.open("w", newline="") as fh:
            writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()), extrasaction="ignore")
            writer.writeheader()
            writer.writerows(rows)
        summary[table] = {
            "rows": len(rows),
            "import": sum(r["proposed_action"] == "import" for r in rows),
            "review": sum(r["proposed_action"] == "review" for r in rows),
            "high": sum(r["confidence"] == "high" for r in rows),
            "medium": sum(r["confidence"] == "medium" for r in rows),
            "low": sum(r["confidence"] == "low" for r in rows),
        }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
