"""Parse data/case-studies/irish_tier1_anz_research.html into MES-shaped JSON.

Source format: a Perplexity-produced HTML page with 6 case studies wrapped in
<section class="case-study">. Each case has a fixed structure:

  - <span class="case-num">  → "Case Study NN · Sector"
  - <span class="slug-code">  → "slug: foo-bar"  (kept as legacy_slug)
  - <h2>                      → title
  - <p class="tagline">       → subtitle
  - <div class="meta-strip">  → Founded / Founders / dates / etc.
  - <div class="section-title">{Heading}</div> + sibling content blocks
  - <div class="callout">     → editorial lesson (boxed quote)
  - <span class="tag">        → mes_tags
  - <div class="src-item">    → numbered citation list

Slug normalisation: the source uses ad-hoc slugs (clanwilliam-anz, etc.) but
the MES platform standard is `<company>-anz-market-entry` (matches the
existing 25 published case studies). We normalise on import; the original
source slug is preserved in `legacy_slug` for traceability.

Output keyed shape mirrors `parsed_uk_enriched.json` so the existing import
pipeline patterns can be reused.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup, NavigableString, Tag

REPO_ROOT = Path(__file__).resolve().parent.parent
INPUT_PATH = REPO_ROOT / "data" / "case-studies" / "irish_tier1_anz_research.html"
OUTPUT_PATH = REPO_ROOT / "scripts" / "parsed_irish_tier1.json"

# Source slug → MES standard slug
SLUG_NORMALISATION = {
    "clanwilliam-anz": "clanwilliam-anz-market-entry",
    "spectrumlife-australia": "spectrum-life-anz-market-entry",
    "tpro-apac": "t-pro-anz-market-entry",
    "fexco-pacific-australia": "fexco-anz-market-entry",
    "learnupon-apac": "learnupon-anz-market-entry",
    "kyckr-asx": "kyckr-anz-market-entry",
}

# Source sector → MES category (matches existing 25 cases' split)
CATEGORY_BY_SLUG = {
    "clanwilliam-anz-market-entry": "Technology Market Entry",  # Healthtech
    "spectrum-life-anz-market-entry": "Fintech Success",         # Insurtech / EAP / wellbeing
    "t-pro-anz-market-entry": "Technology Market Entry",          # Healthcare AI
    "fexco-anz-market-entry": "Fintech Success",                  # FX / payments
    "learnupon-anz-market-entry": "Technology Market Entry",      # Edtech / SaaS
    "kyckr-anz-market-entry": "Fintech Success",                  # RegTech
}

INDUSTRY_BY_SLUG = {
    "clanwilliam-anz-market-entry": "Healthtech",
    "spectrum-life-anz-market-entry": "Insurtech",
    "t-pro-anz-market-entry": "Healthcare AI",
    "fexco-anz-market-entry": "Fintech",
    "learnupon-anz-market-entry": "Edtech",
    "kyckr-anz-market-entry": "RegTech",
}

COMPANY_NAME_BY_SLUG = {
    "clanwilliam-anz-market-entry": "Clanwilliam",
    "spectrum-life-anz-market-entry": "Spectrum.Life",
    "t-pro-anz-market-entry": "T-Pro",
    "fexco-anz-market-entry": "Fexco",
    "learnupon-anz-market-entry": "LearnUpon",
    "kyckr-anz-market-entry": "Kyckr",
}

# Founders: pulled from meta-strip (where present) or from prose for cases
# that don't include a Founders meta-cell (Clanwilliam, Fexco, T-Pro, Kyckr).
FOUNDERS_BY_SLUG: dict[str, list[dict[str, Any]]] = {
    "clanwilliam-anz-market-entry": [
        {"name": "Howard Beggs", "title": "Founder", "is_primary": True},
    ],
    "spectrum-life-anz-market-entry": [
        {"name": "Stuart McGoldrick", "title": "Co-founder", "is_primary": True},
        {"name": "Stephen Costello", "title": "Co-founder", "is_primary": False},
    ],
    "t-pro-anz-market-entry": [],
    "fexco-anz-market-entry": [
        {"name": "Brian McCarthy", "title": "Founder", "is_primary": True},
    ],
    "learnupon-anz-market-entry": [
        {"name": "Brendan Noud", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Des Anderson", "title": "Co-founder & CTO", "is_primary": False},
    ],
    "kyckr-anz-market-entry": [
        {"name": "Ben Cronin", "title": "Co-founder", "is_primary": True},
        {"name": "Rob Leslie", "title": "Co-founder", "is_primary": False},
        {"name": "John Murray", "title": "Co-founder", "is_primary": False},
        {"name": "Richard Wood", "title": "Co-founder", "is_primary": False},
    ],
}

# Map source section headings to canonical MES section slugs.
# Order in the output JSON follows the MES convention: entry → success → metrics → lessons.
SECTION_ROUTING: list[tuple[str, list[str]]] = [
    (
        "entry-strategy",
        [
            "Overview",
            "Company overview",
            "Why ANZ was the right market",
            "Why Australia was the right market",
            "Market entry journey",
            "ANZ market entry journey",
            "ANZ and APAC market entry journey",
            "The ASX as a market-entry strategy",
        ],
    ),
    (
        "success-factors",
        [
            "What founders can copy (MES Playbook)",
            "MES Playbook",
            "Why this approach worked",
            "Why this pattern matters for MES",
        ],
    ),
    (
        "key-metrics",
        ["Key outcomes", "APAC customer base", "Growth and exit"],
    ),
    (
        "lessons-learned",
        ["What founders can copy (MES Playbook)", "MES Playbook"],
    ),
]

# Source type detection (domain-only, matches the UK enrichment heuristic).
def _domain_of(url: str) -> str:
    m = re.match(r"^https?://([^/]+)", url.lower())
    return m.group(1) if m else url.lower()


PRESS_DOMAINS = {
    "newshub.medianet.com.au", "via.ritzau.dk", "pressreleases.responsesource.com",
    "businesswire.com", "www.businesswire.com",
}
COMPANY_DOMAINS = {
    "www.clanwilliam.com", "clanwilliam.com",
    "www.healthlink.com.au", "healthlink.com.au",
    "www.telstrahealth.com", "telstrahealth.com",
    "spectrum.life", "www.spectrum.life",
    "blog.tpro.io", "tpro.io",
    "valionhealth.com.au", "soundbusiness.co.nz",
    "www.fexco.com", "fexco.com", "no1currency.com", "www.no1currency.com",
    "www.learnupon.com", "learnupon.com",
    "kyckr.com", "www.kyckr.com",
    "www.livingbridge.com", "livingbridge.com",
    "www.minterellison.com", "minterellison.com",
    "www.waterman.co.nz",
}


def detect_source_type(url: str) -> str:
    domain = _domain_of(url)
    if "linkedin.com" in domain:
        return "linkedin"
    if domain.endswith(".gov.au") or domain.endswith(".gov.uk") or ".gov." in domain:
        return "government"
    if "wikipedia.org" in domain:
        return "other"
    if domain in PRESS_DOMAINS:
        return "press_release"
    if domain in COMPANY_DOMAINS:
        return "company_blog"
    return "news"


# ---------------------------------------------------------------------------
# Inline-content rendering helpers
# ---------------------------------------------------------------------------

_WS_RE = re.compile(r"\s+")


def _flatten_text(node: Tag | NavigableString) -> str:
    """Collect text content from a node, preserving inline anchors as plain text."""
    if isinstance(node, NavigableString):
        return str(node)
    parts: list[str] = []
    for child in node.children:
        if isinstance(child, NavigableString):
            parts.append(str(child))
        elif isinstance(child, Tag):
            if child.name == "a":
                parts.append(child.get_text(" ", strip=False))
            elif child.name in {"em", "strong", "b", "i"}:
                inner = _flatten_text(child)
                tag = "strong" if child.name in {"strong", "b"} else "em"
                parts.append(f"<{tag}>{inner}</{tag}>")
            else:
                parts.append(_flatten_text(child))
    return "".join(parts)


def _normalise_ws(s: str) -> str:
    return _WS_RE.sub(" ", s).strip()


def _p_html(text: str) -> str:
    text = _normalise_ws(text)
    if not text:
        return ""
    return f"<p>{text}</p>"


_STRIP_INNER_STRONG = re.compile(r"</?strong>")


def _strip_inner_strong(s: str) -> str:
    return _STRIP_INNER_STRONG.sub("", s)


def _table_to_ul(table: Tag) -> str:
    """Render a 2- or 3-column table as a single <ul> bullet list.

    Uses the first <th> column heading to detect 'Year' / 'Metric' / 'Customer' /
    'Play' rows.  Drops the header row. Inline <strong> in cells is stripped
    so wrapping the whole cell in <strong> for emphasis doesn't nest tags.
    """
    headers = [_normalise_ws(_flatten_text(th)) for th in table.select("thead th")]
    rows = []
    for tr in table.select("tbody tr"):
        cells = [_normalise_ws(_flatten_text(td)) for td in tr.find_all("td")]
        if cells:
            rows.append(cells)
    if not rows:
        return ""
    lis: list[str] = []
    for cells in rows:
        if len(cells) >= 3:
            head = _strip_inner_strong(cells[0])
            mid, tail = cells[1], cells[2]
            lis.append(
                f"<li><strong>{head}</strong> — {mid} <em>({tail})</em></li>"
            )
        elif len(cells) == 2:
            head = _strip_inner_strong(cells[0])
            lis.append(f"<li><strong>{head}</strong>: {cells[1]}</li>")
        elif len(cells) == 1:
            lis.append(f"<li>{cells[0]}</li>")
    return f"<ul>{''.join(lis)}</ul>"


def _section_block_to_html(block: Tag) -> tuple[str, list[str]]:
    """Convert a <div class='section-block'> → (heading, [body html paragraphs])."""
    heading_div = block.find("div", class_="section-title")
    heading = _normalise_ws(_flatten_text(heading_div)) if heading_div else ""
    bodies: list[str] = []
    for child in block.children:
        if not isinstance(child, Tag):
            continue
        if child is heading_div:
            continue
        if child.name == "p":
            html = _p_html(_flatten_text(child))
            if html:
                bodies.append(html)
        elif child.name == "div" and "tbl-wrap" in (child.get("class") or []):
            table = child.find("table")
            if table:
                rendered = _table_to_ul(table)
                if rendered:
                    bodies.append(rendered)
        elif child.name == "div" and "tag-row" in (child.get("class") or []):
            # tags are captured separately
            continue
        elif child.name == "div" and "schema-box" in (child.get("class") or []):
            continue
    return heading, bodies


def _meta_strip_to_kv(strip: Tag) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for cell in strip.select(".meta-cell"):
        label_div = cell.find("div", class_="label")
        value_div = cell.find("div", class_="value")
        if label_div and value_div:
            out.append((
                _normalise_ws(_flatten_text(label_div)),
                _normalise_ws(_flatten_text(value_div)),
            ))
    return out


def _meta_to_quick_facts(meta: list[tuple[str, str]], industry: str) -> list[dict]:
    """Take the source's Founded/EntryMode/etc. and project into MES quick_facts."""
    qf: list[dict] = [
        {"icon": "MapPin", "label": "HQ", "value": "Ireland"},
        {"icon": "Briefcase", "label": "Sector", "value": industry},
        {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"},
    ]
    return qf


def _entry_year_from_meta(meta: list[tuple[str, str]]) -> str | None:
    for label, value in meta:
        if any(kw in label.lower() for kw in ("anz entry", "australia entry", "nz entry", "first anz", "asx listing", "anz division")):
            m = re.search(r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+)?(\d{4})", value, re.I)
            if m:
                return m.group(2)
    return None


def _company_founded_from_meta(meta: list[tuple[str, str]]) -> str | None:
    for label, value in meta:
        if label.lower() == "founded":
            m = re.search(r"(\d{4})", value)
            if m:
                return m.group(1)
    return None


def _extract_callout(card_body: Tag) -> str | None:
    callout = card_body.find("div", class_="callout")
    if not callout:
        return None
    # Pull the quote and the cite separately so we can render cleanly.
    cite_tag = callout.find("cite")
    cite_text = ""
    if cite_tag:
        cite_text = _normalise_ws(_flatten_text(cite_tag))
        cite_tag.extract()  # remove from tree before flattening the rest
    quote_text = _normalise_ws(_flatten_text(callout))
    # Strip surrounding quotes (straight or curly).
    quote_text = quote_text.strip().strip('"“”').strip()
    # Drop the generic editorial-lesson attribution; keep named attributions
    # (e.g. "— Stephen Costello, CEO, …").
    if cite_text and "MES editorial lesson" not in cite_text:
        return f"&ldquo;{quote_text}&rdquo; <span style=\"color: var(--muted);\">{cite_text}</span>"
    return quote_text or None


def _extract_sources(card_body: Tag) -> list[dict]:
    sources: list[dict] = []
    src_block = card_body.find("div", class_="sources-block")
    if not src_block:
        return sources
    for item in src_block.select(".src-item"):
        num_div = item.find("div", class_="src-num")
        label_div = item.find("div", class_="src-label")
        link = item.find("a", href=True)
        if not link:
            continue
        try:
            n = int(_normalise_ws(_flatten_text(num_div))) if num_div else None
        except (TypeError, ValueError):
            n = None
        url = link["href"].strip()
        label = _normalise_ws(_flatten_text(label_div)) if label_div else url
        sources.append({
            "citation_number": n,
            "url": url,
            "label": label,
            "source_type": detect_source_type(url),
        })
    return sources


def _extract_tags(card_body: Tag) -> list[str]:
    return [
        _normalise_ws(_flatten_text(tag))
        for tag in card_body.select(".tag-row .tag")
    ]


def _build_section_map(card_body: Tag) -> dict[str, list[str]]:
    """heading-text → list[<html body>] over all section-blocks in card_body."""
    out: dict[str, list[str]] = {}
    for block in card_body.find_all("div", class_="section-block", recursive=True):
        heading, bodies = _section_block_to_html(block)
        if heading and bodies:
            out.setdefault(heading, []).extend(bodies)
    return out


def parse_case(section: Tag) -> dict[str, Any]:
    # ---- header ----
    case_num = _normalise_ws(_flatten_text(section.find("span", class_="case-num"))) if section.find("span", class_="case-num") else ""
    slug_code = _normalise_ws(_flatten_text(section.find("span", class_="slug-code"))) if section.find("span", class_="slug-code") else ""
    legacy_slug = slug_code.replace("slug:", "").strip()
    new_slug = SLUG_NORMALISATION.get(legacy_slug)
    if not new_slug:
        raise RuntimeError(f"Unknown source slug: {legacy_slug!r}")

    title_h2 = section.find("h2")
    source_title = _normalise_ws(_flatten_text(title_h2)) if title_h2 else ""

    tagline = ""
    tagline_p = section.select_one("p.tagline")
    if tagline_p:
        tagline = _normalise_ws(_flatten_text(tagline_p))

    company = COMPANY_NAME_BY_SLUG[new_slug]
    industry = INDUSTRY_BY_SLUG[new_slug]
    category = CATEGORY_BY_SLUG[new_slug]

    # ---- meta strip ----
    meta_strip = section.find("div", class_="meta-strip")
    meta = _meta_strip_to_kv(meta_strip) if meta_strip else []
    company_founded = _company_founded_from_meta(meta)
    entry_year = _entry_year_from_meta(meta)
    quick_facts = _meta_to_quick_facts(meta, industry)

    card_body = section.find("div", class_="card-body")
    if not card_body:
        raise RuntimeError(f"Missing card-body for slug {legacy_slug}")

    section_map = _build_section_map(card_body)
    callout = _extract_callout(card_body)

    # ---- Map source headings → MES sections ----
    entry_html: list[str] = []
    for h in ["Overview", "Company overview"]:
        if h in section_map:
            entry_html.extend(section_map[h])
    for h in [
        "Why ANZ was the right market",
        "Why Australia was the right market",
    ]:
        if h in section_map:
            entry_html.extend(section_map[h])
    for h in [
        "Market entry journey",
        "ANZ market entry journey",
        "ANZ and APAC market entry journey",
        "The ASX as a market-entry strategy",
    ]:
        if h in section_map:
            entry_html.extend(section_map[h])

    success_html: list[str] = []
    for h in [
        "Why this approach worked",
        "Why this pattern matters for MES",
    ]:
        if h in section_map:
            success_html.extend(section_map[h])
    if callout:
        success_html.append(f"<p><em>{callout}</em></p>")

    metrics_html: list[str] = []
    for h in ["Key outcomes", "APAC customer base", "Growth and exit"]:
        if h in section_map:
            metrics_html.extend(section_map[h])
    # Fallback: if the source has no Key outcomes table, synthesize one from
    # the meta-strip so every case has a consistent 4-section MES shape.
    if not metrics_html and meta:
        items = "".join(f"<li><strong>{lbl}</strong>: {val}</li>" for lbl, val in meta)
        metrics_html.append(f"<ul>{items}</ul>")

    lessons_html: list[str] = []
    intro_p = (
        f"<p>For Irish operators considering ANZ entry, {company}'s playbook offers "
        f"a clear template. The lessons below distil {company}'s entry decisions, "
        f"partner choices, and milestones in Australia &amp; New Zealand.</p>"
    )
    lessons_html.append(intro_p)
    for h in ["What founders can copy (MES Playbook)", "MES Playbook"]:
        if h in section_map:
            lessons_html.extend(section_map[h])

    # If the success-factors block is empty (no "Why this approach worked"
    # heading), back-fill it with the playbook table so the section never
    # renders blank.
    if not success_html:
        for h in ["What founders can copy (MES Playbook)", "MES Playbook"]:
            if h in section_map:
                success_html.extend(section_map[h])
                break

    sections = [
        {"title": "Entry Strategy", "slug": "entry-strategy", "bodies": entry_html},
        {"title": "Success Factors", "slug": "success-factors", "bodies": success_html},
        {"title": "Key Metrics & Performance", "slug": "key-metrics", "bodies": metrics_html},
        {"title": "Lessons Learned", "slug": "lessons-learned", "bodies": lessons_html},
    ]
    sections = [s for s in sections if s["bodies"]]

    sources = _extract_sources(card_body)
    tags = _extract_tags(card_body)

    # ---- Top-level fields ----
    title = f"How {company} Entered the ANZ Market"
    subtitle = tagline or None
    tldr: list[str] = []
    if tagline:
        tldr.append(tagline)
    if entry_html:
        first = re.sub(r"<[^>]+>", "", entry_html[0])
        first_sentence = re.split(r"(?<=[.!?])\s+", first.strip())[0]
        if first_sentence and first_sentence not in tldr:
            tldr.append(first_sentence)

    # rough read-time estimate (200 wpm)
    word_count = sum(len(re.sub(r"<[^>]+>", " ", b).split()) for s in sections for b in s["bodies"])
    read_time = max(2, round(word_count / 200))

    return {
        "slug": new_slug,
        "legacy_slug": legacy_slug,
        "title": title,
        "subtitle": subtitle,
        "category": category,
        "company_name": company,
        "origin_country": "Ireland",
        "target_market": "Australia & New Zealand",
        "industry": industry,
        "company_founded": company_founded,
        "entry_year": entry_year,
        "tagline": tagline,
        "tldr": tldr,
        "quick_facts": quick_facts,
        "founders": FOUNDERS_BY_SLUG.get(new_slug, []),
        "sections": sections,
        "sources": sources,
        "mes_tags": tags,
        "read_time": read_time,
        "status": "published",
        "source_title": source_title,
        "case_num": case_num,
    }


def main() -> None:
    soup = BeautifulSoup(INPUT_PATH.read_text(encoding="utf-8"), "lxml")
    cases = []
    for section in soup.select("section.case-study"):
        cases.append(parse_case(section))
    OUTPUT_PATH.write_text(
        json.dumps(cases, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Parsed {len(cases)} Irish Tier 1 case studies → {OUTPUT_PATH}")
    for c in cases:
        sec_summary = ", ".join(f"{s['slug']}({len(s['bodies'])})" for s in c["sections"])
        print(
            f"  {c['slug']:42s} legacy={c['legacy_slug']:30s} "
            f"sections=[{sec_summary}] sources={len(c['sources'])} "
            f"founders={len(c['founders'])} tags={len(c['mes_tags'])}"
        )


if __name__ == "__main__":
    main()
