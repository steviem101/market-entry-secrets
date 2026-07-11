#!/usr/bin/env python3
"""MES-146: Sova directory vs MES directories gap analysis (read-only).

Matches rows from data/sova-directory.csv against a local JSON snapshot of the
MES directory tables and writes three CSVs + a summary to
data/outputs/sova-gap-analysis/.

The MES snapshot is pulled via the Supabase REST API using the public anon key
(RLS-scoped, read-only — the same data any anonymous visitor can see) and is
cached OUTSIDE git because it includes mentor names. Regenerate with:

    python3 scripts/sova_gap_analysis.py --fetch --snapshot-dir /tmp/mes-snapshot

then run the analysis:

    python3 scripts/sova_gap_analysis.py --snapshot-dir /tmp/mes-snapshot

Matching rules (documented in the output SUMMARY.md):
- Primary key: root/registrable domain of Sova "Source URL" vs every MES
  website/domain/linkedin field, with AU public suffixes (com.au, org.au,
  gov.au, edu.au, state gov domains...) handled so "business.vic.gov.au" does
  not collapse to "gov.au".
- A domain is treated as SHARED (weak signal) if it is a social/aggregator
  host, or if it empirically maps to more than one distinct organisation name
  on either side (e.g. business.gov.au, launchvic.org). Shared-domain matches
  can never auto-confirm on their own.
- Secondary: normalised-name similarity (suffix-stripped, punctuation-free)
  using max(SequenceMatcher ratio, token-set Jaccard).
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import unicodedata
import urllib.request
from difflib import SequenceMatcher
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SOVA_CSV = REPO_ROOT / "data" / "sova-directory.csv"
OUT_DIR = REPO_ROOT / "data" / "outputs" / "sova-gap-analysis"

# --- Supabase snapshot ------------------------------------------------------

# Anon key is public by design (shipped in src/integrations/supabase/client.ts);
# reads are RLS-scoped to what any anonymous visitor sees.
SUPABASE_URL = "https://xhziwveaiuhzdoutpgrh.supabase.co"

SNAPSHOT_SOURCES = {
    "service_providers": "service_providers?select=id,name,website,location&limit=2000",
    "investors_public": "investors_public?select=id,slug,name,website,investor_type,location&limit=2000",
    "innovation_ecosystem": "innovation_ecosystem?select=id,name,website,domain,location,type&limit=2000",
    "trade_investment_agencies": (
        "trade_investment_agencies?select=id,name,website,website_url,domain,"
        "linkedin_url,location_state,organisation_type&limit=2000"
    ),
    "community_members_public": "community_members_public?select=id,name,title,location&limit=2000",
}

URL_FIELDS = ("website", "website_url", "domain", "linkedin_url", "application_url")


def read_anon_key() -> str:
    client_ts = (REPO_ROOT / "src/integrations/supabase/client.ts").read_text()
    m = re.search(r'"(eyJ[A-Za-z0-9._-]+)"', client_ts)
    if not m:
        sys.exit("Could not find anon key in src/integrations/supabase/client.ts")
    return m.group(1)


def fetch_snapshot(snapshot_dir: Path) -> None:
    key = read_anon_key()
    snapshot_dir.mkdir(parents=True, exist_ok=True)
    for name, query in SNAPSHOT_SOURCES.items():
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/{query}", headers={"apikey": key})
        with urllib.request.urlopen(req) as resp:
            rows = json.load(resp)
        (snapshot_dir / f"{name}.json").write_text(json.dumps(rows, indent=1))
        print(f"fetched {name}: {len(rows)} rows")


# --- Normalisation ----------------------------------------------------------

# Company-suffix tokens stripped from the END of names (repeatedly).
NAME_SUFFIX_TOKENS = {"pty", "ltd", "limited", "inc", "co", "company", "plc", "llc", "aus", "australia", "australian"}
# Multi-label public suffixes: never treat these as the registrable domain.
AU_PUBLIC_SUFFIXES = {
    "com.au", "net.au", "org.au", "edu.au", "gov.au", "asn.au", "id.au",
    # state/territory gov + edu second-levels (business.vic.gov.au -> vic.gov.au is still shared)
    "act.gov.au", "nsw.gov.au", "nt.gov.au", "qld.gov.au", "sa.gov.au",
    "tas.gov.au", "vic.gov.au", "wa.gov.au",
    "act.edu.au", "nsw.edu.au", "nt.edu.au", "qld.edu.au", "sa.edu.au",
    "tas.edu.au", "vic.edu.au", "wa.edu.au",
    "co.nz", "org.nz", "net.nz", "govt.nz", "ac.nz", "co.uk", "org.uk", "ac.uk",
}
# Hosts where the domain identifies a platform, not an organisation.
SOCIAL_AGGREGATOR_DOMAINS = {
    "linkedin.com", "facebook.com", "instagram.com", "twitter.com", "x.com",
    "youtube.com", "medium.com", "eventbrite.com", "eventbrite.com.au",
    "meetup.com", "humanitix.com", "lu.ma", "bit.ly", "linktr.ee",
    "google.com", "docs.google.com", "airtable.com", "typeform.com",
    "notion.so", "notion.site", "substack.com", "f6s.com", "wixsite.com",
}


def normalise_name(raw: str) -> str:
    s = unicodedata.normalize("NFKD", raw or "").encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9\s]", " ", s.lower())
    tokens = s.split()
    while tokens and tokens[-1] in NAME_SUFFIX_TOKENS:
        tokens.pop()
    return " ".join(tokens)


def name_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    seq = SequenceMatcher(None, a, b).ratio()
    ta, tb = set(a.split()), set(b.split())
    jaccard = len(ta & tb) / len(ta | tb) if ta | tb else 0.0
    # Token containment (dampened): "artesian" vs "artesian capital management"
    # should reach the needs-review bucket, never auto-confirm on its own.
    containment = len(ta & tb) / min(len(ta), len(tb)) if ta and tb else 0.0
    return max(seq, jaccard, 0.80 * containment)


def parse_host(url: str) -> str | None:
    url = (url or "").strip()
    if not url:
        return None
    if not re.match(r"^[a-z][a-z0-9+.-]*://", url, re.I):
        url = "https://" + url
    m = re.match(r"^[a-z][a-z0-9+.-]*://([^/?#:]+)", url, re.I)
    if not m:
        return None
    host = m.group(1).lower().strip(".")
    host = re.sub(r"^www\.", "", host)
    return host if "." in host else None


def registrable_domain(host: str) -> str:
    """Registrable domain with AU/NZ/UK multi-label public suffix handling."""
    labels = host.split(".")
    for take in (4, 3, 2):  # suffix lengths 3..1 + one label
        if len(labels) >= take:
            candidate_suffix = ".".join(labels[-(take - 1):]) if take > 1 else ""
            if candidate_suffix in AU_PUBLIC_SUFFIXES:
                return ".".join(labels[-take:])
    return ".".join(labels[-2:])


# --- Matching ---------------------------------------------------------------

CONFIDENT_NAME_SIM = 0.90     # name alone (no domain support)
DOMAIN_NAME_SUPPORT = 0.55    # name support needed alongside a unique-domain match
REVIEW_NAME_SIM = 0.72        # fuzzy floor for the needs-review bucket


def build_mes_index(snapshot_dir: Path):
    records = []
    for table in SNAPSHOT_SOURCES:
        path = snapshot_dir / f"{table}.json"
        if not path.exists():
            sys.exit(f"Missing snapshot {path} — run with --fetch first.")
        for row in json.load(path.open()):
            hosts = set()
            for field in URL_FIELDS:
                val = row.get(field)
                # innovation_ecosystem/trade_investment_agencies `domain` is a bare domain
                host = parse_host(val) if val else None
                if host:
                    hosts.add(host)
            records.append({
                "table": table,
                "id": row.get("id"),
                "name": row.get("name") or "",
                "norm_name": normalise_name(row.get("name") or ""),
                "website": row.get("website") or row.get("website_url") or "",
                "location": row.get("location") or row.get("location_state") or "",
                "hosts": hosts,
                "domains": {registrable_domain(h) for h in hosts},
            })
    return records


def shared_domain_sets(sova_rows, mes_records):
    """Domains mapping to >1 distinct org name on either side are weak signals."""
    shared = set(SOCIAL_AGGREGATOR_DOMAINS)
    for side_domains in (
        [(r["_domain"], r["_norm_name"]) for r in sova_rows if r["_domain"]],
        [(d, rec["norm_name"]) for rec in mes_records for d in rec["domains"]],
    ):
        names_per_domain: dict[str, set[str]] = {}
        for dom, name in side_domains:
            names_per_domain.setdefault(dom, set()).add(name)
        shared |= {d for d, names in names_per_domain.items() if len(names) > 1}
    return shared


def classify(sova_row, mes_records, shared_domains):
    """Return (bucket, best_match, reason, candidates)."""
    dom, host = sova_row["_domain"], sova_row["_host"]
    norm = sova_row["_norm_name"]

    candidates = []
    for rec in mes_records:
        domain_hit = bool(dom) and dom in rec["domains"]
        host_hit = bool(host) and host in rec["hosts"]
        sim = name_similarity(norm, rec["norm_name"])
        if domain_hit or host_hit or sim >= REVIEW_NAME_SIM:
            candidates.append({"rec": rec, "domain_hit": domain_hit, "host_hit": host_hit, "sim": sim})
    if not candidates:
        return "missing", None, "no domain or name candidates in any MES table", []

    candidates.sort(key=lambda c: (c["host_hit"], c["domain_hit"], c["sim"]), reverse=True)
    best = candidates[0]
    dom_is_shared = dom in shared_domains if dom else False

    if best["sim"] >= 0.999 and (best["domain_hit"] or best["host_hit"]):
        return "confident", best, "exact normalised name + domain match", candidates
    if best["host_hit"] and not dom_is_shared and best["sim"] >= DOMAIN_NAME_SUPPORT:
        return "confident", best, f"full-host match + name similarity {best['sim']:.2f}", candidates
    if best["domain_hit"] and not dom_is_shared and best["sim"] >= DOMAIN_NAME_SUPPORT:
        return "confident", best, f"unique root-domain match + name similarity {best['sim']:.2f}", candidates
    if best["sim"] >= 0.999:
        return "confident", best, "exact normalised name match (no domain overlap)", candidates

    if best["domain_hit"] or best["host_hit"]:
        why = "shared/platform domain" if dom_is_shared else f"low name similarity {best['sim']:.2f}"
        return "review", best, f"domain match but {why} — possible program-vs-parent-org", candidates
    if best["sim"] >= CONFIDENT_NAME_SIM:
        return "confident", best, f"high name similarity {best['sim']:.2f} (no domain data overlap)", candidates
    return "review", best, f"fuzzy name similarity {best['sim']:.2f} without domain corroboration", candidates


# --- Main -------------------------------------------------------------------

def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--snapshot-dir", type=Path, required=True,
                    help="Directory holding/receiving the MES table snapshots (keep out of git)")
    ap.add_argument("--fetch", action="store_true", help="(Re)download the MES snapshot first")
    args = ap.parse_args()

    if args.fetch:
        fetch_snapshot(args.snapshot_dir)

    with SOVA_CSV.open() as fh:
        reader = csv.DictReader(fh)
        sova_columns = reader.fieldnames or []
        sova_rows = list(reader)
    for row in sova_rows:
        row["_norm_name"] = normalise_name(row["Name"])
        row["_host"] = parse_host(row["Source URL"])
        row["_domain"] = registrable_domain(row["_host"]) if row["_host"] else None

    mes_records = build_mes_index(args.snapshot_dir)
    shared = shared_domain_sets(sova_rows, mes_records)

    match_columns = sova_columns + [
        "mes_table", "mes_id", "mes_name", "mes_website",
        "match_score", "match_candidate_count", "chosen_match_reason",
    ]
    buckets: dict[str, list[dict]] = {"confident": [], "review": [], "missing": []}
    for row in sova_rows:
        bucket, best, reason, candidates = classify(row, mes_records, shared)
        out = {c: row.get(c, "") for c in sova_columns}
        if bucket != "missing":
            rec = best["rec"]
            out.update({
                "mes_table": rec["table"], "mes_id": rec["id"], "mes_name": rec["name"],
                "mes_website": rec["website"], "match_score": f"{best['sim']:.3f}",
                "match_candidate_count": len(candidates), "chosen_match_reason": reason,
            })
        buckets[bucket].append(out)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    outputs = {
        "matches-confident.csv": (buckets["confident"], match_columns),
        "matches-needs-review.csv": (buckets["review"], match_columns),
        "missing-from-mes.csv": (buckets["missing"], sova_columns),  # Sova format, import-ready
    }
    for filename, (rows, columns) in outputs.items():
        with (OUT_DIR / filename).open("w", newline="") as fh:
            writer = csv.DictWriter(fh, fieldnames=columns, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(rows)

    counts = {k: len(v) for k, v in buckets.items()}
    print(json.dumps({"total": len(sova_rows), **counts,
                      "mes_records": len(mes_records), "shared_domains": len(shared)}, indent=2))


if __name__ == "__main__":
    main()
