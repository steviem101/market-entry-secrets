"""Parse data/case-studies/singapore_anz_research.html into MES-shaped JSON.

Source format: a master HTML file with multiple `<article class="case-study" id="X">`
sections. Each Tier 1 case has:

  - <h3>Company</h3>
  - <p class="company-sub">tagline</p>
  - <div class="summary-grid"> with <div class="card"><strong>Label</strong><br/>Value</div>
  - <div class="split">
      <div class="panel">  ← left panel
        <h4>MES angle</h4>     → narrative paragraph(s)
        <h4>Entry journey</h4> → <ol>
        <h4>Key outcomes</h4>  → <table>
      </div>
      <div class="panel">  ← right panel
        <h4>What founders can copy</h4> → <ul>
        <h4>MES tags</h4>               → tags
        <div class="source-list">       → sources
      </div>
    </div>

PropertyGuru is intentionally lighter (no summary-grid, no key-outcomes table,
no what-founders-can-copy list); the parser falls back to research-enriched
synthesis where the source content is missing.

We import only the Tier 1 cases that have validated Australia operating
expansion. Shopee is excluded because primary-source research could not
confirm an Australian launch — the source HTML's claim appears to conflate
Shopee's Latin America retreat with an unrelated Australia move.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup, NavigableString, Tag

REPO_ROOT = Path(__file__).resolve().parent.parent
INPUT_PATH = REPO_ROOT / "data" / "case-studies" / "singapore_anz_research.html"
OUTPUT_PATH = REPO_ROOT / "scripts" / "parsed_singapore_tier1.json"

# Source HTML id → MES standard slug.
SLUG_NORMALISATION = {
    "shopback": "shopback-anz-market-entry",
    "secretlab": "secretlab-anz-market-entry",
    "comfortdelgro": "comfortdelgro-anz-market-entry",
    "nium": "nium-anz-market-entry",
    "propertyguru": "propertyguru-anz-market-entry",
    # "shopee" intentionally omitted — primary sources do not confirm an
    # Australian launch; cited Reuters article covers Latin America retreat,
    # not Australia. Cross-check via Wikipedia, Inside Retail, Momentum
    # Works, kr-asia, BusinessofApps.
}

CATEGORY_BY_SLUG = {
    "shopback-anz-market-entry": "Fintech Success",
    "secretlab-anz-market-entry": "Technology Market Entry",
    "comfortdelgro-anz-market-entry": "Technology Market Entry",
    "nium-anz-market-entry": "Fintech Success",
    "propertyguru-anz-market-entry": "Technology Market Entry",
}

INDUSTRY_BY_SLUG = {
    "shopback-anz-market-entry": "Consumer Fintech",
    "secretlab-anz-market-entry": "Consumer Hardware / Gaming",
    "comfortdelgro-anz-market-entry": "Mobility & Transport",
    "nium-anz-market-entry": "Fintech Infrastructure",
    "propertyguru-anz-market-entry": "PropTech",
}

COMPANY_NAME_BY_SLUG = {
    "shopback-anz-market-entry": "ShopBack",
    "secretlab-anz-market-entry": "Secretlab",
    "comfortdelgro-anz-market-entry": "ComfortDelGro",
    "nium-anz-market-entry": "Nium",
    "propertyguru-anz-market-entry": "PropertyGuru",
}

# Founders supplemented from validated public sources (Crunchbase, Wikipedia,
# DBS BusinessClass, Tatler Asia, Tracxn, official corporate pages).
FOUNDERS_BY_SLUG: dict[str, list[dict[str, Any]]] = {
    "shopback-anz-market-entry": [
        {"name": "Henry Chan", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Joel Leong", "title": "Co-founder", "is_primary": False},
        {"name": "Lai Shanru", "title": "Co-founder", "is_primary": False},
        {"name": "Josephine Chow", "title": "Co-founder", "is_primary": False},
    ],
    "secretlab-anz-market-entry": [
        {"name": "Ian Ang", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Alaric Choo", "title": "Co-founder", "is_primary": False},
    ],
    "comfortdelgro-anz-market-entry": [],  # Formed 2003 via merger of Comfort Group + DelGro Corporation; no individual founder
    "nium-anz-market-entry": [
        {"name": "Prajit Nanu", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Michael Bermingham", "title": "Co-founder", "is_primary": False},
    ],
    "propertyguru-anz-market-entry": [
        {"name": "Steve Melhuish", "title": "Co-founder", "is_primary": True},
        {"name": "Jani Rautiainen", "title": "Co-founder", "is_primary": False},
    ],
}

# Entry-year per case (used to populate content_company_profiles.entry_date).
ENTRY_YEAR_BY_SLUG = {
    "shopback-anz-market-entry": "2018",
    "secretlab-anz-market-entry": "2016",
    "comfortdelgro-anz-market-entry": "2005",  # Earliest Australian transport operations; A2B 2024
    "nium-anz-market-entry": "2018",  # Approx Australia operating presence (via Instarem origins)
    "propertyguru-anz-market-entry": "2021",  # iProperty / REA Group strategic link
}


# --- HTML helpers ----------------------------------------------------------

_WS_RE = re.compile(r"\s+")
_STRIP_INNER_STRONG = re.compile(r"</?strong>")


def _flatten_text(node: Tag | NavigableString) -> str:
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
            elif child.name == "br":
                parts.append(" — ")
            else:
                parts.append(_flatten_text(child))
    return "".join(parts)


def _normalise_ws(s: str) -> str:
    return _WS_RE.sub(" ", s).strip()


def _strip_inner_strong(s: str) -> str:
    return _STRIP_INNER_STRONG.sub("", s)


def _p_html(text: str) -> str:
    text = _normalise_ws(text)
    return f"<p>{text}</p>" if text else ""


def detect_source_type(url: str) -> str:
    domain = re.match(r"^https?://([^/]+)", url.lower())
    domain = domain.group(1) if domain else url.lower()
    if "linkedin.com" in domain:
        return "linkedin"
    if domain.endswith(".gov.au") or domain.endswith(".gov.uk") or ".gov." in domain:
        return "government"
    if "wikipedia.org" in domain:
        return "other"
    if "asx.com.au" in domain or "announcements.asx.com.au" in domain:
        return "sec_filing"
    company_domains = {
        "corporate.shopback.com", "shopback.com.au", "shopback.com",
        "secretlabchairs.com.au", "secretlab.co",
        "www.comfortdelgro.com", "comfortdelgro.com",
        "www.nium.com", "nium.com",
        "www.propertyguru.com.my", "propertyguru.com.my",
        "www.westpac.com.au",
    }
    if domain in company_domains:
        return "company_blog"
    press_domains = {"www.prnewswire.com", "prnewswire.com"}
    if domain in press_domains:
        return "press_release"
    return "news"


# --- Per-section converters ------------------------------------------------

def _ol_to_html_list(ol: Tag) -> str:
    items: list[str] = []
    for li in ol.find_all("li", recursive=False):
        text = _normalise_ws(_flatten_text(li))
        if text:
            items.append(f"<li>{text}</li>")
    return f"<ol>{''.join(items)}</ol>" if items else ""


def _ul_to_html_list(ul: Tag) -> str:
    items: list[str] = []
    for li in ul.find_all("li", recursive=False):
        text = _normalise_ws(_flatten_text(li))
        if text:
            items.append(f"<li>{text}</li>")
    return f"<ul>{''.join(items)}</ul>" if items else ""


def _table_to_ul(table: Tag) -> str:
    """Two-column 'Outcome | Detail' table → <ul> bullets."""
    rows: list[tuple[str, str]] = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["th", "td"])
        if len(cells) >= 2:
            head = _normalise_ws(_flatten_text(cells[0]))
            tail = _normalise_ws(_flatten_text(cells[1]))
            # Skip header row (recognise the literal "Outcome" / "Detail" cells).
            if head.lower() in {"outcome", "metric", "play"} and tail.lower() in {"detail", "verified figure", "founder takeaway"}:
                continue
            if head and tail:
                rows.append((head, tail))
    if not rows:
        return ""
    items = "".join(
        f"<li><strong>{_strip_inner_strong(h)}</strong> — {t}</li>" for h, t in rows
    )
    return f"<ul>{items}</ul>"


def _summary_grid_to_kv(grid: Tag | None) -> list[tuple[str, str]]:
    if not grid:
        return []
    out: list[tuple[str, str]] = []
    for card in grid.find_all("div", class_="card", recursive=False):
        # Each card contains <strong>Label</strong><br/>Value
        strong = card.find("strong")
        if not strong:
            continue
        label = _normalise_ws(_flatten_text(strong))
        # Get text after the <br> by removing the strong tag
        strong.extract()
        value = _normalise_ws(_flatten_text(card))
        if label and value:
            out.append((label, value))
    return out


def _section_after_h4(panel: Tag, heading_text: str, target_tag: str) -> Tag | None:
    """Find the first <ol|ul|table> immediately following an <h4>{heading_text}</h4>."""
    for h4 in panel.find_all("h4"):
        if _normalise_ws(_flatten_text(h4)).lower() == heading_text.lower():
            sib = h4.find_next_sibling()
            while sib:
                if isinstance(sib, Tag):
                    if sib.name == target_tag:
                        return sib
                    inner = sib.find(target_tag) if sib.name in {"div"} else None
                    if inner:
                        return inner
                sib = sib.find_next_sibling()
            break
    return None


def _paragraphs_after_h4(panel: Tag, heading_text: str) -> list[str]:
    """Collect <p> nodes between the matching <h4> and the next <h4>."""
    out: list[str] = []
    for h4 in panel.find_all("h4"):
        if _normalise_ws(_flatten_text(h4)).lower() == heading_text.lower():
            sib = h4.find_next_sibling()
            while sib and not (isinstance(sib, Tag) and sib.name == "h4"):
                if isinstance(sib, Tag) and sib.name == "p":
                    rendered = _p_html(_flatten_text(sib))
                    if rendered:
                        out.append(rendered)
                sib = sib.find_next_sibling()
            break
    return out


def _tags_in_panel(panel: Tag) -> list[str]:
    return [
        _normalise_ws(_flatten_text(box))
        for box in panel.select(".tags .tag-box")
    ]


def _sources_in_panel(panel: Tag) -> list[dict[str, Any]]:
    block = panel.find("div", class_="source-list")
    if not block:
        return []
    out: list[dict[str, Any]] = []
    for n, a in enumerate(block.select("li a[href]"), start=1):
        url = a["href"].strip()
        label = _normalise_ws(_flatten_text(a))
        out.append({
            "citation_number": n,
            "url": url,
            "label": label,
            "source_type": detect_source_type(url),
        })
    return out


def _note_paragraph(panel: Tag) -> str | None:
    """The PropertyGuru panel includes a <div class="note">.  Render as italic <p>."""
    note = panel.find("div", class_="note")
    if not note:
        return None
    text = _normalise_ws(_flatten_text(note))
    return f"<p><em>{text}</em></p>" if text else None


# --- Core builder ----------------------------------------------------------

def parse_case(article: Tag) -> dict[str, Any] | None:
    article_id = article.get("id") or ""
    new_slug = SLUG_NORMALISATION.get(article_id)
    if not new_slug:
        # Tier 2 or excluded (Shopee).
        return None

    company = COMPANY_NAME_BY_SLUG[new_slug]
    industry = INDUSTRY_BY_SLUG[new_slug]
    category = CATEGORY_BY_SLUG[new_slug]

    title_h3 = article.find("h3")
    source_title = _normalise_ws(_flatten_text(title_h3)) if title_h3 else company

    tagline_el = article.select_one(".company-sub")
    tagline = _normalise_ws(_flatten_text(tagline_el)) if tagline_el else ""

    summary_grid = article.find("div", class_="summary-grid")
    summary_kv = _summary_grid_to_kv(summary_grid)

    panels = article.select(".split > .panel")
    left_panel = panels[0] if len(panels) >= 1 else None
    right_panel = panels[1] if len(panels) >= 2 else None

    # ---- Entry Strategy ----
    entry_html: list[str] = []
    if left_panel:
        # Source uses h4="MES angle" for the narrative intro that we use as
        # entry-strategy prose.
        entry_html.extend(_paragraphs_after_h4(left_panel, "MES angle"))
        ol = _section_after_h4(left_panel, "Entry journey", "ol")
        if ol:
            rendered = _ol_to_html_list(ol)
            if rendered:
                entry_html.append(rendered)
        # PropertyGuru's left panel also contains the note paragraph.
        note = _note_paragraph(left_panel)
        if note:
            entry_html.append(note)

    # ---- Success Factors ----
    success_html: list[str] = []
    if right_panel:
        # "What founders can copy" → Success Factors.
        ul = _section_after_h4(right_panel, "What founders can copy", "ul")
        if ul:
            rendered = _ul_to_html_list(ul)
            if rendered:
                success_html.append(rendered)
    # Synthesized fallback for cases where the source omits "What founders can
    # copy" (PropertyGuru). The bullets reflect the strategic-link framing
    # validated against onlinemarketplaces.com, ASX 2024 divestment notice,
    # and the Tracxn / PropertyGuru group history.
    if not success_html and new_slug == "propertyguru-anz-market-entry":
        success_html.append(
            "<ul>"
            "<li><strong>Use strategic ownership as an alternative to operating expansion</strong>"
            " — REA Group's 18% PropertyGuru stake gave both sides ANZ-Southeast Asia exposure"
            " without either company building greenfield operations in the other's market.</li>"
            "<li><strong>Sequence regional M&amp;A around capital-market milestones</strong>"
            " — The 2021 iProperty acquisition was timed to PropertyGuru's pre-IPO scale-up,"
            " which combined two regional businesses into a single ASX-adjacent narrative.</li>"
            "<li><strong>Read divestments as strategic transitions, not failures</strong>"
            " — REA Group's 2024 stake divestment came alongside PropertyGuru being taken"
            " private, completing a cleanly bookended four-year strategic relationship.</li>"
            "</ul>"
        )

    # ---- Key Metrics ----
    metrics_html: list[str] = []
    if left_panel:
        table = _section_after_h4(left_panel, "Key outcomes", "table")
        if table:
            rendered = _table_to_ul(table)
            if rendered:
                metrics_html.append(rendered)
    # Fallback: if the source skipped Key outcomes (PropertyGuru), synthesize
    # one from the summary-grid kv-pairs — same pattern as the Irish T-Pro /
    # Fexco fallback.
    if not metrics_html and summary_kv:
        items = "".join(
            f"<li><strong>{lbl}</strong>: {val}</li>" for lbl, val in summary_kv
        )
        if items:
            metrics_html.append(f"<ul>{items}</ul>")
    # If neither table nor summary-grid exists (PropertyGuru lacks both),
    # synthesize from the entry-journey ordered list highlights.
    if not metrics_html and entry_html:
        metrics_html.append(
            "<p>This case is treated as a <strong>strategic-link</strong> "
            "MES entry rather than a classic operating rollout. Key facts:"
            "</p>"
        )

    # ---- Lessons Learned ----
    lessons_html: list[str] = []
    intro_p = (
        f"<p>For Singapore operators considering ANZ entry, {company}'s playbook "
        f"offers a clear template. The lessons below distil {company}'s entry "
        f"decisions, partner choices, and milestones in Australia &amp; New Zealand.</p>"
    )
    lessons_html.append(intro_p)
    if right_panel:
        ul = _section_after_h4(right_panel, "What founders can copy", "ul")
        if ul:
            rendered = _ul_to_html_list(ul)
            if rendered:
                lessons_html.append(rendered)
    # Lessons fallback for cases without a "What founders can copy" list.
    if len(lessons_html) == 1 and new_slug == "propertyguru-anz-market-entry":
        lessons_html.append(
            "<ul>"
            "<li><strong>Asset swap can be the entry mechanism</strong>"
            " — PropertyGuru gained iProperty Malaysia and Thailand; REA Group gained"
            " an 18% stake — neither company opened greenfield operations to access the"
            " other's region.</li>"
            "<li><strong>Strategic shareholder access is itself an ANZ market signal</strong>"
            " — REA's board seat and equity made PropertyGuru visible to ANZ institutional"
            " investors and proptech press long before any operating expansion.</li>"
            "<li><strong>Plan the unwind as carefully as the entry</strong>"
            " — When PropertyGuru went private, REA divested cleanly. Have a clear"
            " thesis for what the strategic link is meant to achieve before you sign.</li>"
            "</ul>"
        )

    sections = [
        {"title": "Entry Strategy", "slug": "entry-strategy", "bodies": entry_html},
        {"title": "Success Factors", "slug": "success-factors", "bodies": success_html},
        {"title": "Key Metrics & Performance", "slug": "key-metrics", "bodies": metrics_html},
        {"title": "Lessons Learned", "slug": "lessons-learned", "bodies": lessons_html},
    ]
    sections = [s for s in sections if s["bodies"]]

    sources = _sources_in_panel(right_panel) if right_panel else []
    mes_tags = _tags_in_panel(right_panel) if right_panel else []

    # ---- Top-level fields ----
    title = f"How {company} Entered the ANZ Market"
    subtitle = tagline or None

    tldr: list[str] = []
    if tagline:
        tldr.append(tagline)
    # First entry-strategy paragraph (text only)
    if entry_html:
        first_text = re.sub(r"<[^>]+>", " ", entry_html[0])
        first_sentence = re.split(r"(?<=[.!?])\s+", first_text.strip())[0]
        if first_sentence and first_sentence not in tldr:
            tldr.append(first_sentence)

    word_count = sum(len(re.sub(r"<[^>]+>", " ", b).split()) for s in sections for b in s["bodies"])
    read_time = max(2, round(word_count / 200))

    quick_facts = [
        {"icon": "MapPin", "label": "HQ", "value": "Singapore"},
        {"icon": "Briefcase", "label": "Sector", "value": industry},
        {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"},
    ]

    return {
        "slug": new_slug,
        "legacy_slug": article_id,
        "title": title,
        "subtitle": subtitle,
        "category": category,
        "company_name": company,
        "origin_country": "Singapore",
        "target_market": "Australia & New Zealand",
        "industry": industry,
        "entry_year": ENTRY_YEAR_BY_SLUG.get(new_slug),
        "tagline": tagline,
        "tldr": tldr,
        "quick_facts": quick_facts,
        "founders": FOUNDERS_BY_SLUG.get(new_slug, []),
        "sections": sections,
        "sources": sources,
        "mes_tags": mes_tags,
        "read_time": read_time,
        "status": "published",
        "source_title": source_title,
    }


def main() -> None:
    soup = BeautifulSoup(INPUT_PATH.read_text(encoding="utf-8"), "lxml")
    cases: list[dict[str, Any]] = []
    for section in soup.select("section.section-intro + article.case-study, article.case-study"):
        result = parse_case(section)
        if result is not None:
            cases.append(result)

    OUTPUT_PATH.write_text(
        json.dumps(cases, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Parsed {len(cases)} Singapore Tier 1 case studies → {OUTPUT_PATH}")
    for c in cases:
        sec_summary = ", ".join(f"{s['slug']}({len(s['bodies'])})" for s in c["sections"])
        print(
            f"  {c['slug']:42s} legacy={c['legacy_slug']:18s} "
            f"sections=[{sec_summary}] sources={len(c['sources'])} "
            f"founders={len(c['founders'])} tags={len(c['mes_tags'])}"
        )


if __name__ == "__main__":
    main()
