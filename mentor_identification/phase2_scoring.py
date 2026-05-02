"""
Phase 2: Score 3,084 ANZ-filtered LinkedIn contacts across 6 dimensions.

Inputs:
  mentor_identification/anz_contacts.csv      (PII; gitignored)
  mentor_identification/dedup_sets.json
  mentor_identification/mes_company_lookup.json

Outputs:
  mentor_identification/scored_contacts.csv   (PII; gitignored)
  mentor_identification/phase2_summary.json
"""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).parent

# ---------------------------------------------------------------------------
# Load inputs
# ---------------------------------------------------------------------------

dedup = json.load(open(ROOT / "dedup_sets.json"))
mes_lookup: dict[str, list[dict]] = json.load(open(ROOT / "mes_company_lookup.json"))

picks_li_urls = set(dedup["picks_li_urls"])
picks_li_slugs = set(dedup["picks_li_slugs"])
existing_mentor_names = set(dedup["existing_mentor_names"])

df = pd.read_csv(ROOT / "anz_contacts.csv", dtype=str, keep_default_na=False)
print(f"Loaded {len(df)} ANZ contacts")

# ---------------------------------------------------------------------------
# Normalisation helpers (must match phase1_build_dedup.py)
# ---------------------------------------------------------------------------

SUFFIX_PATTERNS = [
    r"\bpty\s*ltd\b", r"\bpty\b", r"\bltd\b", r"\bllc\b", r"\binc\.?\b",
    r"\bllp\b", r"\bcorp\.?\b", r"\baustralia\b", r"\baust\b",
    r"\bnz\b", r"\bnew\s*zealand\b", r"\baotearoa\b", r"\bgmbh\b", r"\bag\b",
    r"\bbv\b", r"\bpvt\b", r"\bplc\b", r"\bco\.?\b", r"\bcompany\b",
    r"\baustralia/nz\b", r"\bapac\b",
    r"\bholdings?\b", r"\bsolutions\b", r"\band\b",
]
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
    "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra",
    "auckland", "wellington", "christchurch", "queensland", "victoria",
    "nsw", "act", "wa", "sa", "nt", "tasmania", "european",
    "national", "regional", "federal", "state", "local", "public",
    "society", "institute", "university", "college", "school",
}

def normalize_company(name: str) -> str:
    if not name:
        return ""
    s = str(name).lower().strip()
    s = re.sub(r"\([^)]*\)", "", s)
    s = re.sub(r"[,./\-_+:;|]", " ", s)
    for pat in SUFFIX_PATTERNS:
        s = re.sub(pat, " ", s, flags=re.IGNORECASE)
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def significant_tokens(norm: str) -> set[str]:
    out = set()
    for tok in norm.split():
        if tok in STOP_TOKENS:
            continue
        if len(tok) >= 4 or (len(tok) >= 3 and tok.isalpha()):
            out.add(tok)
    return out

mes_tokens = {norm: significant_tokens(norm) for norm in mes_lookup}

def find_mes_match(company: str) -> list[dict]:
    if not isinstance(company, str) or not company.strip():
        return []
    norm = normalize_company(company)
    if not norm:
        return []
    if norm in mes_lookup:
        return mes_lookup[norm]
    li_tokens = significant_tokens(norm)
    if not li_tokens:
        return []
    seen = set()
    matches = []
    for mes_norm, entries in mes_lookup.items():
        m_tokens = mes_tokens[mes_norm]
        if not m_tokens:
            continue
        m_norm_token_count = len(mes_norm.split())
        shorter, longer = (mes_norm, norm) if len(mes_norm) <= len(norm) else (norm, mes_norm)
        if len(shorter) >= 8 and len(significant_tokens(shorter)) >= 2:
            if re.search(rf"\b{re.escape(shorter)}\b", longer):
                for e in entries:
                    if e["original_name"] not in seen:
                        matches.append(e); seen.add(e["original_name"])
                continue
        if m_norm_token_count == 1 and len(mes_norm) >= 5 and mes_norm not in STOP_TOKENS:
            if re.search(rf"\b{re.escape(mes_norm)}\b", norm):
                for e in entries:
                    if e["original_name"] not in seen:
                        matches.append(e); seen.add(e["original_name"])
                continue
        if len(li_tokens) >= 2 and len(m_tokens) >= 2:
            shared = li_tokens & m_tokens
            if len(shared) >= 2:
                smaller_size = min(len(li_tokens), len(m_tokens))
                if len(shared) / smaller_size >= 0.6:
                    for e in entries:
                        if e["original_name"] not in seen:
                            matches.append(e); seen.add(e["original_name"])
                    continue
    return matches

def linkedin_slug(url: str) -> str:
    if not url:
        return ""
    m = re.search(r"linkedin\.com/in/([^/?#]+)", str(url), re.IGNORECASE)
    return m.group(1).lower().rstrip("/") if m else ""

# ---------------------------------------------------------------------------
# Dimension 1: Seniority
# ---------------------------------------------------------------------------

# Order matters — match more specific titles first
SENIORITY_RULES: list[tuple[int, list[str]]] = [
    (5, [  # C-suite / Board / Managing Partner
        r"\bchief\s+executive", r"\bceo\b", r"\bcto\b", r"\bcoo\b", r"\bcfo\b",
        r"\bcmo\b", r"\bcro\b", r"\bcio\b", r"\bcpo\b", r"\bchief\s+\w+\s*officer\b",
        r"\bchief\s+\w+\b", r"\bmanaging\s+partner\b", r"\bboard\s+member\b",
        r"\bnon-?executive\s+director\b", r"\bned\b",
    ]),
    (4, [  # VP / Director / Head / Fractional
        r"\bsvp\b", r"\bevp\b", r"\bvp\b", r"\bvice\s+president\b",
        r"\bmanaging\s+director\b", r"\bdirector\b",
        r"\bhead\s+of\b", r"\bglobal\s+head\b", r"\bregional\s+head\b",
        r"\bgeneral\s+manager\b", r"\bgm\b",
        r"\bpartner\b", r"\bprincipal\b",
        r"\bfractional\b",
    ]),
    (3, [  # Senior / Practice Lead / Founder of consultancy
        r"\bsenior\s+manager\b", r"\bsenior\s+consultant\b",
        r"\bsenior\s+advisor\b", r"\bsenior\s+adviser\b",
        r"\bsenior\s+associate\b",
        r"\bpractice\s+lead\b", r"\bgroup\s+lead\b", r"\bteam\s+lead\b",
        r"\bfounder\b", r"\bco-?founder\b", r"\bowner\b", r"\bproprietor\b",
        r"\bsenior\s+strategist\b",
    ]),
    (2, [
        r"\bmanager\b", r"\bconsultant\b", r"\badvisor\b", r"\badviser\b",
        r"\blead\b", r"\bsenior\s+\w+\b",
    ]),
    (1, [
        r"\banalyst\b", r"\bassociate\b", r"\bcoordinator\b",
        r"\bspecialist\b", r"\bexecutive\b", r"\brepresentative\b",
        r"\bofficer\b",
    ]),
    (0, [r"\bintern\b", r"\bstudent\b", r"\bjunior\b", r"\bentry"]),
]

def score_seniority(title: str, headline: str) -> tuple[int, list[str]]:
    text = f"{title} {headline}".lower()
    matched: list[str] = []
    # Junior/intern overrides
    for pat in SENIORITY_RULES[-1][1]:
        if re.search(pat, text):
            matched.append(pat.strip(r"\b"))
            return 0, matched
    # Walk from highest to lowest and return first hit
    for score, patterns in SENIORITY_RULES[:-1]:
        for pat in patterns:
            if re.search(pat, text):
                matched.append(pat.strip(r"\b").replace(r"\s+", " "))
                return score, matched
    return 0, matched

# ---------------------------------------------------------------------------
# Dimension 2: Market Entry Relevance — keyword tiers
# ---------------------------------------------------------------------------

TIER_1A = [  # Market entry / international expansion
    "market entry", "international expansion", "go-to-market", "gtm",
    "export ", "exports", " trade ", "foreign direct investment", "fdi",
    "landing pad", "soft landing", "cross-border", "crossborder",
    "market access", "international business development", "global expansion",
    "market intelligence", "trade commissioner", "austrade",
    "investment nsw", "nzte", "trade and investment",
    "market entry research", "partner identification", "local representation",
    "customs services", "customs broker", "conformity assessment",
]
TIER_1B = [  # Sales / GTM / Lead Gen
    "sales leadership", "sales strategy", "sales director", "vp sales",
    "head of sales", "chief revenue officer", "cro ", "revenue growth",
    "enterprise sales", "b2b sales", "saas sales", "sales operations",
    "sales enablement", "fractional sales", "fractional cro",
    "go-to-market strategy", "gtm strategy",
    "lead generation", "lead gen", "demand generation", "demand gen",
    "pipeline generation", "outbound", "inbound", "sdr ", "bdr ",
    "business development", "channel partnerships", "channel sales",
    "partner sales", "alliances", "strategic partnerships",
    "distribution", "reseller", "referral partnerships",
    "account executive", "account management", "customer acquisition",
    "growth strategy", "commercial director", "commercial strategy",
    "commercial & pricing", "pricing strategy",
    "sales consulting", "fractional cmo", "revenue operations", "revops",
]
TIER_1C = [  # Company setup / EOR / Immigration
    "company setup", "entity setup", "company registration", "incorporation",
    "company incorporation", "business registration", "abn ", "asic ",
    "corporate structure", "holding company", "subsidiary",
    "employer of record", "eor ", "peo ", "professional employer",
    "payroll services", "workforce solutions", "employment services",
    "contractor management",
    "visa", "immigration", "work visa", "skilled worker", "sponsor",
    "migration agent",
    "relocation", "business relocation", "staff relocation",
    "family relocation", "expatriate", "expat ", "expat,",
    "international mobility", "global mobility", "mobility & visas",
    "opening a bank account", "bank account setup",
    "foreign exchange", " fx ", "forex",
    "workforce development", "staff management",
]
TIER_2A = [  # Startup / investment ecosystem
    "startup", "scale-up", "scaleup", "founder", "venture capital", " vc ",
    "angel investor", "accelerator", "incubator", "innovation hub",
    "ecosystem", "mentoring", "advisory", "fundraising",
    "capital raising", "raising capital", " seed ", "series a",
    "pitch", "investor relations", "portfolio",
]
TIER_2B = [  # Other functional expertise
    # Accounting & tax
    "accounting", " tax ", "tax advisory", "transfer pricing", " vat ",
    " gst ", "bookkeeping", " audit", "financial reporting",
    # Compliance & risk
    "compliance", "regulatory", "regulatory support", "product safety",
    "risk management", "risk consultation", "quality assurance",
    "quality control", "data protection", "information assurance",
    "privacy", "gdpr",
    # Legal
    " legal ", "employment law", " ip ", "intellectual property",
    "trademark", "patent", "corporate law", "commercial law",
    "contract law",
    # Marketing PR comms
    " pr ", "public relations", "public affairs", "communications",
    "media relations", "brand strategy", "advertising", "branding",
    "content marketing", "digital marketing", "growth marketing",
    "social media marketing", "social media strategy",
    # People & talent
    "recruiter", "recruitment", "talent acquisition", "executive search",
    "hiring", "staffing", " hr ", "human resources",
    "employment & talent",
    # Events & community
    "event management", "conference", "summit", "community building",
    "networking", "meetup", "event production",
    # Tech & product
    " cto ", "product leadership", "product strategy",
    " ai ", "artificial intelligence", "machine learning", "data science",
    "cloud", "platform", "architecture", "engineering leader",
    "tech lead", "product management", "website development",
    "web development", "digital platform",
    # Logistics
    "freight forwarding", "freight forwarders", "cross-border logistics",
    "warehousing", "supply chain management", "specialist broker",
    "sanitary and phytosanitary",
    # Translation
    "translation", "interpretation", "localisation", "localization",
    "multilingual",
    # Strategy & planning
    "strategy consulting", "strategic planning", "long-term planning",
    "market research", "business planning", "planning consultant",
    # Insurance & FS
    "insurance", "insurance broker", "risk insurance", "financial advisory",
]
TIER_3 = [  # Sector specialist
    "fintech", "healthtech", "medtech", "health care", "healthcare",
    "life sciences", "pharmaceutical", "biotech", "agritech", "cleantech",
    "climate tech", " saas ", "enterprise software", "cybersecurity",
    "cyber security", "defence", "defense", "mining", "resources",
    "infrastructure", "education", "edtech", "proptech", "insurtech",
    "regtech", "legaltech", "telecommunications", "telco", "telecom",
    "financial services", "banking", "payments", "wealth management",
    "superannuation", "energy", "renewables", "food tech", "supply chain",
    "logistics", "construction tech", "govtech",
]

def find_keywords(text: str, keywords: list[str]) -> list[str]:
    """Return the list of keywords matched in text (case-insensitive). Use simple substring."""
    if not text:
        return []
    t = " " + str(text).lower() + " "
    hits = []
    for kw in keywords:
        if kw.lower() in t:
            hits.append(kw.strip())
    return hits

def score_relevance(text: str) -> tuple[int, dict[str, list[str]]]:
    matches = {
        "1A": find_keywords(text, TIER_1A),
        "1B": find_keywords(text, TIER_1B),
        "1C": find_keywords(text, TIER_1C),
        "2A": find_keywords(text, TIER_2A),
        "2B": find_keywords(text, TIER_2B),
        "3":  find_keywords(text, TIER_3),
    }
    n_t1 = len(matches["1A"]) + len(matches["1B"]) + len(matches["1C"])
    n_t2 = len(matches["2A"]) + len(matches["2B"])
    n_t3 = len(matches["3"])

    if n_t1 >= 3:
        return 5, matches
    if n_t1 >= 2 or (n_t1 >= 1 and n_t2 >= 3):
        return 4, matches
    if n_t1 == 1 or n_t2 >= 4 or len(matches["2B"]) >= 3:
        return 3, matches
    if 2 <= n_t2 <= 3 or (n_t2 >= 1 and n_t3 >= 2) or n_t3 >= 3:
        return 2, matches
    if n_t2 == 1 or 1 <= n_t3 <= 2:
        return 1, matches
    return 0, matches

# ---------------------------------------------------------------------------
# Dimension 3: Industry Fit
# ---------------------------------------------------------------------------

def score_industry(industry: str, company: str, headline: str) -> int:
    s = f"{industry} {company} {headline}".lower()
    if not s.strip():
        return 0
    # Tier 5
    if any(k in s for k in [
        "international trade", "trade & development", "trade and development",
        "government administration", "government relations",
        "government — trade", "government - trade",
    ]):
        return 5
    if "management consulting" in s and any(k in s for k in [
        "international", "market entry", "global", "cross-border",
    ]):
        return 5
    # Tier 4
    if any(k in s for k in [
        "venture capital", "private equity", "law practice", "legal services",
        "accounting", "professional services",
        "staffing and recruiting", "staffing & recruiting",
        "executive search",
        "public relations", "communications",
        "logistics and supply chain", "logistics & supply chain",
        "import and export", "import & export", "freight",
        "immigration", "tax services",
    ]):
        return 4
    if "management consulting" in s:
        return 4  # baseline, lower than Tier 5
    # Tier 3
    if any(k in s for k in [
        "financial services", "banking", "investment banking", "insurance",
        "computer software", "information technology and services",
        "it services", "telecommunications", "hospital & health care",
        "healthcare", "hospital and health care",
        "biotechnology", "pharmaceuticals", "defense", "defence",
    ]):
        return 3
    # Tier 2
    if any(k in s for k in [
        "marketing and advertising", "marketing & advertising",
        "advertising services", "higher education", "real estate",
        "construction", "events services", "events", "hospitality",
        "human resources", "professional training", "translation",
        "localisation", "localization",
    ]):
        return 2
    return 1 if industry.strip() else 0

# ---------------------------------------------------------------------------
# Dimension 4: Network & Ecosystem Signal (additive, capped at 7)
# ---------------------------------------------------------------------------

def score_network(row, current_match: bool, previous_match: bool) -> tuple[float, dict]:
    s = 0.0
    breakdown = {}
    p1 = (row.get("Project 1") or "").strip().lower()
    p2 = (row.get("Project 2") or "").strip().lower()
    if p1 == "mes" or p2 == "mes":
        s += 3; breakdown["mes_tag"] = 3
    elif p1 or p2:
        s += 1; breakdown["other_project_tag"] = 1
    if current_match:
        s += 2; breakdown["mes_company_current"] = 2
    elif previous_match:
        s += 1; breakdown["mes_company_previous"] = 1
    desc = row.get("linkedinDescription") or ""
    if len(str(desc)) >= 100:
        s += 0.5; breakdown["rich_description"] = 0.5
    if (row.get("linkedinSkillsLabel") or "").strip():
        s += 0.5; breakdown["skills"] = 0.5
    try:
        if int(row.get("linkedinFollowersCount") or 0) >= 500:
            s += 0.5; breakdown["followers_500plus"] = 0.5
    except (ValueError, TypeError):
        pass
    if (row.get("professionalEmail1") or "").strip() or (row.get("personalEmail1") or "").strip():
        s += 0.5; breakdown["contactable"] = 0.5
    return min(s, 7.0), breakdown

# ---------------------------------------------------------------------------
# Dimension 5: Persona Fit (also produces persona_fit_label and mentor_category)
# ---------------------------------------------------------------------------

def score_persona(text: str, industry: str, relevance_matches: dict) -> tuple[float, str, str]:
    t = text.lower()
    n_t1a = len(relevance_matches["1A"])
    n_t1b = len(relevance_matches["1B"])
    n_t1c = len(relevance_matches["1C"])
    n_t2a = len(relevance_matches["2A"])
    n_t2b = len(relevance_matches["2B"])
    n_t3  = len(relevance_matches["3"])

    # Decide label
    intl_signals = (n_t1a >= 1) or any(
        k in t for k in [
            "trade commissioner", "austrade", "nzte", "embassy", "consulate",
            "investment nsw", "global affairs canada", "enterprise ireland",
            "mfat", "dfat", "expatriate", "expat", "global mobility",
            "international tax", "international legal", "cross-border",
        ]
    ) or n_t1c >= 2
    sector_specialist = (n_t3 >= 2 and n_t2a + n_t2b == 0)
    local_startup = (n_t2a >= 2 and n_t1a == 0 and n_t1b == 0 and not intl_signals)
    functional_expert = (n_t1b >= 1 or n_t1c >= 1 or n_t2b >= 2)

    if intl_signals and (n_t1b + n_t1c >= 1 or "international" in t):
        return 2.0, "international_entrant", _category(relevance_matches, t)
    if intl_signals:
        return 2.0, "international_entrant", _category(relevance_matches, t)
    if functional_expert and (n_t2a >= 1 or "founder" in t):
        return 1.5, "both", _category(relevance_matches, t)
    if functional_expert:
        return 1.5, "functional_expert", _category(relevance_matches, t)
    if sector_specialist:
        return 1.0, "sector_specialist", _category(relevance_matches, t)
    if local_startup:
        return 1.0, "local_startup", _category(relevance_matches, t)
    if n_t2a + n_t2b + n_t3 >= 1:
        return 0.5, "tangential", _category(relevance_matches, t)
    return 0.0, "no_fit", "unknown"


def _category(rm: dict, text: str) -> str:
    """Map to a primary mentor_category based on the strongest keyword tier."""
    if rm["1B"]:
        return "sales_gtm_leadgen"
    if rm["1C"]:
        if any(k in text for k in ["visa", "immigration", "migration", "mobility", "relocation", "expat"]):
            return "immigration_visa_mobility"
        return "company_setup_eor"
    if rm["1A"]:
        if any(k in text for k in ["austrade", "nzte", "trade commissioner", "embassy", "consulate", "investment nsw", "enterprise ireland"]):
            return "government_trade"
        return "market_entry_specialist"
    # 2A startup ecosystem
    if any(k in text for k in ["venture capital", "vc ", "angel investor", "fundraising", "capital raising"]):
        return "fundraising_investment"
    # 2B fine-grained
    if any(k in text for k in ["accounting", "tax", "audit", "bookkeeping"]):
        return "accounting_tax"
    if any(k in text for k in ["compliance", "regulatory", "risk management", "quality assurance", "privacy", "gdpr"]):
        return "compliance_risk"
    if any(k in text for k in ["insurance", "broker", "foreign exchange", "fx", "financial advisory"]):
        return "financial_services_fx_insurance"
    if any(k in text for k in ["legal", "law", "intellectual property", "trademark", "patent"]):
        return "legal"
    if any(k in text for k in ["recruit", "talent acquisition", "staffing", "human resources", "executive search"]):
        return "hr_recruitment_talent"
    if any(k in text for k in ["pr ", "public relations", "public affairs", "communications", "advertising", "brand strategy", "content marketing", "digital marketing", "social media"]):
        return "marketing_pr_comms"
    if any(k in text for k in ["event management", "conference", "summit", "community building"]):
        return "events_community"
    if any(k in text for k in ["cto", "product leadership", "product strategy", "engineering leader", "platform", "architecture", "tech lead"]):
        return "technology_product"
    if any(k in text for k in ["ai", "artificial intelligence", "machine learning", "data science"]):
        return "ai_data"
    if any(k in text for k in ["freight", "warehousing", "supply chain", "customs", "logistics"]):
        return "logistics_freight_customs"
    if any(k in text for k in ["translation", "interpretation", "localisation", "localization"]):
        return "translation_localisation"
    if any(k in text for k in ["market research", "strategy consulting", "strategic planning", "business planning"]):
        return "market_research_strategy"
    # Sector specialist
    if rm["3"]:
        return f"sector_expert_{rm['3'][0].strip().replace(' ', '_')}"
    if any(k in text for k in ["startup", "founder", "scale-up"]):
        return "startup_advisor"
    return "general"

# ---------------------------------------------------------------------------
# Dimension 6: International Founder in ANZ
# ---------------------------------------------------------------------------

# School name keywords -> origin country
SCHOOL_TO_COUNTRY: dict[str, list[str]] = {
    "ireland": [
        "trinity college dublin", "university college dublin",
        "dublin city university", "dublin institute of technology",
        "university of limerick", "university of galway",
        "national university of ireland", "nui galway", "nui maynooth",
        "university college cork", "technological university dublin",
        "queen's university belfast", "ulster university",
        "waterford institute of technology", "maynooth university",
        "griffith college dublin", "rcsi", "royal college of surgeons in ireland",
        "cork institute of technology", "letterkenny institute of technology",
        "dublin business school", "smurfit business school",
        "athlone institute of technology",
    ],
    "uk": [
        "oxford", "cambridge", "imperial college", " ucl ",
        "university college london", "london school of economics", " lse ",
        "king's college london", "kings college london",
        "university of edinburgh", "university of manchester",
        "university of warwick", "university of bristol",
        "university of leeds", "university of sheffield",
        "university of birmingham", "university of nottingham",
        "university of glasgow", "cardiff university", "cranfield",
        "durham university", "university of bath", "queen mary",
        "royal holloway", "soas", "lancaster university", "newcastle upon tyne",
        "university of york", "university of exeter", "city university london",
        "london business school", "birkbeck",
    ],
    "usa": [
        " mit ", "massachusetts institute of technology",
        "stanford", "harvard", "yale", "princeton", "columbia university",
        "berkeley", " ucla ", "university of california",
        " nyu ", "new york university",
        "university of michigan", "georgia tech", "carnegie mellon",
        "duke university", "cornell", "brown university",
        "northwestern", "university of pennsylvania", "university of chicago",
        "ut austin", "university of texas at austin",
        "boston university", "boston college",
    ],
    "france": [
        " hec ", "hec paris", "insead", "sciences po", "sorbonne",
        "essec", "escp", "polytechnique", "ecole normale", "ecole des mines",
        "ecole centrale", "ecole superieure", "ecole nationale",
        "université paris", "universite paris", "edhec",
    ],
    "germany": [
        "tu munich", "tu munchen", "technische universität",
        "ludwig maximilian", " lmu ", "university of heidelberg",
        "rwth aachen", "humboldt university", "free university berlin",
    ],
    "india": [
        " iit ", "indian institute of technology", " iim ",
        "indian institute of management", "delhi university",
        "university of mumbai", "indian school of business",
        "iisc bangalore", "indian institute of science", "bits pilani",
        "anna university", "manipal",
    ],
    "canada": [
        "university of toronto", "mcgill", " ubc ",
        "university of british columbia", "university of waterloo",
        "western university", "university of western ontario",
        "queen's university canada", "university of alberta",
        "york university", "concordia university", "simon fraser",
    ],
    "south_africa": [
        " uct ", "university of cape town", "wits university",
        "university of the witwatersrand", "stellenbosch", "rhodes university",
        "university of pretoria", "gibs", "kwa-zulu",
    ],
    "netherlands": [
        "tu delft", "university of amsterdam", "erasmus university",
        "leiden university", "utrecht university", "wageningen",
        "tilburg", "groningen", "rsm",
    ],
    "singapore": [
        " nus ", "national university of singapore", " ntu ",
        "nanyang technological university", "singapore management university",
        " smu ",
    ],
    "china": [
        "tsinghua", "peking university", "fudan", "shanghai jiao tong",
        "zhejiang university", "ceibs", "renmin university",
    ],
    "japan": [
        "university of tokyo", "kyoto university", "waseda", "keio",
        "tokyo institute of technology", "hitotsubashi", "osaka university",
    ],
    "korea": [
        "seoul national", "yonsei", "korea university", " kaist ",
        " postech ",
    ],
    "hong_kong": [
        "university of hong kong", " hku ", "chinese university of hong kong",
        " cuhk ", "hkust", "hong kong university of science",
    ],
    "other_eu": [
        "bocconi", "università di", "universita di",
        "ie business school", "iese", "esade",
        "lund university", "stockholm school of economics",
        "copenhagen business school", "kth royal institute",
        "ku leuven", "université catholique de louvain",
        "vienna university", "wirtschaftsuniversität",
        "warsaw school of economics",
    ],
    "other_asia": [
        "asia pacific university", "thammasat", "chulalongkorn",
        "universitas indonesia", "university of malaya", "ateneo",
        "de la salle", "iban islamic", "american university of beirut",
        " auc ",
    ],
}

LOCATION_TO_COUNTRY: dict[str, list[str]] = {
    "ireland":      ["dublin", "cork", "galway", "limerick", "waterford", "kilkenny", "ireland"],
    "uk":           ["london", "manchester", "edinburgh", "birmingham", "bristol", "leeds", "glasgow", "cambridge", "oxford", "united kingdom", "england", "scotland", "wales", "belfast", "northern ireland"],
    "usa":          ["new york", "san francisco", "boston", "chicago", "seattle", "austin", "los angeles", "washington", "united states", "u.s.", "u.s.a"],
    "france":       ["paris", "lyon", "marseille", "toulouse", "france"],
    "germany":      ["berlin", "munich", "frankfurt", "hamburg", "germany"],
    "india":        ["mumbai", "bangalore", "bengaluru", "delhi", "chennai", "hyderabad", "india"],
    "canada":       ["toronto", "montreal", "vancouver", "ottawa", "calgary", "canada"],
    "south_africa": ["johannesburg", "cape town", "pretoria", "durban", "south africa"],
    "netherlands":  ["amsterdam", "rotterdam", "the hague", "utrecht", "netherlands", "holland"],
    "singapore":    ["singapore"],
    "china":        ["beijing", "shanghai", "shenzhen", "guangzhou", "china"],
    "japan":        ["tokyo", "osaka", "kyoto", "japan"],
    "korea":        ["seoul", "busan", "korea"],
    "hong_kong":    ["hong kong"],
}

FOUNDER_PATTERNS = [
    r"\bfounder\b", r"\bco-?founder\b", r"\bcofounder\b",
    r"\bfounding\s+(team|partner|member)\b", r"\bfounder\s*&\s*ceo\b",
    r"\bceo\s*&\s*founder\b", r"\bceo\s*/\s*founder\b",
]

def is_founder(title: str, headline: str) -> bool:
    text = f"{title} {headline}".lower()
    return any(re.search(p, text) for p in FOUNDER_PATTERNS)

def detect_origin(row) -> tuple[str, list[str]]:
    """Return (origin_country, signals_list). origin_country is one of the
    SCHOOL_TO_COUNTRY keys, 'australia_native', or 'unknown'."""
    signals: list[str] = []
    school1 = (row.get("linkedinSchoolName") or "").lower()
    school2 = (row.get("linkedinPreviousSchoolName") or "").lower()
    prev_loc = (row.get("linkedinPreviousJobLocation") or "").lower()
    prev_co_url = (row.get("linkedinPreviousCompanyUrl") or "").lower()

    country_scores: Counter = Counter()

    for country, schools in SCHOOL_TO_COUNTRY.items():
        for s in schools:
            for src_label, src_text in [("School", school1), ("PrevSchool", school2)]:
                if src_text and s.strip() in src_text:
                    country_scores[country] += 2
                    signals.append(f"{src_label}: {s.strip()}")
                    break  # one match per source per country is enough

    for country, locs in LOCATION_TO_COUNTRY.items():
        for loc in locs:
            if prev_loc and re.search(rf"\b{re.escape(loc)}\b", prev_loc):
                country_scores[country] += 1
                signals.append(f"PrevJobLoc: {loc}")
                break

    # Australian university signals
    aus_unis = [
        "university of sydney", "university of melbourne", "monash",
        "university of new south wales", "unsw", "university of queensland",
        "uq", "university of western australia", "uwa", "university of adelaide",
        "rmit", "macquarie university", "australian national university",
        "anu", "university of technology sydney", "uts",
        "queensland university of technology", "qut", "griffith university",
        "deakin university", "la trobe", "swinburne", "curtin",
        "victoria university", "central queensland",
    ]
    aus_signal = any(u in school1 or u in school2 for u in aus_unis)

    if not country_scores:
        return ("australia_native" if aus_signal else "unknown"), signals

    # Pick country with highest score
    country, _ = country_scores.most_common(1)[0]
    return country, signals

def score_intl_founder(row) -> tuple[int, bool, str, list[str]]:
    """Return (score, is_founder_bool, origin_country, signals)."""
    title = row.get("linkedinJobTitle") or ""
    headline = row.get("linkedinHeadline") or ""
    founder = is_founder(title, headline)

    origin, signals = detect_origin(row)
    intl_origin = origin not in ("australia_native", "unknown")
    n_strong = len([s for s in signals if s.startswith("School:") or s.startswith("PrevSchool:")])
    n_loc    = len([s for s in signals if s.startswith("PrevJobLoc:")])
    n_signals = n_strong + n_loc

    # Followers as scale proxy
    try:
        followers = int(row.get("linkedinFollowersCount") or 0)
    except (ValueError, TypeError):
        followers = 0
    has_scale_signal = followers >= 1000

    if founder and intl_origin and n_signals >= 2 and has_scale_signal:
        return 5, True, origin, signals
    if founder and intl_origin and n_signals >= 2:
        return 4, True, origin, signals
    if founder and intl_origin and n_signals == 1 and n_strong >= 1:
        return 3, True, origin, signals
    if founder and origin == "unknown":
        # Founder but origin can't be confirmed
        return 2, True, origin, signals
    if not founder and intl_origin and n_signals >= 1:
        title_l = (title + " " + headline).lower()
        seniority_hit = any(p in title_l for p in [
            "ceo", "chief", "cto", "coo", "cfo", "cmo", "vp",
            "vice president", "managing director", "head of", "director",
        ])
        if seniority_hit:
            return 1, False, origin, signals
    return 0, founder, origin, signals

# ---------------------------------------------------------------------------
# Composite scoring
# ---------------------------------------------------------------------------

def score_contact(row) -> dict:
    title = row.get("linkedinJobTitle") or ""
    headline = row.get("linkedinHeadline") or ""
    description = row.get("linkedinDescription") or ""
    skills = row.get("linkedinSkillsLabel") or ""
    industry = row.get("companyIndustry") or ""
    job_desc = row.get("linkedinJobDescription") or ""
    company = row.get("companyName") or ""
    fulltext = " ".join([title, headline, description, skills, industry, job_desc])

    seniority, sen_hits = score_seniority(title, headline)
    relevance, rel_matches = score_relevance(fulltext)
    industry_score = score_industry(industry, company, headline)

    # MES company match (current/previous)
    cur_match = find_mes_match(company)
    prev_match = find_mes_match(row.get("previousCompanyName") or "")
    network, net_breakdown = score_network(row, bool(cur_match), bool(prev_match))
    persona, persona_label, mentor_cat = score_persona(fulltext, industry, rel_matches)
    intl_score, founder_bool, origin, origin_signals = score_intl_founder(row)

    total = seniority + relevance + industry_score + network + persona + intl_score

    if total >= 19:
        rating = "A"
    elif total >= 13:
        rating = "B"
    elif total >= 8:
        rating = "C"
    else:
        rating = "EXCLUDE"

    # Reasoning (only for >= 8)
    reasoning = ""
    if total >= 8:
        bits = []
        if intl_score >= 3 and founder_bool:
            bits.append(f"{origin.replace('_',' ').title()}-origin Founder at {company}.")
        elif founder_bool:
            bits.append(f"Founder at {company}.")
        else:
            bits.append(f"{title} at {company}." if title else f"Currently at {company}.")
        triggered = []
        if rel_matches["1A"]: triggered.append(f"market entry ({', '.join(rel_matches['1A'][:3])})")
        if rel_matches["1B"]: triggered.append(f"sales/GTM ({', '.join(rel_matches['1B'][:3])})")
        if rel_matches["1C"]: triggered.append(f"setup/EOR/visa ({', '.join(rel_matches['1C'][:3])})")
        if rel_matches["2A"]: triggered.append(f"startup/investment ({', '.join(rel_matches['2A'][:2])})")
        if rel_matches["2B"]: triggered.append(f"functional ({', '.join(rel_matches['2B'][:2])})")
        if rel_matches["3"]:  triggered.append(f"sector ({', '.join(rel_matches['3'][:2])})")
        if cur_match:
            bits.append(f"Currently at MES platform company '{cur_match[0]['original_name']}' ({cur_match[0]['source_table']}).")
        elif prev_match:
            bits.append(f"Previously at MES platform company '{prev_match[0]['original_name']}'.")
        if (str(row.get("Project 1") or "").lower() == "mes") or (str(row.get("Project 2") or "").lower() == "mes"):
            bits.append("Pre-tagged 'mes' in network.")
        if triggered:
            bits.append("Relevant because: " + "; ".join(triggered) + ".")
        reasoning = " ".join(bits).strip()

    keyword_matches = []
    for tier, kws in rel_matches.items():
        for k in kws:
            keyword_matches.append(f"{tier}:{k.strip()}")

    name = (row.get("fullName") or "").strip()
    li_url = (row.get("linkedinProfileUrl") or "").strip()
    slug = linkedin_slug(li_url)

    in_picks = (li_url.lower() in picks_li_urls) or (slug and slug in picks_li_slugs)
    in_supabase = name.lower() in existing_mentor_names

    return {
        "fullName": name,
        "rating": rating,
        "total_score": round(total, 2),
        "reasoning": reasoning,
        "seniority_score": seniority,
        "relevance_score": relevance,
        "industry_score": industry_score,
        "network_score": round(network, 2),
        "persona_fit_score": persona,
        "intl_founder_score": intl_score,
        "is_founder": founder_bool,
        "origin_country": origin,
        "origin_signals": "; ".join(origin_signals),
        "persona_fit_label": persona_label,
        "mentor_category": mentor_cat,
        "linkedinJobTitle": title,
        "companyName": company,
        "companyIndustry": industry,
        "location": row.get("location") or "",
        "linkedinHeadline": headline,
        "linkedinProfileUrl": li_url,
        "professionalEmail1": row.get("professionalEmail1") or "",
        "personalEmail1": row.get("personalEmail1") or "",
        "linkedinDescription": (description or "")[:500],
        "linkedinSkillsLabel": (skills or "")[:300],
        "keyword_matches": ", ".join(keyword_matches),
        "already_in_google_sheet": in_picks,
        "already_in_supabase": in_supabase,
        "is_mes_tagged": (str(row.get("Project 1") or "").lower() == "mes") or
                         (str(row.get("Project 2") or "").lower() == "mes"),
        "mes_company_match": bool(cur_match) or bool(prev_match),
        "mes_company_name": (cur_match[0]["original_name"] if cur_match
                             else (prev_match[0]["original_name"] if prev_match else "")),
        "mes_company_source": (cur_match[0]["source_table"] if cur_match
                               else (prev_match[0]["source_table"] if prev_match else "")),
        "mes_company_match_type": ("current" if cur_match else ("previous" if prev_match else "")),
        "linkedinFollowersCount": row.get("linkedinFollowersCount") or "",
        "previousCompanyName": row.get("previousCompanyName") or "",
        "linkedinSchoolName": row.get("linkedinSchoolName") or "",
        "linkedinPreviousSchoolName": row.get("linkedinPreviousSchoolName") or "",
    }

# ---------------------------------------------------------------------------
# Run scoring
# ---------------------------------------------------------------------------

print("Scoring contacts...")
records = []
for i, row in df.iterrows():
    r = score_contact(row)
    # Apply exclusion AFTER scoring (so we still know who they were)
    # Per spec: exclude picks + supabase. Keep MES-tagged.
    if r["already_in_google_sheet"] or r["already_in_supabase"]:
        continue
    records.append(r)

scored = pd.DataFrame(records)
print(f"\nScored (post-dedup): {len(scored)} contacts")
print(f"Scoring distribution by rating:")
print(scored["rating"].value_counts())

# Filter to >=8
qualified = scored[scored["rating"].isin(["A", "B", "C"])].copy()
qualified = qualified.sort_values(
    by=["total_score", "rating"],
    ascending=[False, True],
).reset_index(drop=True)
print(f"\nQualified (>= 8 points): {len(qualified)}")
print(qualified["rating"].value_counts())

qualified.to_csv(ROOT / "scored_contacts.csv", index=False)
print(f"Saved {len(qualified)} qualified contacts to scored_contacts.csv")

# ---------------------------------------------------------------------------
# Phase 2 summary
# ---------------------------------------------------------------------------

intl_founders = qualified[qualified["intl_founder_score"] >= 3].copy()
intl_founders_by_origin = intl_founders.groupby("origin_country").size().sort_values(ascending=False)
mes_company_matched = qualified[qualified["mes_company_match"]].copy()
mes_tagged = qualified[qualified["is_mes_tagged"]].copy()

summary = {
    "total_scored_post_dedup": int(len(scored)),
    "qualified_count": int(len(qualified)),
    "tier_A_count": int((qualified["rating"] == "A").sum()),
    "tier_B_count": int((qualified["rating"] == "B").sum()),
    "tier_C_count": int((qualified["rating"] == "C").sum()),
    "excluded_below_8": int((scored["rating"] == "EXCLUDE").sum()),

    "intl_founders_score_3plus_count": int(len(intl_founders)),
    "intl_founders_by_origin": intl_founders_by_origin.to_dict(),

    "mes_company_matched_count": int(len(mes_company_matched)),
    "mes_tagged_count": int(len(mes_tagged)),

    "mentor_category_distribution": qualified["mentor_category"].value_counts().head(20).to_dict(),
    "persona_fit_label_distribution": qualified["persona_fit_label"].value_counts().to_dict(),
    "top_industries": qualified["companyIndustry"].value_counts().head(15).to_dict(),
    "top_companies": qualified["companyName"].value_counts().head(15).to_dict(),
    "location_distribution": qualified["location"].value_counts().head(15).to_dict(),

    "top_20_by_score": qualified.head(20)[
        ["fullName", "rating", "total_score", "linkedinJobTitle", "companyName",
         "origin_country", "mentor_category", "is_mes_tagged", "mes_company_match",
         "reasoning"]
    ].to_dict(orient="records"),
}

with open(ROOT / "phase2_summary.json", "w") as f:
    json.dump(summary, f, indent=2, default=str)

print(f"\nSaved Phase 2 summary to phase2_summary.json")
print("\n=== Top 10 by total_score ===")
for r in summary["top_20_by_score"][:10]:
    print(f"  {r['rating']} {r['total_score']:5.1f}  {r['fullName']:<30} | {r['linkedinJobTitle']:<40} | {r['companyName']}")
