"""Parse Australian market-entry failure case studies into MES-shaped JSON.

Reads:
  data/case-studies/australian_market_failures.md         (20 source cases)
  data/case-studies/australian_market_failures_council.md (7 council additions)

Source format per case:

    ### Case N — {Company name}

    **Overview**

    Prose paragraphs.

    **Australia Entry Strategy**

    Prose paragraphs.

    **What Went Wrong in Australia**

    Optional intro paragraph(s), then:
    - **Bullet header**: bullet body
    - **Bullet header**: bullet body
    ...

    **Outcome in Australia**

    Prose paragraphs.

    **Lessons for MES**

    - **Lesson header**: lesson body.
    - **Lesson header**: lesson body.
    ...

    **Sources**

    - Label: https://url
    - Label: https://url
    ...

    ***

The parser maps source sub-headings → MES section slugs:
    Overview + Australia Entry Strategy → entry-strategy
    What Went Wrong in Australia       → success-factors  (cautionary framing — what to avoid)
    Outcome in Australia               → key-metrics      (the measurable result of the failure)
    Lessons for MES                    → lessons-learned

Slugs are normalised to <company>-australia-market-entry to match the
existing convention in the DB. Categories are routed to:
    Legal & Compliance       — Foodora, Viagogo, Pizza Hut, Valve, Binance
    Fintech Success          — Affirm, Laybuy, Sezzle, Volt Bank (label awkward, kept for filter consistency)
    Technology Market Entry  — everything else
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
INPUT_PATHS = [
    REPO_ROOT / "data" / "case-studies" / "australian_market_failures.md",
    REPO_ROOT / "data" / "case-studies" / "australian_market_failures_council.md",
]
OUTPUT_PATH = REPO_ROOT / "scripts" / "parsed_australian_failures.json"

# Curated mapping: case-number → slug, category, industry, founders, entry_year, logo domain.
CASE_META: dict[int, dict[str, Any]] = {
    1: {
        "slug": "starbucks-australia-market-entry",
        "company": "Starbucks",
        "category": "Technology Market Entry",
        "industry": "F&B / Retail",
        "origin_country": "United States",
        "entry_year": "2000",
        "founders": [
            {"name": "Howard Schultz", "title": "Former CEO", "is_primary": True},
        ],
        "logo_domain": "starbucks.com",
    },
    2: {
        "slug": "masters-australia-market-entry",
        "company": "Masters Home Improvement",
        "title_verb": "Collapsed",
        "category": "Technology Market Entry",
        "industry": "Home Improvement / Retail",
        "origin_country": "United States",
        "entry_year": "2009",
        "founders": [],
        "logo_domain": "lowes.com",
    },
    3: {
        # Existing slug — will be enriched in-place.
        "slug": "deliveroo-anz-market-entry",
        "company": "Deliveroo",
        "category": "Technology Market Entry",
        "industry": "Food Delivery / Marketplace",
        "origin_country": "United Kingdom",
        "entry_year": "2015",
        "founders": [
            {"name": "Will Shu", "title": "Co-founder & CEO", "is_primary": True},
            {"name": "Greg Orlowski", "title": "Co-founder", "is_primary": False},
        ],
        "logo_domain": "deliveroo.co.uk",
        "preserve_existing_subtitle": True,
    },
    4: {
        "slug": "menulog-australia-market-entry",
        "company": "Menulog",
        "category": "Technology Market Entry",
        "industry": "Food Delivery / Marketplace",
        "origin_country": "Netherlands (via UK)",
        "entry_year": "2015",
        "founders": [],
        "logo_domain": "menulog.com.au",
    },
    5: {
        "slug": "ola-australia-market-entry",
        "company": "Ola",
        "category": "Technology Market Entry",
        "industry": "Rideshare",
        "origin_country": "India",
        "entry_year": "2018",
        "founders": [
            {"name": "Bhavish Aggarwal", "title": "Co-founder & CEO", "is_primary": True},
            {"name": "Ankit Bhati", "title": "Co-founder", "is_primary": False},
        ],
        "logo_domain": "olacabs.com",
    },
    6: {
        "slug": "affirm-australia-market-entry",
        "company": "Affirm",
        "title_override": "How Affirm Withdrew from the Australian Market",
        "category": "Fintech Success",
        "industry": "Fintech / BNPL",
        "origin_country": "United States",
        "entry_year": "2021",
        "founders": [
            {"name": "Max Levchin", "title": "Founder & CEO", "is_primary": True},
        ],
        "logo_domain": "affirm.com",
    },
    7: {
        "slug": "laybuy-australia-market-entry",
        "company": "Laybuy",
        "category": "Fintech Success",
        "industry": "Fintech / BNPL",
        "origin_country": "New Zealand",
        "entry_year": "2017",
        "founders": [
            {"name": "Gary Rohloff", "title": "Co-founder & CEO", "is_primary": True},
        ],
        "logo_domain": "laybuy.com",
    },
    8: {
        "slug": "topshop-australia-market-entry",
        "company": "Topshop",
        "category": "Technology Market Entry",
        "industry": "Fashion Retail",
        "origin_country": "United Kingdom",
        "entry_year": "2011",
        "founders": [],
        "logo_domain": "topshop.com",
    },
    9: {
        "slug": "esprit-australia-market-entry",
        "company": "Esprit",
        "category": "Technology Market Entry",
        "industry": "Fashion Retail",
        "origin_country": "Germany / Hong Kong",
        "entry_year": "1989",
        "founders": [],
        "logo_domain": "esprit.com",
    },
    10: {
        "slug": "gap-australia-market-entry",
        "company": "Gap",
        "category": "Technology Market Entry",
        "industry": "Fashion Retail",
        "origin_country": "United States",
        "entry_year": "2014",
        "founders": [],
        "logo_domain": "gap.com",
    },
    11: {
        "slug": "carls-jr-australia-market-entry",
        "company": "Carl's Jr.",
        "category": "Technology Market Entry",
        "industry": "QSR / Food",
        "origin_country": "United States",
        "entry_year": "2016",
        "founders": [],
        "logo_domain": "carlsjr.com",
    },
    12: {
        "slug": "wework-australia-market-entry",
        "company": "WeWork",
        "title_verb": "Collapsed",
        "category": "Technology Market Entry",
        "industry": "Proptech / Coworking",
        "origin_country": "United States",
        "entry_year": "2018",
        "founders": [
            {"name": "Adam Neumann", "title": "Co-founder & former CEO", "is_primary": True},
            {"name": "Miguel McKelvey", "title": "Co-founder", "is_primary": False},
        ],
        "logo_domain": "wework.com",
    },
    13: {
        # Existing slug — will be enriched in-place.
        "slug": "amazon-australia-ecommerce-entry",
        "company": "Amazon Australia",
        "category": "Technology Market Entry",
        "industry": "E-commerce / Marketplace",
        "origin_country": "United States",
        "entry_year": "2017",
        "founders": [
            {"name": "Jeff Bezos", "title": "Founder", "is_primary": True},
        ],
        "logo_domain": "amazon.com",
        "preserve_existing_subtitle": True,
    },
    14: {
        "slug": "catch-australia-market-entry",
        "company": "Catch.com.au",
        "category": "Technology Market Entry",
        "industry": "E-commerce / Marketplace",
        "origin_country": "Australia",
        "entry_year": "2006",
        "founders": [
            {"name": "Gabby Leibovich", "title": "Co-founder", "is_primary": True},
            {"name": "Hezi Leibovich", "title": "Co-founder", "is_primary": False},
        ],
        "logo_domain": "catch.com.au",
    },
    15: {
        "slug": "groupon-australia-market-entry",
        "company": "Groupon",
        "category": "Technology Market Entry",
        "industry": "Marketplace / Deals",
        "origin_country": "United States",
        "entry_year": "2011",
        "founders": [
            {"name": "Andrew Mason", "title": "Founder & former CEO", "is_primary": True},
        ],
        "logo_domain": "groupon.com",
    },
    16: {
        "slug": "uber-carshare-australia-market-entry",
        "company": "Uber Carshare",
        "category": "Technology Market Entry",
        "industry": "Mobility / Car Sharing",
        "origin_country": "United States",
        "entry_year": "2022",
        "founders": [],
        "logo_domain": "uber.com",
    },
    17: {
        "slug": "peloton-australia-market-entry",
        "company": "Peloton",
        "category": "Technology Market Entry",
        "industry": "Consumer Tech / Fitness",
        "origin_country": "United States",
        "entry_year": "2021",
        "founders": [
            {"name": "John Foley", "title": "Co-founder & former CEO", "is_primary": True},
        ],
        "logo_domain": "onepeloton.com",
    },
    18: {
        "slug": "sezzle-australia-market-entry",
        "company": "Sezzle",
        "category": "Fintech Success",
        "industry": "Fintech / BNPL",
        "origin_country": "United States",
        "entry_year": "2019",
        "founders": [
            {"name": "Charlie Youakim", "title": "Co-founder & CEO", "is_primary": True},
        ],
        "logo_domain": "sezzle.com",
    },
    19: {
        "slug": "volt-bank-australia-market-entry",
        "company": "Volt Bank",
        "title_verb": "Collapsed",
        "category": "Fintech Success",
        "industry": "Fintech / Neobank",
        "origin_country": "Australia",
        "entry_year": "2019",
        "founders": [
            {"name": "Steve Weston", "title": "Co-founder & CEO", "is_primary": True},
            {"name": "Luke Bunbury", "title": "Co-founder", "is_primary": False},
        ],
        "logo_domain": "voltbank.com.au",
    },
    20: {
        "slug": "debenhams-australia-market-entry",
        "company": "Debenhams",
        "category": "Technology Market Entry",
        "industry": "Department Store Retail",
        "origin_country": "United Kingdom",
        "entry_year": "2017",
        "founders": [],
        "logo_domain": "debenhams.com",
    },
    # Council additions
    21: {
        "slug": "foodora-australia-market-entry",
        "company": "Foodora",
        "title_override": "How Foodora Exited the Australian Market",
        "category": "Legal & Compliance",
        "industry": "Food Delivery / Marketplace",
        "origin_country": "Germany",
        "entry_year": "2015",
        "founders": [],
        "logo_domain": "foodora.com",
    },
    22: {
        "slug": "viagogo-australia-market-entry",
        "company": "Viagogo",
        "title_override": "How Viagogo Was Penalised by the ACCC in the Australian Market",
        "category": "Legal & Compliance",
        "industry": "Marketplace / Tickets",
        "origin_country": "Switzerland",
        "entry_year": "2010",
        "founders": [
            {"name": "Eric Baker", "title": "Founder & CEO", "is_primary": True},
        ],
        "logo_domain": "viagogo.com",
    },
    23: {
        "slug": "kaufland-australia-market-entry",
        "company": "Kaufland (Schwarz Group)",
        "title_override": "How Kaufland Cancelled Its Australian Launch",
        "subtitle_override": "Germany's Schwarz Group spent A$523 million scouting sites and building infrastructure for an Australian Kaufland chain — then cancelled the launch entirely in January 2020 before opening a single store.",
        "category": "Technology Market Entry",
        "industry": "Supermarket / Retail",
        "origin_country": "Germany",
        "entry_year": "2017",
        "founders": [],
        "logo_domain": "kaufland.com",
    },
    24: {
        "slug": "pizza-hut-australia-franchise-class-action",
        "company": "Pizza Hut Australia (Yum! Restaurants)",
        "title_override": "How Pizza Hut Australia Faced a Franchisee Class Action",
        "subtitle_override": "Pizza Hut Australia is operated under franchise from Yum! Restaurants Australia Pty Ltd — the local subsidiary of US-based Yum! Restaurants International — which became the defendant in a 190-franchisee class action over a value-pricing strategy that triggered 32 franchisee insolvencies.",
        "category": "Legal & Compliance",
        "industry": "QSR / Food",
        "origin_country": "United States",
        "entry_year": "2014",
        "founders": [],
        "logo_domain": "pizzahut.com.au",
    },
    25: {
        "slug": "valve-steam-australia-market-entry",
        "company": "Valve / Steam",
        "title_override": "How Valve / Steam Was Penalised by the ACCC in Australia",
        "category": "Legal & Compliance",
        "industry": "Digital Distribution / Gaming",
        "origin_country": "United States",
        "entry_year": "2003",
        "founders": [
            {"name": "Gabe Newell", "title": "Co-founder", "is_primary": True},
        ],
        "logo_domain": "valvesoftware.com",
    },
    26: {
        "slug": "binance-australia-derivatives-market-entry",
        "company": "Binance Australia Derivatives",
        "title_override": "How Binance Australia Derivatives Lost Its AFSL",
        "category": "Legal & Compliance",
        "industry": "Fintech / Crypto Derivatives",
        "origin_country": "Cayman Islands",
        "entry_year": "2022",
        "founders": [
            {"name": "Changpeng Zhao", "title": "Founder & former CEO", "is_primary": True},
        ],
        "logo_domain": "binance.com",
    },
    27: {
        "slug": "milkrun-australia-market-entry",
        "company": "MilkRun",
        "title_verb": "Collapsed",
        "category": "Technology Market Entry",
        "industry": "Rapid Grocery Delivery",
        "origin_country": "Australia",
        "entry_year": "2021",
        "founders": [
            {"name": "Dany Milham", "title": "Co-founder & CEO", "is_primary": True},
        ],
        "logo_domain": "milkrun.com",
    },
}


# ----------------------------------------------------------------------
# Markdown helpers
# ----------------------------------------------------------------------

CASE_HEADER_RE = re.compile(r"^### Case (\d+)\s*[—–-]\s*(.+?)$", re.M)
SUB_HEADING_RE = re.compile(r"^\*\*([A-Z][^*]+?)\*\*\s*$", re.M)
HORIZONTAL_RULE_RE = re.compile(r"^\s*\*\*\*\s*$", re.M)


def split_cases(md: str) -> list[tuple[int, str, str]]:
    """Return list of (case_number, headline, body_text) tuples."""
    matches = list(CASE_HEADER_RE.finditer(md))
    out: list[tuple[int, str, str]] = []
    for i, m in enumerate(matches):
        case_n = int(m.group(1))
        headline = m.group(2).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(md)
        body = md[start:end]
        # Trim at the trailing horizontal rule that delimits cases.
        hr = HORIZONTAL_RULE_RE.search(body)
        if hr:
            body = body[: hr.start()]
        out.append((case_n, headline, body.strip()))
    return out


def split_subsections(case_body: str) -> dict[str, str]:
    """Slice a case body into {sub-heading: text-block} using **Heading** lines."""
    headings = list(SUB_HEADING_RE.finditer(case_body))
    out: dict[str, str] = {}
    for i, m in enumerate(headings):
        head = m.group(1).strip()
        start = m.end()
        end = headings[i + 1].start() if i + 1 < len(headings) else len(case_body)
        out[head] = case_body[start:end].strip()
    return out


# ----------------------------------------------------------------------
# Inline rendering
# ----------------------------------------------------------------------

BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
WS_RE = re.compile(r"\s+")


def md_inline(text: str) -> str:
    text = WS_RE.sub(" ", text).strip()
    text = BOLD_RE.sub(r"<strong>\1</strong>", text)
    text = text.replace("&", "&amp;").replace("<strong>", "{{STRONG}}").replace(
        "</strong>", "{{/STRONG}}"
    )
    # Re-decode the strong tags after escaping ampersands.
    text = text.replace("{{STRONG}}", "<strong>").replace("{{/STRONG}}", "</strong>")
    return text


def md_paragraphs(block: str) -> list[str]:
    """Split a multi-paragraph markdown block into <p> chunks and <ul> chunks.

    Handles three cases per blank-line-separated chunk:
      1. Pure prose         → single <p>
      2. Pure bullet list   → single <ul>
      3. Prose intro + bullets without a blank line → <p> followed by <ul>
    """
    out: list[str] = []
    chunks = re.split(r"\n\s*\n", block.strip())
    for chunk in chunks:
        if not chunk.strip():
            continue

        lines = chunk.splitlines()
        # Find first bullet line (leading "- ") inside this chunk.
        bullet_start = next(
            (i for i, l in enumerate(lines) if l.lstrip().startswith("- ")),
            None,
        )

        if bullet_start is None:
            # Pure prose paragraph.
            text = " ".join(l.strip() for l in lines if l.strip())
            if text:
                out.append(f"<p>{md_inline(text)}</p>")
            continue

        # Optional prose intro before the bullets.
        if bullet_start > 0:
            intro_lines = [l.strip() for l in lines[:bullet_start] if l.strip()]
            intro = " ".join(intro_lines)
            if intro:
                out.append(f"<p>{md_inline(intro)}</p>")

        bullet_block = "\n".join(lines[bullet_start:])
        ul = render_bullet_list(bullet_block)
        if ul:
            out.append(ul)
    return out


def render_bullet_list(block: str) -> str:
    """Render a sequence of `- ...` lines as a single <ul>."""
    lines = [l.rstrip() for l in block.splitlines() if l.strip()]
    items: list[str] = []
    current: list[str] = []
    for line in lines:
        if line.lstrip().startswith("- "):
            if current:
                items.append(_render_bullet_item(current))
            current = [line.lstrip()[2:].strip()]
        else:
            if current:
                current.append(line.strip())
    if current:
        items.append(_render_bullet_item(current))
    if not items:
        return ""
    return f"<ul>{''.join(items)}</ul>"


def _render_bullet_item(lines: list[str]) -> str:
    text = " ".join(lines)
    # If the bullet starts with **Header**: body, render as <strong>Header</strong> — body
    m = re.match(r"\*\*(.+?)\*\*\s*[:—-]\s*(.+)$", text)
    if m:
        head = m.group(1).strip()
        body = m.group(2).strip()
        return f"<li><strong>{md_inline(head).replace('<strong>','').replace('</strong>','')}</strong> — {md_inline(body)}</li>"
    return f"<li>{md_inline(text)}</li>"


# ----------------------------------------------------------------------
# Sources extraction
# ----------------------------------------------------------------------

SOURCE_LINE_RE = re.compile(r"^\s*-\s+(.+?):\s*(https?://\S+)\s*$", re.M)


def extract_sources(sources_block: str) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for n, m in enumerate(SOURCE_LINE_RE.finditer(sources_block), start=1):
        label = m.group(1).strip()
        url = m.group(2).strip().rstrip(".,;)")
        out.append({
            "citation_number": n,
            "label": label,
            "url": url,
            "source_type": detect_source_type(url),
        })
    return out


def detect_source_type(url: str) -> str:
    u = url.lower()
    if "linkedin.com" in u:
        return "linkedin"
    if "youtube.com" in u or "youtu.be" in u:
        return "other"
    if "reddit.com" in u:
        return "other"
    if any(d in u for d in [".gov.au", "fairwork.gov.au", "accc.gov.au", "asic.gov.au", "apra.gov.au"]):
        return "government"
    if "wikipedia.org" in u:
        return "other"
    if any(d in u for d in ["fool.com.au", "businessinsider.com", "abc.net.au", "bbc.co.uk",
                              "reuters.com", "techcrunch.com", "smartcompany.com.au",
                              "thenewdaily.com.au", "theguardian.com", "ausfoodnews.com.au",
                              "marketingmag.com.au", "qsrmedia.com.au", "retailgazette.co.uk",
                              "mediaweek.com.au", "ia.acs.org.au", "theadviser.com.au",
                              "paymentsdive.com", "finextra.com", "vixio.com", "emarketer.com",
                              "pelobuddy.com", "1news.co.nz", "chrislynchmedia.com",
                              "broadsheet.com.au", "10play.com.au", "verdictfoodservice.com",
                              "business-humanrights.org", "businessfranchiseaustralia.com.au",
                              "lexology.com", "mondaq.com", "stacklaw.com.au",
                              "msn.com", "pcgamesn.com", "variety.com", "decrypt.co",
                              "compliancecorylated.com", "theblock.co", "yahoo.com",
                              "businessnewsaustralia.com", "supermarketnews.com",
                              "thesenior.com.au", "bunburymail.com.au", "shopassociation.org.au",
                              "northweststar.com.au", "canberratimes.com.au",
                              "illawarramercury.com.au", "marketing-interactive.com",
                              "cdn.com", "techradar.com", "carexpert.com.au",
                              "thelowdown.momentum.asia", "insideretail.asia",
                              "insideretail.com.au", "insideretail.co.nz",
                              "fashionunited.com", "linkbusiness.com.au",
                              "urban.com.au", "girtby.com", "hardwareretailing.com",
                              "icmrindia.org", "globaldeal.io", "castusglobal.com",
                              "euronews.com", "sydney.edu.au", "nme.com",
                              "thetourismnews.com.au", "qlsproctor.com.au",
                              "ausleisure.com.au", "techhq.com", "ausfoodnews.com.au",
                              "afslhouse.com.au", "theccpress.com", "finance.yahoo.com",
                              "startupdaily.net", "unsw.edu.au", "aacs.org.au",
                              "business-standard.com", "cscdbs.com", "webpronews.com",
                              "fora.ie", "hellozai.com", "mst.com.au", "newhousearnold.com.au",
                              "capitalbrief.com", "theurbandeveloper.com", "allwork.space",
                              "wework.com", "forbes.com", "au.pattern.com", "aapnews.aap.com.au",
                              "theconversation.com", "wesfarmers.com.au", "thewest.com.au",
                              "pressfrom.info", "staffingindustry.com", "jonesday.com",
                              "bespokelaw.com", "gadens.com", "legalvision.com.au",
                              "conventuslaw.com", "steamcommunity.com", "ausleisure.com.au",
                              "afslhouse.com.au", "ausleisure.com.au", "deloitte.com"]):
        return "news"
    return "news"


# ----------------------------------------------------------------------
# Per-case builder
# ----------------------------------------------------------------------

def build_case(case_n: int, headline: str, body: str) -> dict[str, Any]:
    meta = CASE_META.get(case_n)
    if not meta:
        raise RuntimeError(f"No meta for case {case_n}")

    subs = split_subsections(body)

    # Entry Strategy: combine Overview + Australia Entry Strategy
    entry_html: list[str] = []
    if "Overview" in subs:
        entry_html.extend(md_paragraphs(subs["Overview"]))
    for h in ("Australia Entry Strategy", "Australia Entry Context"):
        if h in subs:
            entry_html.extend(md_paragraphs(subs[h]))

    # Success Factors (cautionary framing): What Went Wrong
    success_html: list[str] = []
    for h in ("What Went Wrong in Australia", "What went wrong in Australia"):
        if h in subs:
            success_html.extend(md_paragraphs(subs[h]))

    # Key Metrics: Outcome
    metrics_html: list[str] = []
    for h in ("Outcome in Australia", "Outcome"):
        if h in subs:
            metrics_html.extend(md_paragraphs(subs[h]))

    # Lessons Learned
    lessons_html: list[str] = []
    intro = (
        f"<p>For operators considering Australian entry, {meta['company']}'s experience "
        f"offers a sharp cautionary template. The lessons below distil what went wrong "
        f"and what foreign and domestic operators can learn from the failure mode.</p>"
    )
    lessons_html.append(intro)
    for h in ("Lessons for MES", "Lessons learned"):
        if h in subs:
            lessons_html.extend(md_paragraphs(subs[h]))

    sources = extract_sources(subs.get("Sources", ""))

    sections = [
        {"title": "Entry Strategy", "slug": "entry-strategy", "bodies": entry_html},
        {"title": "Success Factors", "slug": "success-factors", "bodies": success_html},
        {"title": "Key Metrics & Performance", "slug": "key-metrics", "bodies": metrics_html},
        {"title": "Lessons Learned", "slug": "lessons-learned", "bodies": lessons_html},
    ]
    sections = [s for s in sections if s["bodies"]]

    # tldr: first prose paragraph from Overview, plus the Outcome opening sentence.
    tldr: list[str] = []
    if entry_html:
        first = re.sub(r"<[^>]+>", " ", entry_html[0])
        first_sent = re.split(r"(?<=[.!?])\s+", first.strip())[0]
        if first_sent:
            tldr.append(first_sent.strip())
    if metrics_html:
        first = re.sub(r"<[^>]+>", " ", metrics_html[0])
        first_sent = re.split(r"(?<=[.!?])\s+", first.strip())[0]
        if first_sent and first_sent not in tldr:
            tldr.append(first_sent.strip())

    word_count = sum(len(re.sub(r"<[^>]+>", " ", b).split()) for s in sections for b in s["bodies"])
    read_time = max(2, round(word_count / 200))

    quick_facts = [
        {"icon": "MapPin", "label": "HQ", "value": meta["origin_country"]},
        {"icon": "Briefcase", "label": "Sector", "value": meta["industry"]},
        {"icon": "Globe", "label": "Target Market", "value": "Australia"},
    ]

    # Subtitle: first sentence of the Overview makes the strongest cautionary
    # headline. We strip HTML tags and pull up to the first terminal punctuation.
    subtitle = None
    if meta.get("subtitle_override"):
        subtitle = meta["subtitle_override"]
    elif not meta.get("preserve_existing_subtitle"):
        if entry_html:
            first_p = re.sub(r"<[^>]+>", " ", entry_html[0])
            first_p = re.sub(r"\s+", " ", first_p).strip()
            sent = re.split(r"(?<=[.!?])\s+", first_p)[0].strip()
            # Avoid runt subtitles; fall back to two sentences if the first is short.
            if len(sent) < 100 and len(first_p) > len(sent):
                more = re.split(r"(?<=[.!?])\s+", first_p)
                sent = (more[0] + " " + (more[1] if len(more) > 1 else "")).strip()
            subtitle = sent or headline

    title_verb = meta.get("title_verb", "Struggled")
    title = f"How {meta['company']} {title_verb} in the Australian Market"
    if meta.get("title_override"):
        title = meta["title_override"]

    return {
        "case_number": case_n,
        "slug": meta["slug"],
        "title": title,
        "subtitle": subtitle,
        "category": meta["category"],
        "company_name": meta["company"],
        "origin_country": meta["origin_country"],
        "target_market": "Australia",
        "industry": meta["industry"],
        "entry_year": meta["entry_year"],
        "founders": meta.get("founders") or [],
        "tldr": tldr,
        "quick_facts": quick_facts,
        "sections": sections,
        "sources": sources,
        "logo_domain": meta["logo_domain"],
        "read_time": read_time,
        "status": "published",
        "preserve_existing_subtitle": meta.get("preserve_existing_subtitle", False),
    }


def main() -> None:
    md = "\n\n".join(p.read_text(encoding="utf-8") for p in INPUT_PATHS)
    cases_raw = split_cases(md)
    parsed = [build_case(n, h, b) for n, h, b in cases_raw]
    OUTPUT_PATH.write_text(json.dumps(parsed, indent=2, ensure_ascii=False) + "\n")
    print(f"Parsed {len(parsed)} failure case studies → {OUTPUT_PATH}")
    for c in parsed:
        sec_summary = ", ".join(f"{s['slug']}({len(s['bodies'])})" for s in c["sections"])
        print(
            f"  {c['slug']:55s} cat={c['category']:24s} sections=[{sec_summary}] sources={len(c['sources']):2d}"
        )


if __name__ == "__main__":
    main()
