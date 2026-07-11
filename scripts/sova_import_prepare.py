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

# Per-row overrides from the 2026-07-10 human recheck of the Community bucket
# against existing innovation_ecosystem type usage (type is a multi-value array;
# precincts = Incubator + Coworking Space, peak bodies = Industry Body, gov
# programs = empty type like Landing Pad / Going Global). Keyed by Sova Name.
IE_TYPE_OVERRIDES = {
    "Australian Network on Disability": ["Industry Body"],
    "NT Indigenous Business Network": ["Industry Body"],
    "Pride in Diversity": ["Industry Body"],
    "StartupWA": ["Industry Body"],
    "Startup Tasmania": ["Industry Body"],
    "Supply Nation": ["Industry Body"],
    "Victorian CleanTech Cluster": ["Industry Body"],
    "Game Plus": ["Coworking Space"],
    "Little Tokyo Two": ["Coworking Space"],
    "Cremorne Digital Hub": ["Incubator", "Coworking Space"],
    "Lot Fourteen": ["Incubator", "Coworking Space"],
    "Tech Central": ["Incubator", "Coworking Space"],
    "Switch Start Scale": ["Accelerator"],
    "Self-Employment Assistance": [],
    "TAFE NSW Women in Business Program": [],
}
ROUTE_OVERRIDES = {
    # software engineering company mis-tagged as Community by Sova
    "EverestEngineering": ("service_providers", "medium",
                           ["Sova tagged Community but this is a software dev firm"]),
}
SKIP_OVERRIDES = {
    "SXSW Sydney": "discontinued (no 2026 edition) — do not import",
    "StartCon": "inactive since 2019 — do not import",
    # Commercial debt / invoice / revenue-based lenders — not equity investors,
    # out of scope for the investors directory (per review 2026-07-10).
    "Earlypay": "commercial lender (invoice + equipment finance) — not an equity investor",
    "ScotPac": "commercial SME lender (invoice/trade/asset finance) — not an equity investor",
    "Wayflyer": "revenue-based financing lender — not an equity investor",
    "Grapple": "invoice-finance lender — not an equity investor",
    # No longer running (Sova Status=Inactive) — pitch-competition siblings of
    # the already-skipped SXSW Sydney / StartCon rows, plus a paused NSW program.
    "SXSW Sydney Pitch": "discontinued with SXSW Sydney (Sova Status=Inactive)",
    "StartCon - Pitch for $1 Million": "inactive since 2019 (Sova Status=Inactive)",
    "NSW MVP Ventures Program": "Sova Status=Inactive — verify before any future import",
}

# Programs that are still running but under a new name (rebrands). Import under
# the current name; description already explains the change.
NAME_OVERRIDES = {
    "Fearless Innovator Grant": "FoundHer Grant Program",
}

# Live-URL check (2026-07-10) found these orgs are ACTIVE but their Sova URL is
# dead (org moved domain). Corrected to the verified current URL via web search
# so we never ship a broken link. Not stale entities — just stale URLs.
URL_OVERRIDES = {
    "Intersekt Festival": "https://www.intersektfestival.com/",
    "Spark Festival": "https://sparkfestival.co/",
    "Her Tech Circle": "https://www.hertechcircle.org/",
    "Victorian CleanTech Cluster": "https://www.victoriancleantech.org.au/",
    "Mentor Walks": "https://www.mentorwalks.org/",
    "TEC (The Executive Connection)": "https://www.tec.net.au/",
    "Little Tokyo Two": "https://www.littletokyotwo.com/",
    "Young Change Agents": "https://youngchangeagents.com/",
    "Biztech Lawyers": "https://www.biztechlawyers.com/",
    "EverestEngineering": "https://www.everest.engineering/",
    "Thrive Refugee Enterprise": "https://www.thriverefugeeenterprise.org.au/",
    "NT Indigenous Business Network": "https://www.ntibn.com.au/",
    "Entrepreneurs' Organisation (EO) Australia": "https://www.eoaustralia.org/",
    "Flinders NVI": "https://www.flinders.edu.au/new-venture-institute",
    "Founders Factory Nature Tech": "https://foundersfactory.com/western-australia-government-nature-tech-accelerator/",
    "D10x Accelerator": "https://dtb.solutions/",
}

# Reviewer decisions (2026-07-10, REVIEW-QUEUE.csv sign-off).
# Dropped outright — not a fit for any MES directory.
REVIEWER_DROPS = {
    "Sova": "reviewer: the Sova directory itself (self-referential)",
    "Australian Startup VC Directory": "reviewer: drop (a directory/tool, not a provider)",
    "Business Victoria Grants Finder": "reviewer: drop (government grants-finder tool)",
    "NSW Grants and Funding Finder": "reviewer: drop (government grants-finder tool)",
    "NSW Innovation Ecosystem Navigator": "reviewer: drop (government directory tool)",
    "Queensland Government Grants Finder": "reviewer: drop (government grants-finder tool)",
    "Service Tasmania Business Grants Finder": "reviewer: drop (government grants-finder tool)",
    "Pitchberry": "reviewer: drop (tool)",
    "RSL DefenceCare": "reviewer: drop (veteran welfare charity, not a startup service)",
}

# Ring-fenced for a SEPARATE future build: a "Media" database in the MES
# Resources area (startup media / news / publishers). Held out of the Sova
# import; written to ring-fenced-media.csv for the follow-up ticket (MES-148).
MEDIA_RINGFENCE = {
    "Equity Mates Media", "Foundr", "Overnight Success", "Startup Daily", "Startup News",
}

# Rows to force to needs-review with a note (not skipped, but not auto-import).
# (Luna Legal cleared by reviewer: "add, not duplicate" — imports normally.)
REVIEW_FLAGS = {}
# Recurring festivals/conferences -> events table (per review, 2026-07-10).
# type/category use existing events vocabulary; city/typical_month only where
# the Sova description states them (grounding rule — nothing invented).
FESTIVAL_EVENTS = {
    "Growth Summit": {"type": "Summit", "category": "Founders & Startups", "city": ""},
    "Intersekt Festival": {"type": "Festival + Conference", "category": "FinTech", "city": "Melbourne"},
    "SOUTHSTART": {"type": "Festival + Conference", "category": "Founders & Startups", "city": "Adelaide"},
    "Spark Festival": {"type": "Festival + Conference", "category": "Founders & Startups", "city": "Sydney"},
    "Startup 2 Scaleup Summit (S2S)": {"type": "Summit", "category": "Founders & Startups", "city": "Sydney"},
    "West Tech Fest": {"type": "Festival + Conference", "category": "Technology",
                       "city": "Perth", "typical_month": "December"},
}

# Sova industry spellings -> sector_vocabulary raw_value (verified 2026-07-10)
# Drives sector_tags (the CANONICAL slugs used for array-overlap filtering).
INDUSTRY_ALIASES = {
    "tech": "technology",
    "agtech": "agritech",
    "retail": "retail & e-commerce",
    "biotech": "healthtech",  # nearest vocab entry; flagged below
}

# Sova industry spellings -> existing display-chip labels (verified against live
# investors.sector_focus / innovation_ecosystem.sectors, 2026-07-10). These are
# human-readable chips only, NOT matching keys — sector_tags does the filtering.
DISPLAY_LABELS = {
    "tech": "Technology",
    "cleantech": "CleanTech",
    "healthtech": "HealthTech",
    "agtech": "AgTech",
    "fintech": "FinTech",
    "deeptech": "Deep Tech",
    "defence": "Defence & Space",
    "ai": "AI & Data",
    "retail": "Retail",
    "biotech": "Biotechnology",
}


# Genuine sector specialists whose Sova Industries field was blank but whose OWN
# business sits in a clear sector (manual pass, 2026-07-10). Deliberately narrow:
# per live convention, startup-serving law/accounting/R&D/PR firms stay agnostic
# (Deloitte, KPMG, LegalVision, LUNA, Radium, Treadstone are all agnostic), so
# only orgs that ARE a media/software/gaming business are tagged here.
SECTOR_OVERRIDES = {
    # startup/business media companies -> media slug
    "Foundr": (["technology-information-and-media"], ["Media"]),
    "Startup Daily": (["technology-information-and-media"], ["Media"]),
    "Startup News": (["technology-information-and-media"], ["Media"]),
    "Overnight Success": (["technology-information-and-media"], ["Media"]),
    "Equity Mates Media": (["technology-information-and-media", "financial-services"], ["Media"]),
    # software engineering firm
    "EverestEngineering": (["technology-information-and-media"], ["Technology"]),
    # game-developer community/hub
    "Game Plus": (["entertainment-providers", "technology-information-and-media"], ["Gaming"]),
}


def display_labels(industries: str) -> list[str]:
    out = []
    for term in [t.strip() for t in (industries or "").replace(",", ";").split(";") if t.strip()]:
        label = DISPLAY_LABELS.get(term.lower(), term)
        if label not in out:
            out.append(label)
    return out


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
        "events": {r.get("slug") for r in json.load((snapshot_dir / "slugs_events.json").open())},
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
    skips, media = [], []
    for row in missing:
        if row["Name"] in reclassified:
            continue
        if row["Name"] in SKIP_OVERRIDES:
            skips.append({**row, "skip_reason": SKIP_OVERRIDES[row["Name"]]})
            continue
        if row["Name"] in REVIEWER_DROPS:
            skips.append({**row, "skip_reason": REVIEWER_DROPS[row["Name"]]})
            continue
        if row["Name"] in ROUTE_OVERRIDES:
            table, conf, flags = ROUTE_OVERRIDES[row["Name"]]
            flags = list(flags)
        else:
            table, conf, flags = route(row)
            flags = list(flags)
        if row["Name"] in FESTIVAL_EVENTS:
            table, conf = "events", "high"
            flags.append("recurring festival routed to events table (needs event_date before approval)")

        host = parse_host(row["Source URL"])
        website = row["Source URL"].strip()
        if row["Name"] in URL_OVERRIDES:
            website = URL_OVERRIDES[row["Name"]]
            host = parse_host(website)
            flags.append("URL corrected — Sova link was dead; org confirmed live (web check 2026-07-10)")
        elif host and registrable_domain(host) in ("getsova.com.au",):
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
        override_display = None
        if row["Name"] in SECTOR_OVERRIDES:
            sector_slugs, override_display = SECTOR_OVERRIDES[row["Name"]]
            agnostic = False
            flags = [f for f in flags if "sector_agnostic" not in f and "not in sector_vocabulary" not in f]
            flags.append("sector inferred from description (Sova Industries was blank)")

        disp_name = row["Name"]
        if row["Name"] in NAME_OVERRIDES:
            disp_name = NAME_OVERRIDES[row["Name"]]
            flags.append(f"renamed from '{row['Name']}' — rebranded, still active")
        slug = base_slug = slugify(disp_name)
        n = 2
        while slug in taken_slugs[table]:
            slug = f"{base_slug}-{n}"
            n += 1
        taken_slugs[table].add(slug)
        if not row["Description"].strip():
            flags.append("empty description — target column is NOT NULL")

        prop = {
            "proposed_name": disp_name,
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
            prop["proposed_sector_focus"] = "; ".join(override_display or display_labels(row["Industries"]))
        elif table == "innovation_ecosystem":
            if row["Name"] in IE_TYPE_OVERRIDES:
                ie_types = IE_TYPE_OVERRIDES[row["Name"]]
                if not ie_types:
                    flags.append("gov program — empty type per Landing Pad convention")
            else:
                ie_type, tflags = ie_type_for(row["Type"])
                flags.extend(tflags)
                ie_types = [ie_type]
            if "Community" in ie_types:
                flags.append("introduces NEW innovation_ecosystem type value 'Community' (product decision)")
            prop["proposed_type"] = "; ".join(ie_types)
            prop["proposed_sectors"] = "; ".join(override_display or display_labels(row["Industries"]))
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
        elif table == "events":
            ev = FESTIVAL_EVENTS[row["Name"]]
            if ev.get("city"):
                prop["proposed_location"] = ev["city"]
            prop["proposed_type"] = ev["type"]
            prop["proposed_category"] = ev["category"]
            prop["proposed_city"] = ev.get("city", "")
            prop["proposed_state_region"] = row["State"]
            prop["proposed_typical_month"] = ev.get("typical_month", "")
            prop["proposed_frequency"] = "Annual"
            prop["proposed_status"] = "needs_review"
        elif table == "service_providers":
            text = f"{row['Name']} {row['Description']}".lower()
            if re.search(r"\bpatent|trademark|intellectual property|\bip \b|\bip strateg", text):
                services = ["IP & Legal"]
            elif re.search(r"\blegal\b|\blaw(yers?| firm)?\b|solicitor", text):
                services = ["Legal Services"]
            elif re.search(r"app develop|mobile app|software (develop|engineer|consult)|ui/ux|mvp build", text):
                services = ["Software Development"]
            elif re.search(r"account|tax|r&d|grant consult", text):
                services = ["Accounting & Tax"]
            elif re.search(r"mentor|coach", text):
                services = ["Mentoring & Advisory"]
            else:
                services = ["Advisory"]
            prop["proposed_services"] = "; ".join(services)
            prop["proposed_founded"] = ""
            prop["proposed_employees"] = ""

        if row["Name"] in REVIEW_FLAGS:
            flags.append(REVIEW_FLAGS[row["Name"]])
        # Human review is complete (REVIEW-QUEUE sign-off). The only remaining
        # open decision is approving the NEW innovation_ecosystem "Community"
        # type value — those rows stay 'review' until the reviewer confirms.
        if any("introduces NEW innovation_ecosystem type" in f for f in flags):
            action = "review"
        else:
            action = "import"
        record = {
            **{c: row.get(c, "") for c in ("Name", "Category", "Type", "State", "Amount",
                                           "Timing / Deadline", "Status", "Industries",
                                           "Founder tags", "Description", "Source URL",
                                           "Notion page URL")},
            **prop,
            "confidence": conf,
            "validation_flags": " | ".join(flags),
            "proposed_action": action,
            "source": SOURCE_TAG,
        }
        if row["Name"] in MEDIA_RINGFENCE:
            media.append(record)  # held for the separate Media build (MES-148)
        else:
            proposals[table].append(record)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    if skips:
        with (OUT_DIR / "proposed-skips.csv").open("w", newline="") as fh:
            writer = csv.DictWriter(fh, fieldnames=list(skips[0].keys()), extrasaction="ignore")
            writer.writeheader()
            writer.writerows(skips)
    if media:
        media.sort(key=lambda r: r["Name"])
        with (OUT_DIR / "ring-fenced-media.csv").open("w", newline="") as fh:
            writer = csv.DictWriter(fh, fieldnames=list(media[0].keys()), extrasaction="ignore")
            writer.writeheader()
            writer.writerows(media)
    summary = {"skips": len(skips), "ring_fenced_media": len(media)}
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
