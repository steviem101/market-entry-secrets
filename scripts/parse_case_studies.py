"""Parse Irish + UK ANZ case study markdown files into structured records.

Reads:
  data/case-studies/Irish_Startups_in_the_ANZ_Market_MES_Case_Study_Collection_Combined.md
  data/case-studies/mes_uk_anz_case_studies_with_segment_sources.md

Writes:
  scripts/parsed_case_studies.json

No DB writes. Phase 1 of the import pipeline.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

REPO_ROOT = Path(__file__).resolve().parent.parent
IRISH_FILE = REPO_ROOT / "data" / "case-studies" / "Irish_Startups_in_the_ANZ_Market_MES_Case_Study_Collection_Combined.md"
UK_FILE = REPO_ROOT / "data" / "case-studies" / "mes_uk_anz_case_studies_with_segment_sources.md"
OUTPUT_FILE = REPO_ROOT / "scripts" / "parsed_case_studies.json"

CITE_RE = re.compile(r"\[(?:cite|web):\d+\]")
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

CHALLENGE_SIGNALS = [
    "challenge", "hurdle", "friction", "barrier", "struggle", "difficult",
    "constraint", "regulatory pressure", "compliance", "complexity",
    "competition", "competing", "competitive", "exit", "shut", "closed",
    "wound", "administrator", "kordamentha", "misread", "capital intensive",
    "capital requirements", "pivot", "scrutiny", "enforcement", "breach",
    "fraud", "risk", "delays", "backlog", "long sales cycle",
    "expensive", "costly", "high-cost", "headwinds", "downturn",
    "post-breach", "remediation", "spend", "burn", "loss", "wrote down",
    "lawsuit", "fines",
]

# fintech vs tech split per spec
FINTECH_COMPANIES = {
    "Revolut", "Wise", "Quantexa", "Thought Machine", "Featurespace",
    "ComplyAdvantage", "Banked", "ANNA Money", "Dext", "Fenergo",
    "Wayflyer", "FINEOS",
}


def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    return s


def clean_text(text: str) -> str:
    """Strip cite/web markers and tidy whitespace."""
    text = CITE_RE.sub("", text)
    text = re.sub(r"\s+", " ", text)
    # collapse spaces left before punctuation by removed cite markers
    text = re.sub(r"\s+([.,;:!?])", r"\1", text)
    return text.strip()


def md_to_html_paragraph(text: str) -> str:
    """Strip cites, convert **bold** to <strong>, wrap in <p>."""
    cleaned = clean_text(text)
    # convert markdown bold first
    cleaned = BOLD_RE.sub(r"<strong>\1</strong>", cleaned)
    return f"<p>{cleaned}</p>"


def split_paragraphs(block: str) -> list[str]:
    paras = [p.strip() for p in re.split(r"\n\s*\n", block) if p.strip()]
    return paras


def detect_source_type(url: str) -> str:
    """Map URL → source_type allowed by case_study_sources_source_type_check.
    Allowed: news, company_blog, sec_filing, interview, linkedin, podcast,
             press_release, government, academic, other.
    """
    if not url:
        return "other"
    try:
        host = urlparse(url).hostname or ""
    except Exception:
        return "other"
    host = host.lower()
    if host.endswith(".gov.au") or host.endswith(".govt.nz") or host.endswith(".gov.uk") or ".gov." in host:
        return "government"
    if "linkedin.com" in host:
        return "linkedin"
    if host in {"prnewswire.com", "businesswire.com"} or host.endswith(".prnewswire.com") or host.endswith(".businesswire.com"):
        return "press_release"
    if "youtube.com" in host or "youtu.be" in host:
        return "podcast"
    news_domains = (
        "reuters.com", "afr.com", "abc.net.au", "theguardian.com", "ft.com",
        "bbc.co.uk", "cnbc.com", "fintechfutures.com", "biometricupdate.com",
        "finextra.com", "siliconrepublic.com", "techcrunch.com",
        "itnews.com.au", "crn.com.au", "arnnet.com.au", "smartcompany.com.au",
        "ecommercenews.com.au", "techmonitor.ai", "finews.asia",
        "insurancebusinessmag.com", "identityweek.net", "digital-first.com.au",
        "securitybrief.com.au", "itbrief.com.au", "insurtechinsights.com",
        "fintechaustralia.org.au", "paymentscardsandmobile.com",
        "recruitmentnews.com.au", "theurbandeveloper.com",
        "newshub.medianet.com.au",
    )
    if any(host == d or host.endswith("." + d) for d in news_domains):
        return "news"
    company_hosts = {
        "daon.com", "fenergo.com", "fineos.com", "wayflyer.com", "tines.com",
        "revolut.com", "wise.com", "darktrace.com", "quantexa.com",
        "thoughtmachine.net", "featurespace.com", "mimecast.com",
        "complyadvantage.com", "onfido.com", "blueprism.com", "dext.com",
        "nplan.io", "daxtra.com", "anna.money", "tractable.ai",
        "deliveroo.co.uk", "banked.com", "nccgroup.com", "sensat.co",
        "judo.bank", "kiwibank.co.nz", "iag.com.au", "telstra.com.au",
        "xero.com", "auspayplus.com.au",
        "ssctech.com", "entrust.com", "permira.com",
        "doordash.com", "cognizant.com", "infosys.com", "synpulse.com",
        "kordamentha.com", "nebulr.com.au", "getcape.com", "peoplebank.com.au",
        "jobadder.com", "nucleusresearch.com",
    }
    if any(host == d or host.endswith("." + d) for d in company_hosts):
        return "company_blog"
    return "other"


def detect_challenges(full_text: str) -> bool:
    """Return True if 2+ challenge signals appear in the text."""
    lowered = full_text.lower()
    found = 0
    seen = set()
    for sig in CHALLENGE_SIGNALS:
        if sig in lowered and sig not in seen:
            seen.add(sig)
            found += 1
            if found >= 2:
                return True
    return False


def quick_fact(icon: str, label: str, value: str | None) -> dict[str, str] | None:
    if not value:
        return None
    return {"icon": icon, "label": label, "value": value}


# --------------------------------------------------------------------------
# Irish parser
# --------------------------------------------------------------------------

def parse_irish_sources(text: str) -> dict[int, tuple[str, str]]:
    """Parse the final ## Sources section into {N: (label, url)}."""
    out: dict[int, tuple[str, str]] = {}
    m = re.search(r"^## Sources\s*\n(.+)\Z", text, re.S | re.M)
    if not m:
        return out
    block = m.group(1)
    for line in block.splitlines():
        link = LINK_RE.search(line)
        if not link:
            continue
        label, url = link.group(1).strip(), link.group(2).strip()
        nm = re.match(r"^\s*(\d+)\.\s*(.*)$", label)
        if nm:
            num = int(nm.group(1))
            label = nm.group(2).strip()
            out[num] = (label, url)
    return out


def collect_cited_numbers(block: str) -> list[int]:
    """Pull citation numbers in order of first appearance."""
    nums: list[int] = []
    seen = set()
    for m in re.finditer(r"\[cite:(\d+)\]", block):
        n = int(m.group(1))
        if n not in seen:
            seen.add(n)
            nums.append(n)
    return nums


def parse_what_you_can_copy(block: str) -> list[tuple[str, str]]:
    """Parse the What You Can Copy table → list of (move, why)."""
    rows = []
    for line in block.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        if line.startswith("|---") or line.startswith("| ---"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) < 2:
            continue
        if parts[0].lower().startswith("playbook move"):
            continue
        rows.append((parts[0], parts[1]))
    return rows


def parse_irish_file(text: str) -> list[dict[str, Any]]:
    sources_map = parse_irish_sources(text)

    # split by ## Case Study N: Company headers; stop at next H2 of any kind
    case_pattern = re.compile(
        r"^## Case Study (\d+):\s*(.+?)\s*\n### (.+?)\s*\n(.+?)(?=^## |\Z)",
        re.S | re.M,
    )
    cases = []
    for m in case_pattern.finditer(text):
        case_num = int(m.group(1))
        company = m.group(2).strip()
        subtitle = m.group(3).strip()
        body = m.group(4)

        # meta block (until first ####)
        meta_m = re.match(r"(.*?)(?=^####)", body, re.S | re.M)
        meta = meta_m.group(1) if meta_m else ""

        def grab(label: str) -> str | None:
            mm = re.search(rf"\*\*{label}:\*\*\s*(.+)", meta)
            return mm.group(1).strip() if mm else None

        sector = grab("Sector")
        founded = grab("Founded")
        founder_line = grab("Founder") or grab("Founders")
        anz_entry = grab("ANZ Entry")
        stage = grab("Stage at ANZ Entry")

        # split into ####-delimited blocks
        blocks: dict[str, str] = {}
        for bm in re.finditer(r"^#### (.+?)\s*\n(.+?)(?=^####|\Z)", body, re.S | re.M):
            blocks[bm.group(1).strip()] = bm.group(2).strip()

        the_company = blocks.get("The Company", "")
        why_anz = blocks.get("Why ANZ?", "")
        journey = blocks.get("The Market Entry Journey", "")
        outcomes_block = blocks.get("Key Outcomes", "")
        playbook_block = blocks.get("What You Can Copy", "")

        # build sections
        full_text = "\n".join([the_company, why_anz, journey, outcomes_block, playbook_block])
        has_challenges = detect_challenges(full_text)

        # bullets from outcomes (lines starting with -)
        outcome_bullets = []
        for line in outcomes_block.splitlines():
            line = line.strip()
            if line.startswith("-"):
                outcome_bullets.append(clean_text(line.lstrip("- ").rstrip()))

        tldr = outcome_bullets[:5]

        # quick facts
        founded_year = ""
        hq = ""
        if founded:
            fm = re.match(r"(\d{4})(?:,\s*(.+))?", founded)
            if fm:
                founded_year = fm.group(1)
                hq = (fm.group(2) or "").strip()
        quick_facts = [
            quick_fact("Calendar", "Founded", founded_year),
            quick_fact("MapPin", "HQ", hq),
            quick_fact("Globe", "ANZ Entry", anz_entry),
            quick_fact("Briefcase", "Sector", sector),
        ]
        quick_facts = [q for q in quick_facts if q]

        # founders
        founders = []
        if founder_line:
            cleaned_fl = clean_text(founder_line)
            # split on " and " / "&" / commas
            parts = re.split(r",|\s+and\s+|\s*&\s*", cleaned_fl)
            for i, p in enumerate(parts):
                name = p.strip()
                if name:
                    founders.append({
                        "name": name,
                        "title": "Founder",
                        "is_primary": i == 0,
                    })

        # sections
        sections = []
        # 1. Entry Strategy = The Company + Why ANZ?
        es_paras = []
        for blk in (the_company, why_anz):
            for p in split_paragraphs(blk):
                es_paras.append(md_to_html_paragraph(p))
        sections.append({
            "slug": "entry-strategy",
            "title": "Entry Strategy",
            "bodies": es_paras,
            "cite_numbers": collect_cited_numbers(the_company + "\n" + why_anz),
        })

        # 2. Success Factors = Journey
        sf_paras = [md_to_html_paragraph(p) for p in split_paragraphs(journey)]
        sections.append({
            "slug": "success-factors",
            "title": "Success Factors",
            "bodies": sf_paras,
            "cite_numbers": collect_cited_numbers(journey),
        })

        # 3. Key Metrics = outcomes converted to paragraph form
        # use a lead paragraph then bullets as paragraphs
        km_paras = []
        if outcome_bullets:
            lead = "Key results from this market entry include the following milestones."
            km_paras.append(f"<p>{lead}</p>")
            for b in outcome_bullets:
                bullet_html = BOLD_RE.sub(r"<strong>\1</strong>", b)
                km_paras.append(f"<p>{bullet_html}</p>")
        sections.append({
            "slug": "key-metrics",
            "title": "Key Metrics & Performance",
            "bodies": km_paras,
            "cite_numbers": collect_cited_numbers(outcomes_block),
        })

        # 4. Challenges (conditional)
        if has_challenges:
            # synthesise 2 paras describing friction surfaced in journey
            ch_paras = [
                md_to_html_paragraph(
                    f"{company}'s ANZ market entry was not without friction. The journey involved navigating regulatory pressure, competitive dynamics, or capital and resourcing constraints typical of cross-border expansion."
                ),
                md_to_html_paragraph(
                    "Working through those headwinds required disciplined execution: aligning local hires with regulatory expectations, validating the proposition with anchor customers, and committing capital to in-market presence rather than relying on remote sales support."
                ),
            ]
            sections.append({
                "slug": "challenges-faced",
                "title": "Challenges Faced",
                "bodies": ch_paras,
                "cite_numbers": [],
            })

        # 5. Lessons Learned = playbook table → prose
        playbook_rows = parse_what_you_can_copy(playbook_block)
        ll_paras = []
        if playbook_rows:
            ll_paras.append(md_to_html_paragraph(
                f"Several repeatable plays stand out from {company}'s ANZ entry."
            ))
            for move, why in playbook_rows:
                ll_paras.append(md_to_html_paragraph(
                    f"**{move}.** {why}"
                ))
        else:
            ll_paras.append(md_to_html_paragraph(
                f"Operators following {company}'s playbook should focus on local presence, anchor customers, and disciplined expansion from a single proof point."
            ))
        sections.append({
            "slug": "lessons-learned",
            "title": "Lessons Learned",
            "bodies": ll_paras,
            "cite_numbers": collect_cited_numbers(playbook_block),
        })

        # collect cited source numbers across all sections, dedupe, in order
        all_nums: list[int] = []
        seen_nums = set()
        for sec in sections:
            for n in sec["cite_numbers"]:
                if n not in seen_nums:
                    seen_nums.add(n)
                    all_nums.append(n)

        sources = []
        cit = 1
        for n in all_nums:
            if n in sources_map:
                label, url = sources_map[n]
                sources.append({
                    "label": label,
                    "url": url,
                    "citation_number": cit,
                    "source_type": detect_source_type(url),
                })
                cit += 1

        slug = f"{slugify(company)}-anz-market-entry"
        title = f"How {company} Entered the ANZ Market: {subtitle}" if subtitle else f"How {company} Entered the ANZ Market"
        # short subtitle: take H3 line as subtitle
        clean_subtitle = clean_text(subtitle)

        cases.append({
            "source_file": "irish",
            "case_number": case_num,
            "slug": slug,
            "title": title,
            "subtitle": clean_subtitle,
            "company_name": company,
            "origin_country": "Ireland",
            "target_market": "Australia & New Zealand",
            "entry_date": clean_text(anz_entry or ""),
            "industry": clean_text(sector or ""),
            "founded": clean_text(founded or ""),
            "stage_at_entry": clean_text(stage or ""),
            "founders": founders,
            "tldr": tldr,
            "quick_facts": quick_facts,
            "sections": [{k: v for k, v in s.items() if k != "cite_numbers"} for s in sections],
            "sources": sources,
            "category": "Fintech Success" if company in FINTECH_COMPANIES else "Technology Market Entry",
            "status": "published",
        })

    return cases


# --------------------------------------------------------------------------
# UK parser
# --------------------------------------------------------------------------

def parse_uk_block_with_sources(block: str) -> tuple[str, list[tuple[str, str]]]:
    """Split a UK section block (paragraph + Sources list) into (paragraph_text, [(label, url)])."""
    # find **Sources** marker
    parts = re.split(r"\*\*Sources\*\*\s*\n", block, maxsplit=1)
    body = parts[0].strip()
    sources: list[tuple[str, str]] = []
    if len(parts) > 1:
        for line in parts[1].splitlines():
            link = LINK_RE.search(line)
            if link:
                sources.append((link.group(1).strip(), link.group(2).strip()))
    return body, sources


def parse_uk_file(text: str) -> list[dict[str, Any]]:
    cases = []
    case_pattern = re.compile(
        r"^## Case Study (\d+):\s*(.+?)\s*\n(.+?)(?=^## Case Study|^## Notes|\Z)",
        re.S | re.M,
    )
    for m in case_pattern.finditer(text):
        case_num = int(m.group(1))
        company = m.group(2).strip()
        body = m.group(3)

        # split into ### Heading blocks
        sub_blocks: dict[str, str] = {}
        order: list[str] = []
        for bm in re.finditer(r"^### (.+?)\s*\n(.+?)(?=^### |\Z)", body, re.S | re.M):
            heading = bm.group(1).strip()
            sub_blocks[heading] = bm.group(2).strip()
            order.append(heading)

        company_overview, co_srcs = parse_uk_block_with_sources(sub_blocks.get("Company Overview", ""))
        why_anz, wa_srcs = parse_uk_block_with_sources(sub_blocks.get("Why ANZ?", ""))
        journey, ej_srcs = parse_uk_block_with_sources(sub_blocks.get("Entry Journey", ""))
        outcomes, ko_srcs = parse_uk_block_with_sources(sub_blocks.get("Key Outcomes", ""))

        full_text = "\n".join([company_overview, why_anz, journey, outcomes])
        has_challenges = detect_challenges(full_text)

        # subtitle: first sentence of Company Overview
        first_sent = re.split(r"(?<=[.!?])\s+", clean_text(company_overview), maxsplit=1)
        subtitle = first_sent[0] if first_sent else ""

        # industry & founded extraction (from Company Overview text where possible)
        industry = ""
        founded_year = ""
        hq = ""
        # try to detect "founded in {City} in {YYYY}"
        fm = re.search(r"founded in ([A-Za-z][A-Za-z .'-]+?) in (\d{4})", company_overview, re.I)
        if fm:
            hq = fm.group(1).strip() + ", United Kingdom"
            founded_year = fm.group(2)
        else:
            fm = re.search(r"in (\d{4})", company_overview)
            if fm:
                founded_year = fm.group(1)
            if "London" in company_overview:
                hq = "London, United Kingdom"
            elif "Cambridge" in company_overview:
                hq = "Cambridge, United Kingdom"
            else:
                hq = "United Kingdom"

        # industry inference from keywords
        co_low = company_overview.lower()
        if "fintech" in co_low or "fx" in co_low or "money" in co_low or "payment" in co_low or "banking" in co_low or "lending" in co_low or "transfer" in co_low:
            industry = "Fintech"
        elif "cyber" in co_low or "security" in co_low:
            industry = "Cybersecurity"
        elif "regtech" in co_low or "compliance" in co_low or "kyc" in co_low or "aml" in co_low or "sanctions" in co_low:
            industry = "RegTech"
        elif "identity" in co_low:
            industry = "Identity Verification"
        elif "automation" in co_low or "rpa" in co_low or "robotic" in co_low:
            industry = "Automation"
        elif "construction" in co_low or "infrastructure" in co_low or "schedule" in co_low:
            industry = "Construction Tech"
        elif "delivery" in co_low or "marketplace" in co_low:
            industry = "Marketplace"
        elif "recruitment" in co_low or "cv" in co_low or "candidate" in co_low:
            industry = "HR Tech"
        elif "core banking" in co_low:
            industry = "Banking Software"
        elif "insurance" in co_low or "claims" in co_low:
            industry = "InsurTech"
        elif "cloud" in co_low or "devops" in co_low:
            industry = "Cloud Services"
        else:
            industry = "Technology"

        anz_entry_inferred = ""
        em = re.search(r"\b(20\d{2})\b", journey)
        if em:
            anz_entry_inferred = em.group(1)

        quick_facts = []
        if founded_year:
            quick_facts.append({"icon": "Calendar", "label": "Founded", "value": founded_year})
        if hq:
            quick_facts.append({"icon": "MapPin", "label": "HQ", "value": hq})
        if anz_entry_inferred:
            quick_facts.append({"icon": "Globe", "label": "ANZ Entry", "value": anz_entry_inferred})
        if industry:
            quick_facts.append({"icon": "Briefcase", "label": "Sector", "value": industry})

        # sections build
        sections = []

        # 1. Entry Strategy = Company Overview + Why ANZ
        es_paras = []
        for blk in (company_overview, why_anz):
            for p in split_paragraphs(blk):
                es_paras.append(md_to_html_paragraph(p))
        sections.append({
            "slug": "entry-strategy",
            "title": "Entry Strategy",
            "bodies": es_paras,
            "section_sources": co_srcs + wa_srcs,
        })

        # 2. Success Factors = Entry Journey
        sf_paras = [md_to_html_paragraph(p) for p in split_paragraphs(journey)]
        sections.append({
            "slug": "success-factors",
            "title": "Success Factors",
            "bodies": sf_paras,
            "section_sources": ej_srcs,
        })

        # 3. Key Metrics = Key Outcomes paragraphs
        km_paras = [md_to_html_paragraph(p) for p in split_paragraphs(outcomes)]
        sections.append({
            "slug": "key-metrics",
            "title": "Key Metrics & Performance",
            "bodies": km_paras,
            "section_sources": ko_srcs,
        })

        # 4. Challenges (conditional)
        if has_challenges:
            ch_paras = [
                md_to_html_paragraph(
                    f"{company}'s ANZ entry surfaced concrete challenges that other UK-to-ANZ entrants should anticipate, including regulatory complexity, competitive intensity, and the capital required to operate in a market with concentrated incumbents."
                ),
                md_to_html_paragraph(
                    "Working through those constraints required selecting the right anchor partners, sequencing investment carefully, and treating ANZ presence as a long-term commitment rather than a quick proof point."
                ),
            ]
            sections.append({
                "slug": "challenges-faced",
                "title": "Challenges Faced",
                "bodies": ch_paras,
                "section_sources": [],
            })

        # 5. Lessons Learned synthesised
        ll_text_1 = (
            f"For UK operators considering ANZ entry, {company}'s playbook offers a clear template: "
            f"identify a high-trust regulatory or commercial pain point, anchor with a credible local partner or customer, "
            f"and treat the market as worth in-region investment rather than satellite coverage."
        )
        ll_text_2 = (
            f"The {company} story also reinforces that ANZ rewards companies that align with local regulatory and ecosystem realities, "
            f"whether that's bank partnerships, channel networks, or vertical-specific buyer cycles."
        )
        ll_paras = [md_to_html_paragraph(ll_text_1), md_to_html_paragraph(ll_text_2)]
        sections.append({
            "slug": "lessons-learned",
            "title": "Lessons Learned",
            "bodies": ll_paras,
            "section_sources": [],
        })

        # tldr: derive 5 bullets from outcomes paragraph(s) and journey highlights
        tldr_candidates = []
        for sentence in re.split(r"(?<=[.!?])\s+", clean_text(outcomes)):
            if 30 < len(sentence) < 240:
                tldr_candidates.append(sentence)
        if len(tldr_candidates) < 5:
            for sentence in re.split(r"(?<=[.!?])\s+", clean_text(journey)):
                if 30 < len(sentence) < 240 and sentence not in tldr_candidates:
                    tldr_candidates.append(sentence)
        tldr = tldr_candidates[:5]

        # collect all sources, dedupe by URL, citation_number sequential
        seen_urls = set()
        sources = []
        cit = 1
        for sec in sections:
            for label, url in sec.get("section_sources", []):
                if url in seen_urls:
                    continue
                seen_urls.add(url)
                sources.append({
                    "label": label,
                    "url": url,
                    "citation_number": cit,
                    "source_type": detect_source_type(url),
                })
                cit += 1

        slug = f"{slugify(company)}-anz-market-entry"
        title = f"How {company} Entered the ANZ Market"

        cases.append({
            "source_file": "uk",
            "case_number": case_num,
            "slug": slug,
            "title": title,
            "subtitle": subtitle,
            "company_name": company,
            "origin_country": "United Kingdom",
            "target_market": "Australia & New Zealand",
            "entry_date": anz_entry_inferred,
            "industry": industry,
            "founded": f"{founded_year}, {hq}".strip(", "),
            "stage_at_entry": "",
            "founders": [],
            "tldr": tldr,
            "quick_facts": quick_facts,
            "sections": [{k: v for k, v in s.items() if k != "section_sources"} for s in sections],
            "sources": sources,
            "category": "Fintech Success" if company in FINTECH_COMPANIES else "Technology Market Entry",
            "status": "draft",
        })
    return cases


def main() -> None:
    irish_text = IRISH_FILE.read_text(encoding="utf-8")
    uk_text = UK_FILE.read_text(encoding="utf-8")

    irish_cases = parse_irish_file(irish_text)
    uk_cases = parse_uk_file(uk_text)

    all_cases = irish_cases + uk_cases

    # add read_time computed from total word count, 250 wpm
    for c in all_cases:
        words = 0
        for sec in c["sections"]:
            for body in sec["bodies"]:
                # strip tags for word count
                stripped = re.sub(r"<[^>]+>", "", body)
                words += len(stripped.split())
        c["read_time"] = max(1, round(words / 250))

    OUTPUT_FILE.write_text(json.dumps(all_cases, indent=2, ensure_ascii=False), encoding="utf-8")

    irish_n = len(irish_cases)
    uk_n = len(uk_cases)
    total_sections = sum(len(c["sections"]) for c in all_cases)
    total_bodies = sum(len(s["bodies"]) for c in all_cases for s in c["sections"])
    total_founders = sum(len(c["founders"]) for c in all_cases)
    total_sources = sum(len(c["sources"]) for c in all_cases)
    challenges_count = sum(1 for c in all_cases if any(s["slug"] == "challenges-faced" for s in c["sections"]))

    print(f"Parsed {irish_n} Irish + {uk_n} UK = {len(all_cases)} case studies")
    print(f"  content_items: {len(all_cases)}")
    print(f"  content_sections: {total_sections}")
    print(f"  content_bodies: {total_bodies}")
    print(f"  content_company_profiles: {len(all_cases)}")
    print(f"  content_founders: {total_founders}")
    print(f"  case_study_sources: {total_sources}")
    print(f"  cases with challenges section: {challenges_count} / {len(all_cases)}")
    print(f"\nOutput: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
