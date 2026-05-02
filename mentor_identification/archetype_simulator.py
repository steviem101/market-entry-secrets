"""
Reframe the candidate pool around two distinct mentor archetypes:

  1. ACTIVE ADVISOR — has demonstrable experience advising companies in key
     MES support areas (Sales/GTM, Setup/EOR/Visa, Market Entry, Accounting/Tax,
     Legal, HR/Talent, PR/Comms, Compliance, Financial, Market Research,
     Investment).

  2. EXPERIENCED FOUNDER / C-SUITE WITH DEEP SECTOR EXPERIENCE — currently or
     recently in a top role (C-suite, MD, Founder of a real company) AND has
     deep experience in a specific vertical (fintech, healthtech, SaaS, etc).

Plus auto-qualify two unambiguous categories:
  3. TRADE & GOVERNMENT — works at trade agency, consulate, or government
     trade body in a non-junior role.
  4. INTERNATIONAL FOUNDER — confirmed international origin + founder +
     scale signal.

Anyone who doesn't fit one of these four archetypes is excluded.
"""
import re
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).parent
df = pd.read_csv(ROOT / "scored_contacts.csv", dtype=str, keep_default_na=False)
df["intl_founder_score"] = pd.to_numeric(df["intl_founder_score"], errors="coerce").fillna(0)
df["seniority_score"] = pd.to_numeric(df["seniority_score"], errors="coerce").fillna(0)
df["relevance_score"] = pd.to_numeric(df["relevance_score"], errors="coerce").fillna(0)
df["industry_score"] = pd.to_numeric(df["industry_score"], errors="coerce").fillna(0)
df["network_score"] = pd.to_numeric(df["network_score"], errors="coerce").fillna(0)

# Re-derive followers count
df["linkedinFollowersCount"] = pd.to_numeric(df["linkedinFollowersCount"], errors="coerce").fillna(0)

print(f"Starting pool (currently qualified >=8): {len(df)}")

def lower(v):
    return (v if isinstance(v, str) else "").lower()

# -----------------------------------------------------------------------------
# Archetype 1: ACTIVE ADVISOR
# -----------------------------------------------------------------------------
# Signal A1: Title pattern showing they actively advise/consult
ACTIVE_ADVISOR_TITLE_PATTERNS = [
    # Fractional executives — by definition advisory work
    r"\bfractional\s+(c[a-z]o|chief|vp|director|head|cmo|cto|cfo|coo|cro|sales|marketing|product|tech)\b",
    # Advisory firm leadership
    r"\b(managing\s+partner|senior\s+partner|equity\s+partner|partner)\s+",  # Partner at firm
    r"\bprincipal\s+(consultant|advisor|adviser|partner)\b",
    r"\bpractice\s+(lead|head|partner|director)\b",
    r"\bsenior\s+(advisor|adviser|consultant|partner)\b",
    # Founder of a clearly advisory firm
    r"\b(founder|co-?founder|owner)\b.{0,40}(advisory|consultancy|consulting|partners|advisors?|advisers?|practice|consultants?)\b",
    # Independent consulting/advising titles
    r"\bindependent\s+(consultant|advisor|adviser|director)\b",
    r"\bnon-?executive\s+director\b",
    r"\b(advisory|advisor|adviser)\s+(board\s+member|board)\b",
    r"\bboard\s+(advisor|adviser|member)\b",
    r"\bmentor\b.{0,30}(in\s+residence|board|advisory)",
]
def is_active_advisor_title(row):
    t = lower(row.get("linkedinJobTitle")) + " " + lower(row.get("linkedinHeadline"))
    return any(re.search(p, t) for p in ACTIVE_ADVISOR_TITLE_PATTERNS)

# Signal A2: Description pattern showing advisory practice
ADVISORY_PRACTICE_PATTERNS = [
    r"\bi\s+help\s+(companies|startups|founders|businesses|brands|teams)\b",
    r"\bi\s+(advise|advised|coach|coached|mentor|mentored|work with)\s+(companies|startups|founders|businesses|brands|teams|leaders)\b",
    r"\bhelping\s+(companies|startups|founders|businesses|brands|leaders)\s+(scale|grow|launch|enter|expand)\b",
    r"\b(advised|coached|mentored)\s+(\d+|over|more than)\s+(companies|startups|founders|businesses)\b",
    r"\bboutique\s+(advisory|consultancy|consulting|firm)\b",
    r"\bspecialist\s+(advisory|consultancy)\b",
    r"\bconsulting\s+practice\b",
    r"\badvise\s+(c-?suite|founders|boards|executives)\b",
]
def has_advisory_practice_desc(row):
    desc = lower(row.get("linkedinDescription"))
    if len(desc) < 50:
        return False
    return any(re.search(p, desc) for p in ADVISORY_PRACTICE_PATTERNS)

# Signal A3: Works at MES service provider (current employer match)
def at_mes_service_provider(row):
    return (str(row.get("mes_company_match_type", "")) == "current" and
            str(row.get("mes_company_source", "")) in {
                "service_providers", "innovation_ecosystem"})

df["adv_via_title"] = df.apply(is_active_advisor_title, axis=1)
df["adv_via_desc"]  = df.apply(has_advisory_practice_desc, axis=1)
df["adv_via_co"]    = df.apply(at_mes_service_provider, axis=1)

# Active advisor passes if:
#   - Title says they advise/consult AND has relevance >= 2 (avoid generic advisors), OR
#   - Description says they advise companies AND has relevance >= 2, OR
#   - They work at a vetted MES service provider (the firm is the validation —
#     no extra relevance gate needed)
df["archetype_advisor"] = (
    ((df["adv_via_title"] | df["adv_via_desc"]) & (df["relevance_score"] >= 2))
    | df["adv_via_co"]
)
print(f"Archetype 1 — ACTIVE ADVISOR: {df['archetype_advisor'].sum()}")

# -----------------------------------------------------------------------------
# Archetype 2: EXPERIENCED FOUNDER / C-SUITE WITH DEEP SECTOR EXPERIENCE
# -----------------------------------------------------------------------------
SCALE_BRAND_LIST = {
    # Australian/NZ scaled brands (Tier 1) — content_company_profiles + Tech 50
    "afterpay", "airbnb", "airtasker", "aws", "amazon", "anthropic",
    "atlassian", "brighte", "buildkite", "canva", "culture amp", "databricks",
    "deputy", "docusign", "earlywork", "employment hero", "envato",
    "eucalyptus", "github", "go1", "harrison.ai", "humanitix", "immutable",
    "linktree", "morse micro", "netflix", "openai", "palantir", "rokt",
    "safetyculture", "salesforce", "servicenow", "siteminder", "slack",
    "snowflake", "stripe", "tesla", "twilio", "uipath", "vow", "xero",
    "zoom", "atlassian", "rea group", "carsales", "seek", "wisetech",
    "altium", "iress", "appen", "nearmap", "pro medicus", "computershare",
    "macquarie", "commonwealth bank", "westpac", "anz", "nab",
    "telstra", "optus", "tpg", "qantas", "woolworths", "coles",
    # Major banks/insurers (sector employers)
    "google", "microsoft", "meta", "facebook", "apple",
    "uber", "spotify", "tiktok", "linkedin", "shopify",
    "klarna", "revolut", "wise", "monzo", "starling",
    "deliveroo", "doordash", "instacart",
    "zip co", "zipco", "afterpay touch", "tyro", "judo bank",
    "openpay", "humm", "latitude financial",
}

PERSONAL_BRAND_RED_FLAGS = re.compile(
    r"\b(random|side|hobby|personal|portfolio|self|freelance|myself|stealth"
    r"|side\s*hustle|me\b)\b"
)
def has_scale_signal(row):
    """True if the candidate's company appears to be a real, scaled business.
    Permissive — designed to pass single-word brands (Lumi, MONEYME, Canva)
    while excluding personal/side projects."""
    company = lower(row.get("companyName"))
    industry = lower(row.get("companyIndustry"))
    followers = row.get("linkedinFollowersCount") or 0
    if not company:
        return False
    if followers >= 500:
        return True
    if any(brand in company for brand in SCALE_BRAND_LIST):
        return True
    # Personal-brand red flags drop out
    if PERSONAL_BRAND_RED_FLAGS.search(company):
        return False
    # Solo consultancy patterns drop out: "X Consulting", "Smith & Co",
    # "Jane Doe Consulting" (typically 1-2 word with Consulting suffix)
    if re.search(r"\b(consulting|consultancy|advisory|associates|partners)\b", company) \
       and len(company.split()) <= 2:
        return False
    # Has a real industry classification → assume scaled
    if industry and industry not in {"individual & family services", "writing and editing"}:
        return True
    return False

# C-suite or founder
def is_csuite_or_founder(row):
    title = lower(row.get("linkedinJobTitle")) + " " + lower(row.get("linkedinHeadline"))
    csuite = re.search(r"\b(ceo|cto|coo|cfo|cmo|cro|cio|cpo|chief|managing\s+director)\b", title)
    founder = re.search(r"\b(founder|co-?founder)\b", title)
    return bool(csuite or founder)

# Has deep sector signal: Tier 3 sector keyword in profile + industry alignment
TIER_3_SECTORS = [
    "fintech", "healthtech", "medtech", "health care", "healthcare",
    "life sciences", "pharmaceutical", "biotech", "agritech", "cleantech",
    "climate tech", "saas", "enterprise software", "cybersecurity",
    "cyber security", "defence", "defense", "mining", "resources",
    "infrastructure", "education", "edtech", "proptech", "insurtech",
    "regtech", "legaltech", "telecommunications", "telco", "telecom",
    "financial services", "banking", "payments", "wealth management",
    "superannuation", "energy", "renewables", "food tech", "supply chain",
    "logistics", "construction tech", "govtech",
    "artificial intelligence", "machine learning",
    # Common sector words that often appear in scaled-company industries
    "software", "internet", "consumer goods", "retail", "manufacturing",
    "real estate", "media", "automotive", "hospitality",
]
SECTOR_NAME_HINTS = [
    "tech", "fin", "health", "med", "agri", "edu", "prop", "gov",
    "bio", "cyber", "data", "cloud", "ledger", "pay", "money",
    "energy", "carbon", "climate", "logistics", "mobility", "labs",
    "insur", "wealth",
]
def has_sector_depth(row):
    """A candidate has 'deep sector signal' if any of:
       - companyIndustry contains a Tier 3 sector word
       - companyName contains a sector-suggestive token (Tech, Fin, Health, etc.)
       - >=1 Tier 3 sector keyword appears in headline/description"""
    industry = lower(row.get("companyIndustry"))
    company  = lower(row.get("companyName"))
    text     = (lower(row.get("linkedinJobTitle"))
                + " " + lower(row.get("linkedinHeadline"))
                + " " + lower(row.get("linkedinDescription")))
    if industry and any(s in industry for s in TIER_3_SECTORS):
        return True
    if company and any(re.search(rf"\b{h}\w*", company) for h in SECTOR_NAME_HINTS):
        return True
    if any(s in text for s in TIER_3_SECTORS):
        return True
    return False

df["is_csuite_or_founder"] = df.apply(is_csuite_or_founder, axis=1)
df["has_scale_signal"] = df.apply(has_scale_signal, axis=1)
df["has_sector_depth"] = df.apply(has_sector_depth, axis=1)

# Archetype 2: experienced operator at a real company, with EITHER sector depth
# OR functional relevance (Tier 1/2 keyword matches >= relevance score 2).
# Without one of those, just being a C-suite somewhere isn't enough — they
# need to bring market-entry-relevant know-how.
df["archetype_csuite_sector"] = (
    df["is_csuite_or_founder"]
    & df["has_scale_signal"]
    & (df["has_sector_depth"] | (df["relevance_score"] >= 2))
)
print(f"Archetype 2 — EXPERIENCED FOUNDER/C-SUITE w/ SECTOR DEPTH OR RELEVANCE: {df['archetype_csuite_sector'].sum()}")

# -----------------------------------------------------------------------------
# Archetype 3: TRADE & GOVERNMENT
# -----------------------------------------------------------------------------
TRADE_GOV_TITLES = [
    r"\btrade\s+commissioner\b", r"\bsenior\s+trade\b",
    r"\bconsul\s*-?\s*general\b", r"\bconsul\b.{0,20}(trade|investment|commercial)",
    r"\bcountry\s+(director|manager|head)\b",
    r"\binvestment\s+(commissioner|specialist|director|manager)\b",
    r"\bmarket\s+entry\b",
    r"\bambassador\b", r"\battache\b", r"\battaché\b",
    r"\bchief\s+representative\b",
    r"\bbusiness\s+commissioner\b",
    r"\b(commercial|economic|trade)\s+(officer|attache|attaché|counsellor|secretary)\b",
    r"\blanding\s+pad\b",
    r"\bregional\s+(director|manager|head)\s+",
]
TRADE_GOV_COMPANIES = [
    "austrade", "australian trade", "nzte", "new zealand trade and enterprise",
    "investment nsw", "global victoria", "trade and investment queensland",
    "global affairs canada", "export development canada", "uk department for",
    "department for business and trade", "embassy", "consulate",
    "consul general", "trade commissioner", "enterprise ireland",
    "enterprise singapore", "invest northern ireland", "business france",
    "business sweden", "germany trade", "kotra", "jetro",
    "hong kong trade development", "italian trade agency", "ita italian trade",
    "danish trade council", "callaghan innovation", "polish investment",
    "trade council of denmark",
]
def is_trade_gov(row):
    company = lower(row.get("companyName"))
    title_text = lower(row.get("linkedinJobTitle")) + " " + lower(row.get("linkedinHeadline"))
    # Auto-qualify if company is a trade investment agency or country trade org
    src = str(row.get("mes_company_source", ""))
    if src in {"trade_investment_agencies", "country_trade_organizations"}:
        return True
    # Generic chamber/embassy/consulate/trade body name patterns
    if re.search(
        r"\b("
        r"chamber\s+of\s+commerce"
        r"|trade\s+(council|commission|agency|office|and|&)"  # Trade and Investment, Trade & Investment
        r"|embassy"
        r"|consulate"
        r"|consul\s+general"
        r"|enterprise\s+(ireland|singapore|estonia|finland|latvia)"
        r"|invest(ment)?\s+(in\s+)?\w+"
        r"|business\s+(france|sweden|finland|denmark|norway)"
        r"|trade\s+commissioner"
        r"|landing\s+pad"
        r"|industrial\s+development"  # IDA Ireland
        r"|austrade"
        r"|ida\s+ireland"
        r"|nzte"
        r"|catalonia\s+trade"
        r"|callaghan\s+innovation"
        r"|export\s+(council|finance|development)"
        r"|trade\s+development"
        r"|business\s+council"
        r")\b",
        company):
        return True
    if any(c in company for c in TRADE_GOV_COMPANIES):
        return True
    if any(re.search(p, title_text) for p in TRADE_GOV_TITLES):
        return True
    return False

df["archetype_trade_gov"] = df.apply(is_trade_gov, axis=1)
print(f"Archetype 3 — TRADE & GOVERNMENT: {df['archetype_trade_gov'].sum()}")

# -----------------------------------------------------------------------------
# Archetype 4: INTERNATIONAL FOUNDER (confirmed origin + founder + scale)
# -----------------------------------------------------------------------------
# International founder: confirmed origin (>=3) + scale signal
df["archetype_intl_founder"] = (df["intl_founder_score"] >= 3) & df["has_scale_signal"]
print(f"Archetype 4 — INTERNATIONAL FOUNDER: {df['archetype_intl_founder'].sum()}")

# -----------------------------------------------------------------------------
# Combined: Any archetype hit
# -----------------------------------------------------------------------------
df["any_archetype"] = (
    df["archetype_advisor"]
    | df["archetype_csuite_sector"]
    | df["archetype_trade_gov"]
    | df["archetype_intl_founder"]
)
print(f"\n=== TOTAL passing AT LEAST ONE archetype: {df['any_archetype'].sum()} ===")

# Breakdown
df["archetype_count"] = (
    df["archetype_advisor"].astype(int)
    + df["archetype_csuite_sector"].astype(int)
    + df["archetype_trade_gov"].astype(int)
    + df["archetype_intl_founder"].astype(int)
)
print(f"\nMulti-archetype overlap:")
print(df[df.any_archetype]["archetype_count"].value_counts().sort_index())

# Sample by archetype
print("\n=== Sample: ACTIVE ADVISOR (top 10 by total_score) ===")
sample = df[df.archetype_advisor].sort_values("total_score", ascending=False, key=lambda c: pd.to_numeric(c)).head(10)
for _,r in sample.iterrows():
    print(f"  score={r.total_score:>5}  {r.fullName:<24} | {(r.linkedinJobTitle or '')[:42]:<42} | {(r.companyName or '')[:25]}")

print("\n=== Sample: C-SUITE / FOUNDER + SECTOR DEPTH (top 10) ===")
sample = df[df.archetype_csuite_sector].sort_values("total_score", ascending=False, key=lambda c: pd.to_numeric(c)).head(10)
for _,r in sample.iterrows():
    print(f"  score={r.total_score:>5}  {r.fullName:<24} | {(r.linkedinJobTitle or '')[:42]:<42} | {(r.companyName or '')[:25]}")

print("\n=== Sample: TRADE & GOVERNMENT (top 10) ===")
sample = df[df.archetype_trade_gov].sort_values("total_score", ascending=False, key=lambda c: pd.to_numeric(c)).head(10)
for _,r in sample.iterrows():
    print(f"  score={r.total_score:>5}  {r.fullName:<24} | {(r.linkedinJobTitle or '')[:42]:<42} | {(r.companyName or '')[:25]}")

print("\n=== Sample: INTERNATIONAL FOUNDER (top 10) ===")
sample = df[df.archetype_intl_founder].sort_values("total_score", ascending=False, key=lambda c: pd.to_numeric(c)).head(10)
for _,r in sample.iterrows():
    print(f"  score={r.total_score:>5}  {r.fullName:<24} | origin={r.origin_country:<15} | {(r.linkedinJobTitle or '')[:30]:<30} | {(r.companyName or '')[:20]}")

# What are we DROPPING under this framework?
dropped = df[~df.any_archetype]
print(f"\n=== DROPPED (no archetype): {len(dropped)} ===")
print("Sample of dropped contacts (top 15 by current score):")
for _,r in dropped.sort_values("total_score", ascending=False, key=lambda c: pd.to_numeric(c)).head(15).iterrows():
    print(f"  score={r.total_score:>5}  {r.fullName:<24} | {(r.linkedinJobTitle or '')[:45]:<45} | {(r.companyName or '')[:25]}")

print("\n=== Origin country distribution (passing archetype) ===")
qualified = df[df.any_archetype]
intl = qualified[qualified.intl_founder_score >= 3]
print(f"Intl founders (>=3): {len(intl)}")
print(intl.groupby("origin_country").size().sort_values(ascending=False))

df.to_csv(ROOT / "archetype_classification.csv", index=False)
print(f"\nSaved classification to archetype_classification.csv")
