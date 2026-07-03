"""Build ecosystem_import_candidates rows from the parsed Startmate sheet.

Phase 2 of the Startmate import pipeline
(docs/data-analysis/startmate-ecosystem-sheet-analysis.md §5). Matches parsed
sheet entities against a read-only snapshot of live MES tables, assigns a
proposed action per candidate, and emits INSERT blocks for the
`ecosystem_import_candidates` staging table. **Never connects to a database.**

Reads (both under the gitignored data/private/ path):
  data/private/startmate/parsed_startmate_ecosystem.json  (from parse_startmate_sheet.py)
  data/private/startmate/live_snapshot.json               (see SNAPSHOT_SQL below)
Optionally merges:
  data/private/startmate/verification_results.json        (web-research pass output)

Writes (with --write; dry-run prints the summary only):
  data/private/startmate/startmate_candidates.json        (full candidate rows)
  scripts/startmate_import_blocks/NN_<category>.sql        (staging INSERTs, idempotent)

Usage:
  python3 scripts/generate_startmate_candidates.py [--write] [--self-test]

Matching tiers (see analysis doc §4.5): non-institutional website domain ->
LinkedIn slug -> alias map -> normalized-name equality -> fuzzy (review-only).
Cross-table matches and institutional-domain matches become `related_review`,
never automatic duplicates.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from parse_startmate_sheet import clean, extract_domain, normalize_name  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parent.parent
PRIVATE = REPO_ROOT / "data" / "private" / "startmate"
PARSED_FILE = PRIVATE / "parsed_startmate_ecosystem.json"
SNAPSHOT_FILE = PRIVATE / "live_snapshot.json"
VERIFICATION_FILE = PRIVATE / "verification_results.json"
CANDIDATES_FILE = PRIVATE / "startmate_candidates.json"
BLOCKS_DIR = REPO_ROOT / "scripts" / "startmate_import_blocks"

BATCH_ID = "startmate-2026-07"
SOURCE_NAME = "startmate_community_sheet"
SOURCE_URL = (
    "https://docs.google.com/spreadsheets/d/1lIK2Lji83-tO5DlgMHu7KI7WeVzPqL9fFJ2hrNuVaCg"
)

# Regenerate live_snapshot.json with this read-only query (service-role/MCP):
SNAPSHOT_SQL = """
SELECT json_build_object(
 'investors', (SELECT json_agg(json_build_object('id',id,'name',name,'type',investor_type,'website',website,'linkedin',linkedin_url)) FROM investors),
 'innovation', (SELECT json_agg(json_build_object('id',id,'name',name,'website',website,'domain',domain)) FROM innovation_ecosystem),
 'providers', (SELECT json_agg(json_build_object('id',id,'name',name,'website',website)) FROM service_providers),
 'members', (SELECT json_agg(json_build_object('id',id,'name',name,'company',company)) FROM community_members),
 'agencies', (SELECT json_agg(json_build_object('id',id,'name',name,'domain',domain)) FROM trade_investment_agencies),
 'content', (SELECT json_agg(json_build_object('id',id,'title',title,'type',content_type)) FROM content_items)
) AS live;
"""

# Shared institutional domains: a domain match here is NOT a duplicate signal
# (two different university programs share one domain). §4.5 lesson 1.
INSTITUTIONAL_SUFFIXES = (".edu.au", ".edu", ".ac.nz", ".gov.au", ".govt.nz", "csiro.au")

# Known alias pairs the normalizer cannot derive. §4.5 lesson 3.
ALIAS_MAP = {
    "artesian": "artesian capital management",
    "oneventures": "1v (oneventures)",
    "nzgcp": "nz growth capital partners",
    "aspire (part of nzgcp)": "nz growth capital partners",
    "airtree": "airtree ventures",
    "blacknova": "black nova vc",
    "murud": "muru-d",
}

FUZZY_THRESHOLD = 0.87


def is_institutional(domain: str | None) -> bool:
    return bool(domain) and any(domain.endswith(sfx) for sfx in INSTITUTIONAL_SUFFIXES)


def li_slug(url: str | None) -> str | None:
    if not url:
        return None
    m = re.search(r"linkedin\.com/(?:in|company)/([^/?#]+)", url.lower())
    return m.group(1).rstrip("/") if m else None


def build_live_index(snapshot: dict) -> dict[str, list[dict]]:
    idx: dict[str, list[dict]] = {}
    for table, rows in snapshot.items():
        entries = []
        for r in rows or []:
            name = clean(r.get("name") or r.get("title"))
            if not name:
                continue
            domains = set()
            for key in ("website", "domain", "linkedin"):
                if r.get(key):
                    d = extract_domain(r[key])
                    if d and "linkedin.com" not in d:
                        domains.add(d)
            entries.append({
                "id": r["id"], "name": name, "norm": normalize_name(name),
                "lower": name.lower().strip(), "domains": domains,
                "li": li_slug(r.get("linkedin")),
            })
        idx[table] = entries
    return idx


def match_entity(idx: dict, name: str, website: str | None = None,
                 linkedin: str | None = None,
                 tables: tuple[str, ...] = ("investors", "innovation", "providers", "agencies")):
    """Return dict(table, id, name, method, score) for the best match, or None.

    Institutional-domain equality never counts as a domain match (callers may
    still surface it as related via the fuzzy/name tiers or manual review).
    """
    nm_norm = normalize_name(name)
    alias_target = ALIAS_MAP.get((name or "").lower().strip())
    dom = extract_domain(website) if website else None
    inst_dom = None
    if dom and ("linkedin.com" in dom or "facebook.com" in dom):
        dom = None
    elif dom and is_institutional(dom):
        inst_dom, dom = dom, None  # relation signal only, never a duplicate key (§4.5)
    slug = li_slug(linkedin or website or "")
    best = None
    for t in tables:
        for row in idx.get(t, []):
            if dom and dom in row["domains"]:
                return {"table": t, "id": row["id"], "name": row["name"],
                        "method": "domain", "score": 1.0}
            if inst_dom and inst_dom in row["domains"]:
                cand = {"table": t, "id": row["id"], "name": row["name"],
                        "method": "inst_domain", "score": 0.9}
                if not best or cand["score"] > best["score"]:
                    best = cand
                continue
            if slug and row["li"] and slug == row["li"]:
                return {"table": t, "id": row["id"], "name": row["name"],
                        "method": "linkedin", "score": 1.0}
            if alias_target and row["lower"] == alias_target:
                cand = {"table": t, "id": row["id"], "name": row["name"],
                        "method": "alias", "score": 0.995}
            elif nm_norm and row["norm"] and nm_norm == row["norm"]:
                cand = {"table": t, "id": row["id"], "name": row["name"],
                        "method": "norm_name", "score": 0.99}
            elif nm_norm and row["norm"] and min(len(nm_norm), len(row["norm"])) >= 5:
                s = SequenceMatcher(None, nm_norm, row["norm"]).ratio()
                if s < FUZZY_THRESHOLD:
                    continue
                cand = {"table": t, "id": row["id"], "name": row["name"],
                        "method": "fuzzy", "score": round(s, 3)}
            else:
                continue
            if not best or cand["score"] > best["score"]:
                best = cand
    return best


def action_for(match: dict | None, destination_table: str) -> tuple[str, str | None]:
    """(proposed_action, match_note). Cross-table + fuzzy => related_review (§4.5)."""
    if not match:
        return "insert_new", None
    note = f"matched {match['table']}.{match['name']} via {match['method']} ({match['score']})"
    if match["method"] == "fuzzy":
        return "related_review", note + " — fuzzy tier, verify before treating as duplicate"
    if match["method"] == "inst_domain":
        return "related_review", note + " — shared institutional domain; likely a sibling program, not a duplicate"
    if match["table"] != destination_table:
        return "related_review", note + " — related record in another table"
    return "enrich_existing", note


# ---------------------------------------------------------------------------
# Candidate builders per entity type
# ---------------------------------------------------------------------------

def build_candidates(parsed: list[dict], idx: dict) -> list[dict]:
    by_tab: dict[str, list[dict]] = defaultdict(list)
    for c in parsed:
        by_tab[c["source_tab"]].append(c)
    out: list[dict] = []

    def base(entity_type, tab, rows, name, destination, action, payload, dedupe,
             confidence, flags, match=None, note=None):
        return {
            "batch_id": BATCH_ID, "source_name": SOURCE_NAME, "source_url": SOURCE_URL,
            "source_tab": tab, "source_rows": rows,
            "raw": None,  # placeholder, replaced by caller
            "entity_type": entity_type, "name": name,
            "proposed_destination": destination, "proposed_action": action,
            "proposed_payload": payload, "dedupe_key": dedupe,
            "matched_existing_id": match["id"] if match else None,
            "matched_table": match["table"] if match else None,
            "match_method": match["method"] if match else None,
            "match_note": note, "confidence": confidence,
            "validation_flags": sorted(set(flags)),
        }

    # --- VC funds (grouped from person rows) + standalone people ---
    funds: dict[str, list[dict]] = defaultdict(list)
    fundless: list[dict] = []
    for c in by_tab.get("VCs", []):
        fund = clean(c["raw"].get("fund"))
        (funds[fund] if fund else fundless).append(c) if fund else fundless.append(c)

    for fund, people in sorted(funds.items()):
        contacts = [{
            "name": p["name"], "title": p["raw"].get("job_title"),
            "linkedin": p["raw"].get("linkedin"), "city": p["raw"].get("city"),
        } for p in people]
        geos = {p["geography"] for p in people}
        geo = ("australia" if "australia" in geos else
               "new_zealand" if "new_zealand" in geos else
               "us" if "us" in geos else next(iter(geos)))
        sectors = sorted({s.strip() for p in people
                          for s in (p["raw"].get("sector_focus") or "").split(",") if s.strip()})
        flags = []
        if len(fund) <= 3 and fund.lower() not in ("evp", "nab", "gd1", "crv", "m13", "nea", "tcv", "oif"):
            flags.append("suspect_truncated_name")
        m = match_entity(idx, fund)
        action, note = action_for(m, "investors")
        payload = {"contacts": contacts, "sector_focus_suggestions": sectors}
        if action == "insert_new":
            payload = {
                "name": fund, "investor_type": "vc",
                "location": clean(people[0]["raw"].get("city")) or
                            ("Australia" if geo == "australia" else
                             "New Zealand" if geo == "new_zealand" else
                             "United States" if geo == "us" else "International"),
                "country": people[0]["raw"].get("country"),
                "sector_focus": sectors, "contacts": contacts,
                "description": None,  # filled by verification pass / enrich-investors
            }
        conf = ("low" if flags else
                "high" if geo in ("australia", "new_zealand", "anz") else "medium")
        cand = base("investor_fund", "VCs", [p["row_index"] for p in people], fund,
                    "investors", action, payload,
                    f"investor_fund:{normalize_name(fund)}:{geo}", conf, flags, m, note)
        cand["raw"] = {"fund": fund, "people": [p["raw"] for p in people]}
        if flags:
            cand["proposed_action"] = "exclude"
            cand["match_note"] = (note or "") + " suspect truncated fund name — verify against source sheet"
        out.append(cand)

    for p in fundless:
        m = match_entity(idx, p["name"], linkedin=p["raw"].get("linkedin"),
                         tables=("investors", "members"))
        action = "enrich_existing" if m and m["table"] == "investors" else "review"
        note = (f"matched {m['table']}.{m['name']} via {m['method']} ({m['score']})"
                if m else "no fund listed — classify as angel or drop")
        cand = base("investor_person", "VCs", [p["row_index"]], p["name"],
                    "investors", action,
                    {"name": p["name"], "title": p["raw"].get("job_title"),
                     "linkedin": p["raw"].get("linkedin"), "city": p["raw"].get("city"),
                     "country": p["raw"].get("country")},
                    f"investor_person:{normalize_name(p['name'])}",
                    "low" if not m else "medium", p["validation_flags"], m, note)
        cand["raw"] = p["raw"]
        out.append(cand)

    # --- Accelerators ---
    for c in by_tab.get("Accelerators", []):
        status = (c["raw"].get("status") or "").lower()
        m = match_entity(idx, c["name"], website=c.get("website"))
        action, note = action_for(m, "innovation")
        flags = list(c["validation_flags"])
        if is_institutional(c.get("domain")):
            flags.append("institutional_domain")
        if status != "active":
            action = "exclude"
            note = (note + " — " if note else "") + f"sheet status: {c['raw'].get('status')}"
        payload = {}
        if action == "insert_new":
            payload = {
                "name": c["name"], "website": c.get("website"),
                "location": clean(c["raw"].get("city_country")) or "Australia",
                "services": ["Accelerator"] + (["Seed Funding"] if c["raw"].get("investment") else []),
                "sectors": [c["raw"].get("focus")] if c["raw"].get("focus") else [],
                "description": None,  # composed at apply time / verification pass
                "employees": "Unknown", "founded": "Unknown",
                "program": {k: c["raw"].get(k) for k in
                            ("investment", "cohort_timing", "focus", "association", "contact")},
            }
        out.append({**base("accelerator", "Accelerators", [c["row_index"]], c["name"],
                           "innovation_ecosystem", action, payload,
                           f"accelerator:{c.get('domain') if c.get('domain') and not is_institutional(c['domain']) else normalize_name(c['name'])}",
                           c["confidence"], flags, m, note), "raw": c["raw"]})

    # --- Coworking (group campuses by non-institutional domain) ---
    groups: dict[str, list[dict]] = defaultdict(list)
    for c in by_tab.get("Coworking Spaces", []):
        d = c.get("domain")
        key = d if d and not is_institutional(d) else f"name:{normalize_name(c['name'])}"
        groups[key].append(c)
    for key, rows in sorted(groups.items()):
        lead = rows[0]
        org_name = lead["name"]
        if len(rows) > 1:
            # strip campus suffixes: "Stone & Chalk - Adelaide" -> "Stone & Chalk"
            org_name = re.split(r"\s+[-–]\s+", lead["name"])[0].strip()
        campuses = [{"name": r["name"], "city": r["raw"].get("city"),
                     "suburb": r["raw"].get("suburb"), "cost": r["raw"].get("cost")}
                    for r in rows]
        m = match_entity(idx, org_name, website=lead.get("website"))
        action, note = action_for(m, "innovation")
        payload = {}
        if action == "insert_new":
            payload = {
                "name": org_name, "website": lead.get("website"),
                "location": clean(lead["raw"].get("city")) or clean(lead["raw"].get("country")) or "Australia",
                "services": ["Co-working"],
                "description": None, "employees": "Unknown", "founded": "Unknown",
                "campuses": campuses,
                "focus": lead["raw"].get("focus"),
            }
        conf = "high" if all(r["confidence"] == "high" for r in rows) else "low"
        out.append({**base("coworking_space", "Coworking Spaces",
                           [r["row_index"] for r in rows], org_name,
                           "innovation_ecosystem", action, payload,
                           f"coworking:{key}", conf,
                           [f for r in rows for f in r["validation_flags"]], m, note),
                    "raw": {"rows": [r["raw"] for r in rows]}})

    # --- Newsletters + Podcasts: source material for one curated guide ---
    for tab, etype in (("Startup Newsletters", "newsletter"), ("Podcasts", "podcast")):
        for c in by_tab.get(tab, []):
            m = match_entity(idx, c["name"], website=c.get("website"),
                             tables=("content", "innovation", "investors", "providers"))
            note = (f"publisher/related on platform: {m['table']}.{m['name']} ({m['method']})"
                    if m else None)
            out.append({**base(etype, tab, [c["row_index"]], c["name"],
                               "content_items", "content_guide",
                               {"name": c["name"], "country": c["raw"].get("country"),
                                "focus": c["raw"].get("focus"), "link": c.get("website"),
                                "contact": c["raw"].get("contact")},
                               # name-keyed: distinct publications often share a host domain
                               f"{etype}:{normalize_name(c['name'])}",
                               c["confidence"], c["validation_flags"], m, note),
                        "raw": c["raw"]})

    # Societies + workshop hosts are phase-1 exclusions: not staged at all.
    return out


def merge_verification(cands: list[dict], verification: dict) -> int:
    """Attach web-research verdicts keyed by dedupe_key. Returns merge count."""
    merged = 0
    for c in cands:
        v = verification.get(c["dedupe_key"])
        if not v:
            continue
        c["verification"] = v
        merged += 1
        status = (v.get("status") or "").lower()
        if status in ("defunct", "inactive", "not_found"):
            c["proposed_action"] = "exclude"
            c["validation_flags"] = sorted(set(c["validation_flags"] + [f"verification_{status}"]))
            c["confidence"] = "low"
        elif status == "verified" and c["confidence"] == "medium":
            c["confidence"] = "high"
        for field, value in (v.get("corrections") or {}).items():
            if isinstance(c["proposed_payload"], dict):
                c["proposed_payload"][field] = value
    return merged


# ---------------------------------------------------------------------------
# SQL emission
# ---------------------------------------------------------------------------

def sql_str(v) -> str:
    if v is None:
        return "NULL"
    return "'" + str(v).replace("'", "''") + "'"


def sql_jsonb(v) -> str:
    return sql_str(json.dumps(v, ensure_ascii=False)) + "::jsonb"


def sql_text_array(items) -> str:
    if not items:
        return "'{}'::text[]"
    return "ARRAY[" + ",".join(sql_str(i) for i in items) + "]::text[]"


def sql_int_array(items) -> str:
    if not items:
        return "'{}'::integer[]"
    return "ARRAY[" + ",".join(str(int(i)) for i in items) + "]::integer[]"


COLUMNS = ("batch_id,source_name,source_url,source_tab,source_rows,raw,entity_type,"
           "proposed_destination,proposed_action,proposed_payload,dedupe_key,"
           "matched_existing_id,matched_table,match_method,match_note,confidence,"
           "validation_flags,verification,verified_at")


def candidate_values(c: dict) -> str:
    v = c.get("verification")
    return "(" + ",".join([
        sql_str(c["batch_id"]), sql_str(c["source_name"]), sql_str(c["source_url"]),
        sql_str(c["source_tab"]), sql_int_array(c["source_rows"]), sql_jsonb(c["raw"]),
        sql_str(c["entity_type"]), sql_str(c["proposed_destination"]),
        sql_str(c["proposed_action"]), sql_jsonb(c["proposed_payload"]),
        sql_str(c["dedupe_key"]),
        (sql_str(c["matched_existing_id"]) + "::uuid") if c["matched_existing_id"] else "NULL",
        sql_str(c["matched_table"]), sql_str(c["match_method"]), sql_str(c["match_note"]),
        sql_str(c["confidence"]), sql_text_array(c["validation_flags"]),
        sql_jsonb(v or {}), "now()" if v else "NULL",
    ]) + ")"


def write_blocks(cands: list[dict]) -> list[Path]:
    BLOCKS_DIR.mkdir(exist_ok=True)
    for old in BLOCKS_DIR.glob("*.sql"):
        old.unlink()
    order = ["investor_fund", "investor_person", "accelerator", "coworking_space",
             "newsletter", "podcast"]
    paths = []
    for i, etype in enumerate(order, start=1):
        rows = [c for c in cands if c["entity_type"] == etype]
        if not rows:
            continue
        path = BLOCKS_DIR / f"{i:02d}_{etype}.sql"
        body = (f"-- Startmate import batch {BATCH_ID} — {etype} candidates ({len(rows)} rows)\n"
                f"-- Generated by scripts/generate_startmate_candidates.py. Idempotent.\n"
                f"INSERT INTO ecosystem_import_candidates\n  ({COLUMNS})\nVALUES\n"
                + ",\n".join(candidate_values(c) for c in rows)
                + "\nON CONFLICT (batch_id, dedupe_key) DO NOTHING;\n")
        path.write_text(body)
        paths.append(path)
    return paths


def summarize(cands: list[dict]) -> str:
    lines = [f"batch {BATCH_ID}: {len(cands)} candidates"]
    by = defaultdict(lambda: defaultdict(int))
    for c in cands:
        by[c["entity_type"]][c["proposed_action"]] += 1
    for etype, actions in by.items():
        lines.append(f"  {etype:16} {dict(actions)}")
    verified = sum(1 for c in cands if c.get("verification"))
    lines.append(f"  verification attached: {verified}/{len(cands)}")
    return "\n".join(lines)


def self_test() -> int:
    idx = build_live_index({
        "investors": [
            {"id": "a1", "name": "Artesian Capital Management", "website": None, "linkedin": None},
            {"id": "a2", "name": "1V (OneVentures)", "website": None, "linkedin": None},
            {"id": "a3", "name": "Blackbird Ventures", "website": "https://blackbird.vc", "linkedin": None},
        ],
        "innovation": [
            {"id": "b1", "name": "USYD Innovation Hub", "website": "https://sydney.edu.au/hub", "domain": None},
            {"id": "b2", "name": "Launch It", "website": None, "domain": None},
        ],
    })
    m1 = match_entity(idx, "Artesian")
    m2 = match_entity(idx, "OneVentures")
    m3 = match_entity(idx, "Blackbird", website="https://www.blackbird.vc/about")
    m4 = match_entity(idx, "Genesis", website="https://sydney.edu.au/genesis")  # institutional: relation only
    m5 = match_entity(idx, "LaunchAI")  # fuzzy hit -> review, never enrich
    cases = [
        (m1 and m1["method"], "alias"),
        (m2 and m2["id"], "a2"),
        (m3 and m3["method"], "domain"),
        (m4 and m4["method"], "inst_domain"),
        (action_for(m4, "innovation")[0], "related_review"),
        (m5 and m5["method"], "fuzzy"),
        (action_for(m5, "innovation")[0], "related_review"),
        (action_for(m3, "investors")[0], "enrich_existing"),
        (action_for(m3, "innovation")[0], "related_review"),
        (action_for(None, "investors")[0], "insert_new"),
        (is_institutional("founders.unsw.edu.au"), True),
        (is_institutional("startmate.com"), False),
        (sql_str("O'Brien"), "'O''Brien'"),
        (sql_text_array([]), "'{}'::text[]"),
    ]
    failures = [(i, got, want) for i, (got, want) in enumerate(cases) if got != want]
    for i, got, want in failures:
        print(f"FAIL case {i}: got {got!r}, want {want!r}", file=sys.stderr)
    print(f"self-test: {len(cases) - len(failures)}/{len(cases)} passed")
    return 1 if failures else 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true", help="write candidates JSON + SQL blocks")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        return self_test()

    for f in (PARSED_FILE, SNAPSHOT_FILE):
        if not f.exists():
            print(f"missing input: {f}\n(snapshot SQL below)\n{SNAPSHOT_SQL}", file=sys.stderr)
            return 1
    parsed = json.loads(PARSED_FILE.read_text())
    snapshot = json.loads(SNAPSHOT_FILE.read_text())
    idx = build_live_index(snapshot)
    cands = build_candidates(parsed, idx)

    if VERIFICATION_FILE.exists():
        merged = merge_verification(cands, json.loads(VERIFICATION_FILE.read_text()))
        print(f"merged verification for {merged} candidates")

    print(summarize(cands))
    if args.write:
        CANDIDATES_FILE.write_text(json.dumps(cands, indent=1, ensure_ascii=False))
        paths = write_blocks(cands)
        print(f"wrote {CANDIDATES_FILE}")
        for p in paths:
            print(f"wrote {p.relative_to(REPO_ROOT)}")
    else:
        print("(dry run — pass --write to emit candidates JSON + SQL blocks)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
