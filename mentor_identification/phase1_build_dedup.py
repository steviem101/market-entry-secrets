"""
Phase 1: Build dedup lists and MES company cross-reference.

- Loads MES companies from mes_companies.json
- Loads existing mentors from existing_mentors.json
- Loads Google Sheet picks from existing_picks.csv
- Loads LinkedIn xlsx (if present)
- Reports findings and saves intermediate artifacts
"""
import csv
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
PROJECT_ROOT = ROOT.parent

# ---- Helpers ----------------------------------------------------------------

SUFFIX_PATTERNS = [
    r"\bpty\s*ltd\b", r"\bpty\b", r"\bltd\b", r"\bllc\b", r"\binc\.?\b",
    r"\bllp\b", r"\bcorp\.?\b", r"\baustralia\b", r"\baust\b",
    r"\bnz\b", r"\bnew\s*zealand\b", r"\baotearoa\b", r"\bgmbh\b", r"\bag\b",
    r"\bbv\b", r"\bpvt\b", r"\bplc\b", r"\bco\.?\b", r"\bcompany\b",
    r"\baustralia/nz\b", r"\bapac\b",
    r"\bholdings?\b", r"\bsolutions\b", r"\band\b",
]
# Words too generic to count as a meaningful overlap token
STOP_TOKENS = {
    "the", "of", "a", "an", "in", "on", "for", "with", "to", "at", "by",
    "consulting", "consultants", "advisory", "advisors", "partners",
    "services", "solutions", "group", "global", "international",
    "australia", "australian", "new", "zealand", "and", "or", "co", "ltd",
    "pty", "inc", "llc", "llp", "plc", "corp", "company", "holdings",
    "centre", "center", "council", "association", "agency", "office",
    "department", "ministry", "commission", "industry", "business",
    "chamber", "trade", "investment", "commerce", "embassy", "consulate",
    "general", "labs", "lab", "ventures", "fund", "capital", "tech",
    "technology", "digital", "data", "innovation", "marketing", "finance",
    "financial", "health", "healthcare", "media", "communications",
    "strategies", "strategic", "studio", "academy", "network",
    # Place names — too generic to be brand identifiers on their own
    "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra",
    "auckland", "wellington", "christchurch", "queensland", "victoria",
    "nsw", "act", "wa", "sa", "nt", "tasmania", "european",
    # Generic descriptors common in agency/firm names
    "national", "regional", "federal", "state", "local", "public",
    "society", "institute", "university", "college", "school",
}
def extract_paren_aliases(name: str) -> list[str]:
    """Extract content inside parentheses as alternative aliases."""
    return [m.strip() for m in re.findall(r"\(([^)]+)\)", name) if m.strip()]


def normalize_company(name: str) -> str:
    """Lowercase, strip suffixes, collapse whitespace, strip punctuation."""
    if not name:
        return ""
    s = name.lower().strip()
    # strip parenthetical extras: "Counsel House (Counsel House Pty Ltd)"
    s = re.sub(r"\([^)]*\)", "", s)
    # strip punctuation except & for now
    s = re.sub(r"[,./\-_+:;|]", " ", s)
    # remove suffixes
    for pat in SUFFIX_PATTERNS:
        s = re.sub(pat, " ", s, flags=re.IGNORECASE)
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def significant_tokens(norm: str) -> set[str]:
    """Tokens that are not stopwords and are >= 4 chars, or are short brand acronyms."""
    out = set()
    for tok in norm.split():
        if tok in STOP_TOKENS:
            continue
        if len(tok) >= 4 or (len(tok) >= 3 and tok.isalpha()):
            out.add(tok)
    return out


def linkedin_slug_from_url(url: str) -> str:
    if not url:
        return ""
    m = re.search(r"linkedin\.com/in/([^/?#]+)", url, re.IGNORECASE)
    return m.group(1).lower().rstrip("/") if m else ""


# ---- Load MES company cross-reference --------------------------------------

with open(ROOT / "mes_companies.json") as f:
    mes = json.load(f)

# Build a lookup: normalised_name -> list of {source_table, original_name}
mes_lookup: dict[str, list[dict]] = {}

def add_to_lookup(name: str, source_table: str):
    """Index by normalised full name AND any parenthetical short form (e.g. 'AFIA')."""
    norm = normalize_company(name)
    keys = set()
    if norm and len(norm) >= 3:
        keys.add(norm)
    for alias in extract_paren_aliases(name):
        alias_norm = normalize_company(alias)
        if alias_norm and len(alias_norm) >= 3 and alias_norm not in STOP_TOKENS:
            keys.add(alias_norm)
    for k in keys:
        mes_lookup.setdefault(k, []).append({
            "source_table": source_table,
            "original_name": name,
        })

for entry in mes["service_providers"]:
    add_to_lookup(entry["name"], "service_providers")

for name in mes["trade_investment_agencies"]:
    add_to_lookup(name, "trade_investment_agencies")

for name in mes["innovation_ecosystem"]:
    add_to_lookup(name, "innovation_ecosystem")

for name in mes["content_company_profiles"]:
    add_to_lookup(name, "content_company_profiles")

for name in mes["events_organizers"]:
    if name.upper() == "TBC":
        continue
    add_to_lookup(name, "events")

for name in mes["country_trade_organizations"]:
    add_to_lookup(name, "country_trade_organizations")

# NOTE: community_members_companies are placeholder/test data in the Supabase
# table — excluded to avoid massive false positives ("Anderson Health Consulting"
# matching anyone with "consulting" in their name).

# Total unique normalised companies
unique_norms = sorted(mes_lookup.keys())

print(f"Total unique normalised MES companies: {len(unique_norms)}")
print("By source (raw counts, before dedup):")
print(f"  service_providers: {len(mes['service_providers'])}")
print(f"  trade_investment_agencies: {len(mes['trade_investment_agencies'])}")
print(f"  innovation_ecosystem: {len(mes['innovation_ecosystem'])}")
print(f"  content_company_profiles: {len(mes['content_company_profiles'])}")
print(f"  events_organizers: {len(mes['events_organizers'])}")
print(f"  country_trade_organizations: {len(mes['country_trade_organizations'])}")
print(f"  community_members_companies: {len(mes['community_members_companies'])}")


# ---- Load existing mentors --------------------------------------------------

with open(ROOT / "existing_mentors.json") as f:
    existing_mentors = json.load(f)

existing_mentor_names = {m["name"].lower().strip() for m in existing_mentors}
existing_mentor_slugs = {m["slug"].lower().strip() for m in existing_mentors}

print(f"\nExisting mentors in Supabase: {len(existing_mentors)}")


# ---- Load Google Sheet picks ------------------------------------------------

picks_path = PROJECT_ROOT / "existing_picks.csv"
picks_li_urls: set[str] = set()
picks_li_slugs: set[str] = set()
picks_companies: set[str] = set()
picks_rows = 0

if picks_path.exists():
    with open(picks_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            picks_rows += 1
            li = (row.get("Linkedin Profiles to scrape for content") or "").strip()
            if li and "linkedin.com" in li.lower():
                picks_li_urls.add(li.lower())
                slug = linkedin_slug_from_url(li)
                if slug:
                    picks_li_slugs.add(slug)
            company = (row.get("Company") or "").strip()
            if company:
                picks_companies.add(company.lower())

print(f"\nGoogle Sheet picks: {picks_rows} rows, {len(picks_li_urls)} LinkedIn URLs, {len(picks_li_slugs)} unique LI slugs, {len(picks_companies)} companies")


# ---- Save artifacts ---------------------------------------------------------

with open(ROOT / "mes_company_lookup.json", "w") as f:
    json.dump(mes_lookup, f, indent=2)

with open(ROOT / "dedup_sets.json", "w") as f:
    json.dump({
        "existing_mentor_names": sorted(existing_mentor_names),
        "existing_mentor_slugs": sorted(existing_mentor_slugs),
        "picks_li_urls": sorted(picks_li_urls),
        "picks_li_slugs": sorted(picks_li_slugs),
        "picks_companies": sorted(picks_companies),
    }, f, indent=2)


# ---- Try to load LinkedIn xlsx ---------------------------------------------

candidate_paths = [
    PROJECT_ROOT / "SM_-_LI_Network_Feb23.xlsx",
    Path("/mnt/user-data/uploads/SM_-_LI_Network_Feb23.xlsx"),
    Path("/home/user/SM_-_LI_Network_Feb23.xlsx"),
]

xlsx_path = next((p for p in candidate_paths if p.exists()), None)

print("\n" + "=" * 60)
if xlsx_path is None:
    print("LinkedIn xlsx file NOT found in any expected location:")
    for p in candidate_paths:
        print(f"  - {p}")
    print("\n*** PLEASE UPLOAD SM_-_LI_Network_Feb23.xlsx ***")
    print("Once uploaded, re-run this script to complete Phase 1.")
    sys.exit(0)

print(f"Found LinkedIn xlsx: {xlsx_path}")
import pandas as pd
df = pd.read_excel(xlsx_path)
print(f"\nTotal contacts: {len(df)}")
print(f"Columns: {len(df.columns)}")

# ANZ filter — substring for long terms, word-boundary for 2-3 letter codes to
# avoid pulling in Irish addresses ("nt" inside "County") and similar noise.
ANZ_LONG = [
    "australia", "new zealand", "sydney", "melbourne", "brisbane", "perth",
    "adelaide", "canberra", "auckland", "wellington", "hobart", "darwin",
    "gold coast", "christchurch", "geelong", "newcastle", "wollongong",
    "townsville", "cairns", "tasmania", "queensland", "victoria",
]
ANZ_SHORT = ["nsw", "act", "wa", "sa", "nt"]

def is_anz(loc):
    if not isinstance(loc, str):
        return False
    s = loc.lower()
    if any(k in s for k in ANZ_LONG):
        return True
    return any(re.search(rf"\b{k}\b", s) for k in ANZ_SHORT)

anz_mask = df["location"].apply(is_anz)
print(f"ANZ-filtered contacts: {anz_mask.sum()}")

# MES company match analysis
# Pre-compute per-MES tokens
mes_tokens = {norm: significant_tokens(norm) for norm in mes_lookup}

def find_mes_match(company: str) -> list[dict]:
    if not isinstance(company, str) or not company.strip():
        return []
    norm = normalize_company(company)
    if not norm:
        return []
    # 1. Exact normalised match (this also catches paren-alias matches like 'afia')
    if norm in mes_lookup:
        return mes_lookup[norm]

    li_tokens = significant_tokens(norm)
    li_norm_token_count = len(norm.split())
    if not li_tokens:
        return []

    seen_originals = set()
    matches = []
    for mes_norm, entries in mes_lookup.items():
        m_tokens = mes_tokens[mes_norm]
        if not m_tokens:
            continue
        m_norm_token_count = len(mes_norm.split())

        # 2. Whole-string substring match: shorter normalised name appears as a
        #    word-bounded substring in the longer one, AND has >= 2 sig tokens.
        shorter, longer = (mes_norm, norm) if len(mes_norm) <= len(norm) else (norm, mes_norm)
        if len(shorter) >= 8 and len(significant_tokens(shorter)) >= 2:
            if re.search(rf"\b{re.escape(shorter)}\b", longer):
                for e in entries:
                    if e["original_name"] not in seen_originals:
                        matches.append(e)
                        seen_originals.add(e["original_name"])
                continue

        # 3. Single-brand MES name: ENTIRE normalised MES name is a single token
        #    of >= 5 chars, NOT in stoplist. E.g. 'austrade', 'acclime'.
        #    Match if that token appears as a whole word in the LinkedIn name.
        if m_norm_token_count == 1 and len(mes_norm) >= 5 and mes_norm not in STOP_TOKENS:
            if re.search(rf"\b{re.escape(mes_norm)}\b", norm):
                for e in entries:
                    if e["original_name"] not in seen_originals:
                        matches.append(e)
                        seen_originals.add(e["original_name"])
                continue

        # 4. Token overlap: >= 2 significant tokens shared, AND the overlap is
        #    >= 60% of the smaller token set, AND both have >= 2 sig tokens.
        if len(li_tokens) >= 2 and len(m_tokens) >= 2:
            shared = li_tokens & m_tokens
            if len(shared) >= 2:
                smaller_size = min(len(li_tokens), len(m_tokens))
                if len(shared) / smaller_size >= 0.6:
                    for e in entries:
                        if e["original_name"] not in seen_originals:
                            matches.append(e)
                            seen_originals.add(e["original_name"])
                    continue
    return matches

anz_df = df[anz_mask].copy()

# Map current and previous company matches
current_matches: dict[str, list[dict]] = {}
prev_matches: dict[str, list[dict]] = {}

for idx, row in anz_df.iterrows():
    cm = find_mes_match(str(row.get("companyName", "") or ""))
    if cm:
        current_matches[idx] = cm
    pm = find_mes_match(str(row.get("previousCompanyName", "") or ""))
    if pm:
        prev_matches[idx] = pm

print(f"\nANZ contacts whose CURRENT company matches an MES entity: {len(current_matches)}")
print(f"ANZ contacts whose PREVIOUS company matches an MES entity: {len(prev_matches)}")

# Top 20 matched companies
from collections import Counter
match_counter = Counter()
match_source: dict[str, str] = {}
for idx, entries in current_matches.items():
    for e in entries:
        key = e["original_name"]
        match_counter[key] += 1
        match_source[key] = e["source_table"]

print("\nTop 20 MES company matches by # LinkedIn contacts (current employer):")
for company, count in match_counter.most_common(20):
    print(f"  {count:>4}  {company:<60} [{match_source[company]}]")

# Save full ANZ list for Phase 2
anz_df.to_csv(ROOT / "anz_contacts.csv", index=False)
print(f"\nSaved ANZ contacts to {ROOT / 'anz_contacts.csv'}")

# Dedup intersection check
def name_or_url_in_picks(row):
    name = str(row.get("fullName", "") or "").lower().strip()
    url = str(row.get("linkedinProfileUrl", "") or "").lower().strip()
    slug = linkedin_slug_from_url(url)
    if name and name in {p.lower() for p in picks_li_urls}:
        return True
    if url and url in picks_li_urls:
        return True
    if slug and slug in picks_li_slugs:
        return True
    return False

def name_in_existing_mentors(row):
    name = str(row.get("fullName", "") or "").lower().strip()
    return name in existing_mentor_names

picks_dedup = anz_df.apply(name_or_url_in_picks, axis=1).sum()
existing_dedup = anz_df.apply(name_in_existing_mentors, axis=1).sum()

print(f"\nANZ contacts already in Google Sheet picks: {picks_dedup}")
print(f"ANZ contacts already in Supabase community_members: {existing_dedup}")

# MES tag counts
def mes_tag(row):
    p1 = str(row.get("Project 1", "") or "").strip().lower()
    p2 = str(row.get("Project 2", "") or "").strip().lower()
    return p1 == "mes" or p2 == "mes"

mes_tagged_total = df.apply(mes_tag, axis=1).sum()
mes_tagged_anz = anz_df.apply(mes_tag, axis=1).sum()
print(f"\nMES-tagged contacts (any location): {mes_tagged_total}")
print(f"MES-tagged contacts (ANZ-filtered): {mes_tagged_anz}")

# Final summary JSON for Phase 2
summary = {
    "total_contacts_in_xlsx": int(len(df)),
    "total_anz_contacts": int(len(anz_df)),
    "google_sheet_picks_rows": int(picks_rows),
    "google_sheet_picks_li_urls": len(picks_li_urls),
    "existing_mentors_supabase": len(existing_mentors),
    "mes_unique_companies_normalised": len(mes_lookup),
    "mes_companies_by_source": {
        "service_providers": len(mes["service_providers"]),
        "trade_investment_agencies": len(mes["trade_investment_agencies"]),
        "innovation_ecosystem": len(mes["innovation_ecosystem"]),
        "content_company_profiles": len(mes["content_company_profiles"]),
        "events_organizers": len(mes["events_organizers"]) - 1,  # excluding TBC
        "country_trade_organizations": len(mes["country_trade_organizations"]),
        "community_members_companies_EXCLUDED": len(mes["community_members_companies"]),
    },
    "anz_with_current_mes_company_match": len(current_matches),
    "anz_with_previous_mes_company_match": len(prev_matches),
    "anz_with_either_mes_company_match": len(set(current_matches) | set(prev_matches)),
    "anz_already_in_picks": int(picks_dedup),
    "anz_already_in_supabase_mentors": int(existing_dedup),
    "mes_tagged_total": int(mes_tagged_total),
    "mes_tagged_anz": int(mes_tagged_anz),
    "top_20_mes_company_matches": [
        {"company": c, "linkedin_contacts": int(n), "source_table": match_source[c]}
        for c, n in match_counter.most_common(20)
    ],
}
with open(ROOT / "phase1_summary.json", "w") as f:
    json.dump(summary, f, indent=2)
print(f"\nSaved summary to {ROOT / 'phase1_summary.json'}")
