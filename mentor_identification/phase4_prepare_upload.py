"""
Phase 4: Prepare 132 A-tier mentors for upload to community_members.

Reads:  mes_mentor_candidates.csv
Writes: upload_preview.csv  (dry run — review before any DB writes)

Field mapping documented in the ingestion plan.
"""
import csv
import json
import re
import unicodedata
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).parent

# Load the 132 A-tier mentors
df = pd.read_csv(ROOT / "mes_mentor_candidates.csv", dtype=str, keep_default_na=False)
df["total_score"] = pd.to_numeric(df["total_score"], errors="coerce")
a_tier = df[df["rating"] == "A"].copy().reset_index(drop=True)
print(f"A-tier mentors to process: {len(a_tier)}")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
HONORIFIC_RE = re.compile(r"^(dr|mr|mrs|ms|prof|sir|dame)\.?\s+", re.I)
CREDENTIAL_RE = re.compile(r"\s*[(\[][^)\]]*[)\]]\s*$")
TRAILING_CRED_RE = re.compile(r",\s*(mba|gaicd|maicd|faicd|cpa|ceng|aicd|fca|cfa|tcm|cqf)\.?$", re.I)
EMOJI_RE = re.compile(
    "[" "\U0001F600-\U0001F64F" "\U0001F300-\U0001F5FF" "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF" "\U0001F900-\U0001F9FF" "\U00002600-\U000027BF"
    "\U0001FA70-\U0001FAFF" "\U0001F700-\U0001F77F" "\U0001F780-\U0001F7FF"
    "‍" "♀-♂" "]+"
)
URL_RE = re.compile(r"https?://\S+")
WS_RE = re.compile(r"\s+")

def clean_name(name: str) -> str:
    n = HONORIFIC_RE.sub("", name.strip())
    n = TRAILING_CRED_RE.sub("", n)  # ", MBA" / ", GAICD" suffixes
    n = CREDENTIAL_RE.sub("", n)     # "(MBA)" parenthetical
    n = EMOJI_RE.sub("", n).strip()
    return WS_RE.sub(" ", n)

def clean_title(title: str) -> str:
    if not title:
        return "Mentor"
    t = title.split("|")[0].strip()  # first segment if pipe-separated
    t = EMOJI_RE.sub("", t).strip()
    t = TRAILING_CRED_RE.sub("", t)
    return WS_RE.sub(" ", t) or "Mentor"

def slugify(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    s = s.lower()
    s = re.sub(r"[‘-‟\"']", "", s)  # smart quotes / apostrophes
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "mentor"

def compose_description(headline: str, body: str, name: str, company: str) -> str:
    h = EMOJI_RE.sub("", (headline or "")).strip()
    b = EMOJI_RE.sub("", (body or "")).strip()
    b = URL_RE.sub("", b)
    b = WS_RE.sub(" ", b)
    h = WS_RE.sub(" ", h)
    if h and b:
        out = f"{h[:250]} · {b[:550]}"
    elif h:
        out = h[:800]
    elif b:
        out = b[:800]
    else:
        out = f"Senior operator at {company or 'an ANZ-based company'}."
    out = WS_RE.sub(" ", out).strip()
    if len(out) < 50:
        out = out + f" Based in ANZ, working with {name.split()[0] if name else 'mentees'}'s network across the region."
    return out[:1000]

def extract_years_experience(text: str) -> str:
    """Parse 'X years experience' from description; fall back to a generic line."""
    if not text:
        return "Senior operator with extensive ANZ market experience."
    t = text.lower()
    m = re.search(r"\b(\d{2,3})\+?\s*years?\s+(of\s+)?(experience|building|operating|leading|advising|coaching|founding|in\s+\w+)\b", t)
    if m:
        years = m.group(1)
        return f"{years}+ years operating experience in ANZ and international markets."
    m = re.search(r"\bover\s+(\d{2,3})\s+years?\b", t)
    if m:
        return f"{m.group(1)}+ years operating experience in ANZ and international markets."
    return "Senior operator with extensive ANZ market experience."

# Friendly mapping of mentor_category → user-facing specialty label
CATEGORY_LABELS = {
    "government_trade": "Trade & Government",
    "sales_gtm_leadgen": "Sales / GTM",
    "fintech_founder": "Fintech Founder",
    "financial_services": "Financial Services",
    "technology_product": "Technology / Product",
    "hr_recruitment_talent": "HR / Talent",
    "marketing_pr_comms": "Marketing / PR / Comms",
    "fundraising_investment": "Fundraising / Investment",
    "market_research_strategy": "Market Research / Strategy",
    "accounting_tax": "Accounting / Tax",
    "compliance_risk": "Compliance / Risk",
    "legal": "Legal",
    "ai_data": "AI / Data",
    "company_setup_eor": "Company Setup / EOR",
    "startup_advisor": "Startup Advisor",
    "events_community": "Events / Community",
    "market_entry_specialist": "Market Entry Specialist",
    "logistics_freight_customs": "Logistics / Freight",
    "immigration_visa_mobility": "Immigration / Visa / Mobility",
    "translation_localisation": "Translation / Localisation",
}
SECTOR_VERTICAL_LABELS = {
    "saas": "SaaS", "fintech": "Fintech", "healthtech": "Healthtech",
    "agritech": "Agritech", "cleantech": "Cleantech", "edtech": "Edtech",
    "proptech": "Proptech", "insurtech": "Insurtech", "regtech": "Regtech",
    "biotech": "Biotech", "banking": "Banking", "energy": "Energy",
    "hospitality": "Hospitality", "retail": "Retail", "construction": "Construction",
    "manufacturing": "Manufacturing", "telco": "Telco", "defence": "Defence",
    "real_estate": "Real Estate", "supply_chain": "Supply Chain",
    "life_sciences": "Life Sciences", "logistics": "Logistics",
}

# Archetype priority — first match wins
ARCHETYPE_MAP = [
    ("Trade/Gov", "Trade & Government"),
    ("Intl Founder", "International Founder"),
    ("Advisor", "Active Advisor"),
    ("C-Suite/Founder", "Scaled Founder"),
]

def derive_archetype(archetypes_str: str) -> str:
    s = (archetypes_str or "").strip()
    for tag, friendly in ARCHETYPE_MAP:
        if tag in s:
            return friendly
    return "Active Advisor"  # safe default

def derive_specialties(row) -> list[str]:
    out: list[str] = []
    cat = (row.get("mentor_category") or "").strip()
    sector = (row.get("sector_vertical") or "").strip()
    archetype = derive_archetype(row.get("archetypes") or "")

    # Always include archetype as first specialty
    out.append(archetype)

    # Category as second
    if cat == "sector_expert" and sector:
        out.append(f"Sector Expert: {SECTOR_VERTICAL_LABELS.get(sector, sector.title())}")
    elif cat in CATEGORY_LABELS:
        out.append(CATEGORY_LABELS[cat])

    # Cross-border tag if signal fired
    if int(row.get("cross_border_boost") or 0) >= 1:
        if "Cross-border" not in [x for x in out]:
            out.append("Cross-border")

    # Sector vertical as additional tag if not already added
    if sector and cat != "sector_expert":
        label = SECTOR_VERTICAL_LABELS.get(sector, sector.replace("_", " ").title())
        if label not in out:
            out.append(label)

    # Recognition signals
    if (row.get("recognition_signals") or "").strip():
        out.append("Recognised Industry Leader")

    # Dedup, preserve order
    seen, dedup = set(), []
    for s in out:
        if s and s not in seen:
            dedup.append(s); seen.add(s)
    return dedup[:6]  # cap at 6 to keep cards clean

def derive_origin_country(origin: str) -> str | None:
    o = (origin or "").strip().lower()
    if o in ("", "australia_native", "unknown"):
        return None
    return o  # ireland, uk, usa, etc.

def derive_associated_countries(origin: str) -> list[str]:
    o = derive_origin_country(origin)
    if o:
        return [o, "australia"]
    return ["australia"]

def derive_experience_tiles(row) -> list[dict]:
    tiles = []
    company = (row.get("companyName") or "").strip()
    prev = (row.get("previousCompanyName") or "").strip()
    if company:
        tiles.append({"name": company})
    if prev and prev != company:
        tiles.append({"name": prev})
    return tiles

# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------
existing_slugs = set()
# Pre-load existing slugs from Supabase (the 13 placeholders) — we'll fetch this
# during the actual upload. For preview, we just dedup within our own batch.

upload_rows = []
warnings = []

for i, row in a_tier.iterrows():
    name = clean_name(row.get("fullName", ""))
    title = clean_title(row.get("linkedinJobTitle", ""))
    company = (row.get("companyName") or "").strip()
    headline = (row.get("linkedinHeadline") or "").strip()
    desc_raw = (row.get("linkedinDescription") or "").strip()
    location = (row.get("location") or "").strip()

    description = compose_description(headline, desc_raw, name, company)
    experience = extract_years_experience(headline + " " + desc_raw)
    specialties = derive_specialties(row)
    origin_country = derive_origin_country(row.get("origin_country") or "")
    associated_countries = derive_associated_countries(row.get("origin_country") or "")
    experience_tiles = derive_experience_tiles(row)

    slug = slugify(name)
    base_slug, n = slug, 2
    while slug in existing_slugs:
        slug = f"{base_slug}-{n}"; n += 1
    existing_slugs.add(slug)

    archetype = derive_archetype(row.get("archetypes") or "")
    persona_fit_label = (row.get("persona_fit_label") or "").strip()

    is_featured = float(row.get("total_score") or 0) >= 22.5

    upload_row = {
        "name": name,
        "title": title,
        "description": description,
        "location": location,
        "experience": experience,
        "specialties": specialties,           # list, will become text[]
        "website": (row.get("linkedinProfileUrl") or "").strip() or None,
        "contact": None,                      # ✱ no email visibility
        "image": None,                        # ✱ initials fallback
        "company": company or None,
        "is_anonymous": False,
        "experience_tiles": experience_tiles, # jsonb
        "origin_country": origin_country,
        "associated_countries": associated_countries,
        "location_id": None,                  # best-effort fuzzy match optional
        "slug": slug,
        # New columns
        "archetype": archetype,
        "persona_fit": [persona_fit_label] if persona_fit_label else [],
        "is_active": True,
        "is_featured": bool(is_featured),
        # Metadata for review (NOT inserted)
        "_total_score": row.get("total_score"),
        "_source_row": row.get("fullName"),
    }

    # Validation
    issues = []
    if not name: issues.append("missing name")
    if not title: issues.append("missing title")
    if not description or len(description) < 50: issues.append(f"description too short ({len(description)})")
    if not location: issues.append("missing location")
    if not experience: issues.append("missing experience")
    if not specialties: issues.append("no specialties")
    if not slug: issues.append("missing slug")
    if issues:
        warnings.append((name, issues))

    upload_rows.append(upload_row)

print(f"Prepared {len(upload_rows)} rows")
if warnings:
    print(f"\n⚠️  {len(warnings)} row(s) with validation warnings:")
    for n, issues in warnings[:10]:
        print(f"  {n}: {', '.join(issues)}")
else:
    print("✓ All rows pass validation")

# ---------------------------------------------------------------------------
# Save preview CSV (with arrays serialised for inspection)
# ---------------------------------------------------------------------------
preview_rows = []
for r in upload_rows:
    pr = dict(r)
    pr["specialties"] = "; ".join(r["specialties"])
    pr["associated_countries"] = "; ".join(r["associated_countries"])
    pr["persona_fit"] = "; ".join(r["persona_fit"])
    pr["experience_tiles"] = json.dumps(r["experience_tiles"])
    preview_rows.append(pr)

preview_df = pd.DataFrame(preview_rows)
# Re-order columns: most-important first
col_order = [
    "_total_score", "name", "slug", "is_featured", "archetype",
    "title", "company", "location",
    "specialties", "persona_fit", "origin_country", "associated_countries",
    "description", "experience", "experience_tiles",
    "website", "contact", "image", "is_active", "is_anonymous", "location_id",
    "_source_row",
]
preview_df = preview_df[col_order]
preview_path = ROOT / "upload_preview.csv"
preview_df.to_csv(preview_path, index=False)
print(f"\nSaved preview to: {preview_path}")
print(f"  rows: {len(preview_df)}")
print(f"  columns: {list(preview_df.columns)}")

# ---------------------------------------------------------------------------
# Save the canonical upload payload as JSON for the insert script
# ---------------------------------------------------------------------------
upload_payload = []
for r in upload_rows:
    payload = {k: v for k, v in r.items() if not k.startswith("_")}
    upload_payload.append(payload)

with open(ROOT / "upload_payload.json", "w") as f:
    json.dump(upload_payload, f, indent=2, default=str)
print(f"Saved canonical payload to upload_payload.json ({len(upload_payload)} rows)")

# ---------------------------------------------------------------------------
# Summary stats
# ---------------------------------------------------------------------------
df_p = pd.DataFrame(upload_rows)
print("\n=== Featured count ===")
print(f"  {df_p['is_featured'].sum()} of {len(df_p)} mentors marked is_featured=True (score >= 22.5)")
print("\n=== Archetype distribution ===")
print(df_p["archetype"].value_counts().to_string())
print("\n=== Persona fit distribution ===")
pf_flat = [p[0] if p else "(empty)" for p in df_p["persona_fit"]]
print(pd.Series(pf_flat).value_counts().to_string())
print("\n=== Origin country distribution ===")
oc_flat = [c if c else "(none)" for c in df_p["origin_country"]]
print(pd.Series(oc_flat).value_counts().to_string())
print("\n=== Slug samples ===")
for r in upload_rows[:8]:
    print(f"  {r['name']:<30} → {r['slug']}")
print("\n=== Specialties samples ===")
for r in upload_rows[:8]:
    print(f"  {r['name']:<30} → {r['specialties']}")
print("\n=== Description samples (length & preview) ===")
for r in upload_rows[:5]:
    desc = r['description']
    print(f"  {r['name']:<25} ({len(desc)} chars): {desc[:120]}...")
