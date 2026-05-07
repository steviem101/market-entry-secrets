"""Parse data/case-studies/uk_anz_enriched_research.md into enriched JSON.

The output is keyed by existing UK slug (e.g. revolut-anz-market-entry) and
contains everything needed to upsert in-place into the MES Supabase database
without deleting any existing rows.

Schema per case (matches the importer contract used elsewhere):

{
  "slug": "revolut-anz-market-entry",
  "title": "How Revolut Entered the ANZ Market",
  "subtitle": "Three staff, a travel card, and a plan to own Australian finance.",
  "category": "Fintech Success" | "Technology Market Entry",
  "company_name": "Revolut",
  "origin_country": "United Kingdom",
  "target_market": "Australia & New Zealand",
  "industry": "Fintech",
  "tldr": ["...", "..."],
  "quick_facts": [{"icon": "MapPin", "label": "HQ", "value": "United Kingdom"}, ...],
  "tagline": "Three staff, a travel card, ...",
  "founders": [{"name": "Nikolay Storonsky", "title": "Co-founder", "is_primary": true}, ...],
  "sections": [
    {"title": "Entry Strategy", "slug": "entry-strategy", "bodies": ["<p>...</p>", "..."]},
    ...
  ],
  "sources": [{"label": "...", "url": "...", "citation_number": 1, "source_type": "company_blog"}, ...],
  "read_time": 6,
  "status": "published",
  "mes_tags": ["Fintech", "Neobank", ...],
}

The parser is deterministic and idempotent.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
INPUT_PATH = REPO_ROOT / "data" / "case-studies" / "uk_anz_enriched_research.md"
OUTPUT_PATH = REPO_ROOT / "scripts" / "parsed_uk_enriched.json"

# Map case study number -> existing slug (must match the 20 UK draft rows).
SLUG_BY_NUMBER = {
    1: "revolut-anz-market-entry",
    2: "wise-anz-market-entry",
    3: "darktrace-anz-market-entry",
    4: "quantexa-anz-market-entry",
    5: "thought-machine-anz-market-entry",
    6: "featurespace-anz-market-entry",
    7: "mimecast-anz-market-entry",
    8: "complyadvantage-anz-market-entry",
    9: "onfido-anz-market-entry",
    10: "blue-prism-anz-market-entry",
    11: "dext-anz-market-entry",
    12: "nplan-anz-market-entry",
    13: "daxtra-technologies-anz-market-entry",
    14: "anna-money-anz-market-entry",
    15: "tractable-anz-market-entry",
    16: "deliveroo-anz-market-entry",
    17: "banked-anz-market-entry",
    18: "ncc-group-anz-market-entry",
    19: "contino-anz-market-entry",
    20: "sensat-anz-market-entry",
}

CATEGORY_BY_NUMBER = {
    # Fintech Success
    1: "Fintech Success",
    2: "Fintech Success",
    4: "Fintech Success",
    5: "Fintech Success",
    6: "Fintech Success",
    8: "Fintech Success",
    11: "Fintech Success",
    14: "Fintech Success",
    15: "Fintech Success",  # InsurTech treated as Fintech Success per existing classification
    17: "Fintech Success",
    # Technology Market Entry
    3: "Technology Market Entry",
    7: "Technology Market Entry",
    9: "Technology Market Entry",
    10: "Technology Market Entry",
    12: "Technology Market Entry",
    13: "Technology Market Entry",
    16: "Technology Market Entry",
    18: "Technology Market Entry",
    19: "Technology Market Entry",
    20: "Technology Market Entry",
}

# Industry strings keep the lighter taxonomy used by the original importer.
INDUSTRY_BY_NUMBER = {
    1: "Fintech",
    2: "Fintech",
    3: "Cybersecurity",
    4: "Fintech",
    5: "Fintech",
    6: "Fintech",
    7: "Cybersecurity",
    8: "RegTech",
    9: "RegTech",
    10: "Automation",
    11: "AccountingTech",
    12: "Construction Tech",
    13: "HRTech",
    14: "Fintech",
    15: "InsurTech",
    16: "Marketplace",
    17: "Fintech",
    18: "Cybersecurity",
    19: "Cloud / DevOps",
    20: "Construction Tech",
}

COMPANY_NAMES = {
    1: "Revolut",
    2: "Wise",
    3: "Darktrace",
    4: "Quantexa",
    5: "Thought Machine",
    6: "Featurespace",
    7: "Mimecast",
    8: "ComplyAdvantage",
    9: "Onfido",
    10: "Blue Prism",
    11: "Dext",
    12: "nPlan",
    13: "DaXtra Technologies",
    14: "ANNA Money",
    15: "Tractable",
    16: "Deliveroo",
    17: "Banked",
    18: "NCC Group",
    19: "Contino",
    20: "Sensat",
}

# Founders extracted manually from Company Overview prose.
FOUNDERS_BY_NUMBER: dict[int, list[dict[str, Any]]] = {
    1: [
        {"name": "Nikolay Storonsky", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Vlad Yatsenko", "title": "Co-founder & CTO", "is_primary": False},
    ],
    2: [
        {"name": "Kristo Käärmann", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Taavet Hinrikus", "title": "Co-founder", "is_primary": False},
    ],
    4: [{"name": "Vishal Marria", "title": "Founder & CEO", "is_primary": True}],
    5: [{"name": "Paul Taylor", "title": "Founder & CEO", "is_primary": True}],
    6: [
        {"name": "Dave Excell", "title": "Co-founder", "is_primary": True},
        {"name": "Bill Fitzgerald", "title": "Co-founder", "is_primary": False},
    ],
    7: [
        {"name": "Peter Bauer", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Neil Murray", "title": "Co-founder & CTO", "is_primary": False},
    ],
    8: [{"name": "Charles Delingpole", "title": "Founder & CEO", "is_primary": True}],
    10: [
        {"name": "Alastair Bathgate", "title": "Co-founder", "is_primary": True},
        {"name": "David Moss", "title": "Co-founder", "is_primary": False},
    ],
    11: [{"name": "Michael Wood", "title": "Founder", "is_primary": True}],
    12: [
        {"name": "Dev Amratia", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Tom Bower", "title": "Co-founder & CTO", "is_primary": False},
    ],
    14: [
        {"name": "Eduard Panteleev", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Alexei Grachev", "title": "Co-founder", "is_primary": False},
    ],
    15: [
        {"name": "Alex Dalyac", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Razvan Ranca", "title": "Co-founder & CTO", "is_primary": False},
    ],
    16: [
        {"name": "Will Shu", "title": "Co-founder & CEO", "is_primary": True},
        {"name": "Greg Orlowski", "title": "Co-founder", "is_primary": False},
    ],
    17: [{"name": "Brad Goodall", "title": "Founder & CEO", "is_primary": True}],
    19: [
        {"name": "Matt Farmer", "title": "Co-founder", "is_primary": True},
        {"name": "William Martin", "title": "Co-founder", "is_primary": False},
    ],
    20: [
        {"name": "Rob Bhatt", "title": "Co-founder", "is_primary": True},
        {"name": "James Dean", "title": "Co-founder", "is_primary": False},
    ],
}

# Sections in MES schema and the matching markdown headings in the enriched doc.
# Each output section lists the source markdown headings that flow into its bodies.
SECTION_PLAN: list[dict[str, Any]] = [
    {
        "title": "Entry Strategy",
        "slug": "entry-strategy",
        "sources": ["Company Overview", "Why ANZ?", "The Entry Journey"],
    },
    {
        "title": "Success Factors",
        "slug": "success-factors",
        "sources": ["What You Can Copy"],  # rendered as a structured callout
    },
    {
        "title": "Key Metrics & Performance",
        "slug": "key-metrics",
        "sources": ["Key Outcomes", "Key Outcomes and Lessons"],
    },
    {
        "title": "Lessons Learned",
        "slug": "lessons-learned",
        "sources": ["What You Can Copy", "What You Can Copy (and Avoid)"],
    },
]

# Footnote-citation regex.
FOOTNOTE_RE = re.compile(r"\[\^(\d+)\]")
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
ITALIC_RE = re.compile(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)")
BULLET_RE = re.compile(r"^\s*[\-\*]\s+(.+)$")


def strip_footnotes(text: str) -> str:
    """Drop footnote markers (kept separately as a sources array)."""
    return FOOTNOTE_RE.sub("", text).strip()


def md_inline(text: str) -> str:
    """Convert minimal inline markdown (**, *, footnote markers) → HTML.

    Footnote markers are stripped because we promote them to a sources array.
    """
    text = strip_footnotes(text)
    text = BOLD_RE.sub(r"<strong>\1</strong>", text)
    text = ITALIC_RE.sub(r"<em>\1</em>", text)
    return text.strip()


def html_paragraph(text: str) -> str:
    inner = md_inline(text)
    if not inner:
        return ""
    return f"<p>{inner}</p>"


def _domain_of(url: str) -> str:
    m = re.match(r"^https?://([^/]+)", url.lower())
    return m.group(1) if m else url.lower()


def detect_source_type(url: str) -> str:
    domain = _domain_of(url)
    if "linkedin.com" in domain:
        return "linkedin"
    if domain.endswith(".gov.au") or domain.endswith(".gov.uk") or ".gov." in domain:
        return "government"
    if "wikipedia.org" in domain:
        return "other"
    press_domains = {"pressreleases.responsesource.com", "newshub.medianet.com.au", "via.ritzau.dk"}
    if domain in press_domains:
        return "press_release"
    company_domains = {
        "treasury.gov.au",  # caught above
        "newsroom.wise.com", "wise.com",
        "www.darktrace.com", "darktrace.com",
        "www.thoughtmachine.net", "thoughtmachine.net",
        "www.featurespace.com", "featurespace.com",
        "complyadvantage.com",
        "blog.voveid.com",
        "www.infosys.com", "infosys.com",
        "dext.com",
        "www.nplan.io", "nplan.io",
        "info.daxtra.com", "www.daxtra.com", "daxtra.com",
        "anna.money",
        "tractable.ai",
        "corporate.deliveroo.co.uk",
        "www.nccgroup.com", "nccgroup.com",
        "www.contino.io", "contino.io",
        "www.sensat.co", "sensat.co",
    }
    if domain in company_domains:
        return "company_blog"
    if "podcast" in url.lower():
        return "podcast"
    return "news"


def parse_references(md: str) -> dict[int, dict[str, Any]]:
    """Parse the References section at the bottom of the doc.

    Returns {citation_number: {"label": ..., "url": ..., "source_type": ...}}.
    """
    refs: dict[int, dict[str, Any]] = {}
    # Each line: [^N]: URL — Title  (em-dash) or [^N]: URL - Title (hyphen)
    pattern = re.compile(r"^\[\^(\d+)\]:\s*(\S+)\s+(?:[—\-–])\s*(.+)$", re.M)
    for m in pattern.finditer(md):
        n = int(m.group(1))
        url = m.group(2).strip()
        label = m.group(3).strip()
        refs[n] = {
            "citation_number": n,
            "url": url,
            "label": label,
            "source_type": detect_source_type(url),
        }
    return refs


def split_cases(md: str) -> list[tuple[int, str]]:
    """Split the doc on `## Case Study N:` headers; return [(N, body)]."""
    case_re = re.compile(r"^## Case Study (\d+):.*?$", re.M)
    matches = list(case_re.finditer(md))
    cases: list[tuple[int, str]] = []
    for i, m in enumerate(matches):
        n = int(m.group(1))
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(md)
        cases.append((n, md[start:end]))
    return cases


def block_text(case_md: str, heading: str) -> str | None:
    """Return the raw text under a `### {heading}` block, until the next ### or ***."""
    pattern = re.compile(
        rf"^###\s+{re.escape(heading)}\s*\n(.+?)(?=^###\s|^\*\*\*|^## |\Z)",
        re.S | re.M,
    )
    m = pattern.search(case_md)
    return m.group(1).strip() if m else None


def extract_field(case_md: str, field: str) -> str | None:
    """Pull a `**Field:** value` line."""
    m = re.search(rf"^\*\*{re.escape(field)}:\*\*\s*(.+)$", case_md, re.M)
    return m.group(1).strip() if m else None


def collect_citations(text: str) -> list[int]:
    return [int(n) for n in FOOTNOTE_RE.findall(text)]


def split_paragraphs(text: str) -> list[str]:
    return [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]


def render_phase_paragraphs(text: str) -> list[str]:
    """Convert an Entry Journey block into HTML paragraphs.

    Each phase looks like:
      **2019 – The Quiet Start:** Body sentence(s)...

    We render each phase as a single <p> with the bolded phase tag preserved.
    Free-standing paragraphs (no leading **) are rendered as plain <p>.
    """
    paragraphs = []
    for chunk in split_paragraphs(text):
        rendered = html_paragraph(chunk)
        if rendered:
            paragraphs.append(rendered)
    return paragraphs


def render_outcomes_table(text: str) -> list[str]:
    """Convert a Markdown pipe table into one bullet list (<ul><li>) HTML block.

    Each table row becomes <li><strong>{Metric}</strong>: {Detail}</li>.
    Header row and divider row are dropped.
    """
    rows = [r.strip() for r in text.splitlines() if r.strip().startswith("|")]
    body_rows: list[tuple[str, str]] = []
    for r in rows:
        cells = [c.strip() for c in r.strip("|").split("|")]
        if len(cells) < 2:
            continue
        # Skip alignment row.
        if all(set(c).issubset(set("-: ")) for c in cells):
            continue
        # Skip header row.
        if cells[0].lower() in ("metric", "lesson"):
            continue
        body_rows.append((cells[0], " — ".join(cells[1:])))
    if not body_rows:
        return []
    items_html = "".join(
        f"<li><strong>{md_inline(metric)}</strong>: {md_inline(detail)}</li>"
        for metric, detail in body_rows
    )
    return [f"<ul>{items_html}</ul>"]


def render_copy_table(text: str) -> list[str]:
    """Convert a What You Can Copy table → bullet list of lessons.

    Table columns: Lesson | What X Did | How to Apply It
    Output: <li><strong>{Lesson}</strong> — {Apply}. <em>{What did}</em></li>
    Falls back to two-column rendering if only two columns are present.
    """
    rows = [r.strip() for r in text.splitlines() if r.strip().startswith("|")]
    body_rows: list[list[str]] = []
    for r in rows:
        cells = [c.strip() for c in r.strip("|").split("|")]
        if all(set(c).issubset(set("-: ")) for c in cells):
            continue
        if cells and cells[0].lower() == "lesson":
            continue
        body_rows.append(cells)
    if not body_rows:
        return []
    items: list[str] = []
    for cells in body_rows:
        if len(cells) >= 3:
            lesson, did, apply = cells[0], cells[1], cells[2]
            # Strip inline ** so wrapping the whole lesson in <strong> doesn't nest tags.
            lesson_plain = strip_footnotes(BOLD_RE.sub(r"\1", lesson))
            items.append(
                f"<li><strong>{lesson_plain}</strong> — {md_inline(apply)} "
                f"<em>({md_inline(did)})</em></li>"
            )
        elif len(cells) == 2:
            lesson_plain = strip_footnotes(BOLD_RE.sub(r"\1", cells[0]))
            items.append(f"<li><strong>{lesson_plain}</strong> — {md_inline(cells[1])}</li>")
    if not items:
        return []
    return [f"<ul>{''.join(items)}</ul>"]


def parse_mes_tags(case_md: str) -> list[str]:
    line = extract_field(case_md, "MES Tags")
    if not line:
        return []
    return [t.strip() for t in line.split("|") if t.strip()]


def quick_facts_for(case_n: int, company_name: str) -> list[dict[str, str]]:
    industry = INDUSTRY_BY_NUMBER[case_n]
    return [
        {"icon": "MapPin", "label": "HQ", "value": "United Kingdom"},
        {"icon": "Briefcase", "label": "Sector", "value": industry},
        {"icon": "Globe", "label": "Target Market", "value": "Australia & New Zealand"},
    ]


def estimate_read_time(sections: list[dict[str, Any]]) -> int:
    word_count = 0
    for s in sections:
        for body in s["bodies"]:
            stripped = re.sub(r"<[^>]+>", " ", body)
            word_count += len(stripped.split())
    return max(2, round(word_count / 200))


def parse_case(case_n: int, case_md: str, refs: dict[int, dict[str, Any]]) -> dict[str, Any]:
    company = COMPANY_NAMES[case_n]
    slug = SLUG_BY_NUMBER[case_n]
    title = f"How {company} Entered the ANZ Market"

    tagline = extract_field(case_md, "Tagline") or ""
    tagline = strip_footnotes(tagline).rstrip(".") + ("." if tagline and not tagline.endswith(".") else "")
    tagline = tagline.strip()

    overview_text = block_text(case_md, "Company Overview") or ""
    why_anz_text = block_text(case_md, "Why ANZ?") or ""
    journey_text = block_text(case_md, "The Entry Journey") or ""
    outcomes_text = (
        block_text(case_md, "Key Outcomes")
        or block_text(case_md, "Key Outcomes and Lessons")
        or ""
    )
    copy_text = (
        block_text(case_md, "What You Can Copy")
        or block_text(case_md, "What You Can Copy (and Avoid)")
        or ""
    )

    # ---- Sections ----
    entry_paras: list[str] = []
    for chunk in [overview_text, why_anz_text, journey_text]:
        if chunk:
            entry_paras.extend(render_phase_paragraphs(chunk))

    success_paras = render_copy_table(copy_text)
    metrics_paras = render_outcomes_table(outcomes_text)
    lessons_paras: list[str] = []
    if copy_text:
        # Lessons = a narrative summary line + the same Copy bullets if no other prose available.
        intro = (
            f"<p>For UK operators considering ANZ entry, {company}'s playbook offers a clear "
            f"template. The lessons below are drawn from {company}'s entry decisions, partner "
            f"choices, and milestones in Australia &amp; New Zealand.</p>"
        )
        lessons_paras = [intro] + render_copy_table(copy_text)

    sections = [
        {"title": "Entry Strategy", "slug": "entry-strategy", "bodies": entry_paras},
        {"title": "Success Factors", "slug": "success-factors", "bodies": success_paras},
        {"title": "Key Metrics & Performance", "slug": "key-metrics", "bodies": metrics_paras},
        {"title": "Lessons Learned", "slug": "lessons-learned", "bodies": lessons_paras},
    ]
    # Drop sections whose bodies are empty (defensive).
    sections = [s for s in sections if s["bodies"]]

    # ---- Sources ----
    cited_numbers: set[int] = set()
    for chunk in [overview_text, why_anz_text, journey_text, outcomes_text, copy_text]:
        cited_numbers.update(collect_citations(chunk))
    sources: list[dict[str, Any]] = []
    for n in sorted(cited_numbers):
        if n in refs:
            sources.append(refs[n])

    # ---- TLDR ----
    tldr: list[str] = []
    if tagline:
        tldr.append(tagline)
    # Pull the first sentence of Why ANZ as supporting bullet.
    if why_anz_text:
        first_sentence = re.split(r"(?<=[.!?])\s+", strip_footnotes(why_anz_text))[0]
        if first_sentence and first_sentence != tagline:
            tldr.append(first_sentence)
    # And the first sentence of Company Overview as third bullet.
    if overview_text:
        first_sentence = re.split(r"(?<=[.!?])\s+", strip_footnotes(overview_text))[0]
        if first_sentence and first_sentence not in tldr:
            tldr.append(first_sentence)

    return {
        "slug": slug,
        "title": title,
        "subtitle": tagline or None,
        "category": CATEGORY_BY_NUMBER[case_n],
        "company_name": company,
        "origin_country": "United Kingdom",
        "target_market": "Australia & New Zealand",
        "industry": INDUSTRY_BY_NUMBER[case_n],
        "tagline": tagline,
        "founders": FOUNDERS_BY_NUMBER.get(case_n, []),
        "tldr": tldr,
        "quick_facts": quick_facts_for(case_n, company),
        "sections": sections,
        "sources": sources,
        "read_time": estimate_read_time(sections),
        "status": "published",
        "mes_tags": parse_mes_tags(case_md),
    }


def main() -> None:
    md = INPUT_PATH.read_text(encoding="utf-8")
    refs = parse_references(md)
    cases = split_cases(md)
    parsed = [parse_case(n, body, refs) for n, body in cases]
    OUTPUT_PATH.write_text(
        json.dumps(parsed, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Parsed {len(parsed)} enriched UK case studies → {OUTPUT_PATH}")
    print(f"References resolved: {len(refs)}")
    for c in parsed:
        section_summary = ", ".join(f"{s['slug']}({len(s['bodies'])})" for s in c["sections"])
        print(
            f"  {c['slug']:42s} sections=[{section_summary}] "
            f"sources={len(c['sources'])} founders={len(c['founders'])} "
            f"read_time={c['read_time']}"
        )


if __name__ == "__main__":
    main()
