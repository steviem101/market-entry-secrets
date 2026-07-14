#!/usr/bin/env python3
"""MES-178: transform the 65-case-study CSV into idempotent SQL draft inserts.

Reads mes_case_studies_batch_65.csv (columns: title, suggested_slug, status,
body_markdown, sources_markdown, notion_page_url) and emits:

  out/import_batch.sql   -- one idempotent multi-CTE INSERT per case study
  out/review.md          -- imported/skipped listing for editorial review

Model mapping (verified against prod schema + src/hooks/useCaseStudies.ts and
src/components/detail/ContentBodyRenderer.tsx on 2026-07-14):

  content_items            one row per case study, status='draft',
                           content_type='case_study' (public RLS read is
                           status='published' only, so drafts stay hidden)
  content_sections         one row per markdown H1/H2 heading
  content_bodies           body_text is rendered as sanitised HTML by
                           ContentBodyRenderer, so markdown is converted to
                           HTML here; the original markdown chunk is kept in
                           body_markdown for provenance. Intro content before
                           the first heading becomes "general" bodies
                           (section_id NULL).
  content_company_profiles company_name / origin_country / industry /
                           entry_date / outcome parsed from each draft's
                           quick-facts table (+ the hand map below).

sources_markdown is editorial-only per the ticket and is NOT written to the
database (case_study_sources is publicly readable); it stays in the CSV in
this directory for the editorial pass.

Duplicates: the live table already holds case studies for 21 of the 65
companies (the batch was deduped against a partial ~26-slug list). Those rows
are skipped and listed in review.md; see SKIP_EXISTING below.
"""

from __future__ import annotations

import csv
import html
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
CSV_PATH = HERE / "mes_case_studies_batch_65.csv"
OUT_DIR = HERE / "out"

# Live content_categories ids (queried 2026-07-14). The site uses
# "Technology Market Entry" as the generic inbound-entry category (retail
# failures like Starbucks/Masters sit there too), "Fintech Success" for all
# fintech stories including failures (Volt, Laybuy), and "Australian Startup
# Success" for domestic launches.
CAT_TECH_MARKET_ENTRY = "6a837ef6-c7b5-457c-8069-2b8da9c85716"
CAT_FINTECH = "0563b826-2123-4627-b912-14f63e9fbfb6"
CAT_AU_STARTUP = "e1b408ed-bf02-4b29-b63b-a9a417616513"

# suggested_slug -> existing live slug that already covers the same company
# story (company-level duplicate; new draft NOT imported).
SKIP_EXISTING: dict[str, str] = {
    "how-airbnb-scaled-australia-from-sydney-hub-to-mainstream-travel": "airbnb-australia-market-entry",
    "how-stripe-entered-australia-through-platforms-not-sales-teams": "stripe-australia-fintech-expansion",
    "how-masters-lowes-lost-billions-challenging-bunnings": "masters-australia-market-entry",
    "how-kaufland-abandoned-australia-before-opening-a-single-store": "kaufland-australia-market-entry",
    "how-starbucks-misread-australias-coffee-culture-and-closed-61-stores": "starbucks-australia-market-entry",
    "how-topshops-australian-franchise-collapsed-under-its-own-economics": "topshop-australia-market-entry",
    "how-ola-won-australian-drivers-but-never-won-the-riders": "ola-australia-market-entry",
    "how-canva-launched-globally-from-sydney-with-a-50-000-person-waitlist": "canva-australian-design-dominance",
    "how-afterpay-invented-buy-now-pay-later-from-its-australian-home-market": "afterpay-buy-now-pay-later-revolution",
    "how-netflix-localised-its-way-to-australian-streaming-dominance": "netflix-streaming-australia-launch",
    "how-aws-built-australias-cloud-market-around-a-sydney-region": "aws-australia-market-entry",
    "how-amazon-recovered-from-an-underwhelming-australian-launch": "amazon-australia-ecommerce-entry",
    "how-wise-undercut-australias-big-four-banks-on-fx-transparency": "wise-anz-market-entry",
    "how-secretlab-sold-australia-gaming-chairs-without-a-single-store": "secretlab-anz-market-entry",
    "how-shopback-used-cashback-to-break-into-australian-loyalty": "shopback-anz-market-entry",
    "how-binances-growth-first-australian-entry-ended-in-regulatory-retreat": "binance-australia-derivatives-market-entry",
    "how-tesla-used-the-worlds-biggest-battery-to-cement-its-australian-entry": "tesla-australia-market-entry",
    "how-weworks-australian-business-outlived-its-parents-bankruptcy": "wework-australia-market-entry",
    "how-slack-spread-through-australian-workplaces-before-hiring-locally": "slack-australian-market-entry",
    "how-foodoras-australian-exit-left-a-gig-economy-legal-bill": "foodora-australia-market-entry",
    "how-employment-hero-won-australian-smes-before-expanding-abroad": "employment-hero-australia-startup",
}

# Near-match kept (imported) but worth an editorial look: the live
# "uber-carshare-australia-market-entry" covers Uber Carshare (ex Car Next
# Door), a different business line from Uber ride-hailing.
NEAR_MATCH_NOTES = {
    "how-uber-outran-australian-regulators-and-legalised-ride-sharing":
        "Existing uber-carshare-australia-market-entry covers Uber Carshare only — different story, kept.",
}

# company_name for rows whose quick-facts table lacks a "Company" row,
# plus origin fallbacks where the table lacks Origin/Origin country.
COMPANY_MAP: dict[str, tuple[str, str | None]] = {
    # slug -> (company_name, origin_country fallback or None)
    "how-uniqlo-tested-australia-with-a-pop-up-before-its-flagship-bet": ("Uniqlo", None),
    "how-ing-built-australias-biggest-branchless-bank-from-one-savings-product": ("ING", None),
    "how-zara-turned-day-one-sydney-queues-into-a-national-foothold": ("Zara", None),
    "how-aldi-cracked-australias-grocery-duopoly-with-a-no-frills-playbook": ("Aldi", None),
    "how-costco-pre-sold-australia-on-the-membership-warehouse-model": ("Costco", None),
    "how-byd-rode-a-local-distributor-into-australias-top-car-brands": ("BYD", None),
    "how-purplebricks-flat-fee-failed-australias-no-sale-no-fee-culture": ("Purplebricks", None),
    "how-krispy-kreme-over-expanded-its-way-into-administration-in-australia": ("Krispy Kreme", None),
    "how-guzman-y-gomez-filled-australias-mexican-fast-food-gap-and-hit-the-asx": ("Guzman y Gomez", None),
    "how-xinja-grew-deposits-it-couldnt-afford-and-handed-back-its-banking-licence": ("Xinja", None),
    "how-koala-won-australian-mattresses-with-four-hour-delivery-and-a-120-night-trial": ("Koala", None),
    "how-spotify-converted-australias-music-pirates-into-paying-subscribers": ("Spotify", None),
    "how-uber-outran-australian-regulators-and-legalised-ride-sharing": ("Uber", None),
    "how-quickflix-lost-its-home-market-when-netflix-arrived": ("Quickflix", None),
    "how-klarna-entered-afterpays-home-turf-with-a-big-bank-alliance": ("Klarna", None),
    "how-ocado-entered-australia-as-a-technology-partner-not-a-retailer": ("Ocado", "United Kingdom"),
    "how-lightspeed-acquired-its-way-into-australian-hospitality-pos": ("Lightspeed", "Canada"),
    "how-starlings-engine-entered-australia-selling-bank-tech-not-banking": ("Engine by Starling", "United Kingdom"),
    "how-sharesies-took-kiwi-micro-investing-across-the-tasman": ("Sharesies", "New Zealand"),
    "how-serko-won-australian-corporate-travel-before-going-global": ("Serko", "New Zealand"),
    "how-ovo-energy-pivoted-from-licensing-to-owning-its-australian-entry": ("OVO Energy", "United Kingdom"),
    "how-shopify-won-australian-merchants-with-partner-led-growth": ("Shopify", "Canada"),
    "how-circles-life-attacked-australian-telco-pricing-as-a-digital-mvno": ("Circles.Life", "Singapore"),
    "how-japan-posts-toll-takeover-became-a-multi-billion-dollar-write-down": ("Japan Post", "Japan"),
    "how-singtel-bought-optus-to-enter-australia-at-full-scale": ("Singtel", "Singapore"),
    "how-minor-international-bought-oaks-hotels-to-enter-australia-overnight": ("Minor International", "Thailand"),
    "how-kia-used-local-tuning-and-a-seven-year-warranty-to-crack-australia": ("Kia", "South Korea"),
    "how-daiso-translated-japans-fixed-price-retail-model-for-australia": ("Daiso", "Japan"),
    "how-hellofresh-built-australias-meal-kit-category-from-scratch": ("HelloFresh", "Germany"),
    "how-doordash-made-a-late-entry-work-in-australian-food-delivery": ("DoorDash", "United States"),
    "how-didi-tested-geelong-before-undercutting-uber-across-australia": ("DiDi", "China"),
    "how-bolt-took-a-second-run-at-australias-ride-hailing-duopoly": ("Bolt", "Estonia"),
    "how-fujitsu-rebuilt-its-australian-business-through-serial-acquisition": ("Fujitsu", "Japan"),
    "how-agoda-carved-out-an-australian-niche-in-asia-bound-travel": ("Agoda", "Thailand"),
    "how-rakuten-kobo-rode-bookseller-partnerships-into-australian-e-reading": ("Rakuten Kobo", "Japan"),
    "how-nec-anchored-its-australian-entry-in-government-contracts": ("NEC", "Japan"),
    "how-monday-com-scaled-australia-remotely-before-landing-onshore": ("monday.com", "Israel"),
    "how-zendesk-made-melbourne-its-asia-pacific-launchpad": ("Zendesk", "United States"),
    "how-hubspot-grew-australia-using-its-own-inbound-playbook": ("HubSpot", "United States"),
    "how-intercom-served-australia-product-first-presence-later": ("Intercom", "Ireland"),
    "how-intuit-quickbooks-took-the-fight-to-xero-in-australia": ("Intuit QuickBooks", "United States"),
    "how-rippling-localised-payroll-to-enter-compliance-heavy-australia": ("Rippling", "United States"),
    "how-zoho-played-the-long-game-in-australia-with-local-data-centres": ("Zoho", "India"),
    "how-freshworks-undercut-enterprise-incumbents-to-win-australian-smbs": ("Freshworks", "India"),
}

# Fintech stories follow the live convention of sitting in "Fintech Success"
# (Volt Bank and Laybuy failures live there too); AU domestic launches sit in
# "Australian Startup Success"; everything else in "Technology Market Entry".
CATEGORY_OVERRIDES: dict[str, str] = {
    "how-ing-built-australias-biggest-branchless-bank-from-one-savings-product": CAT_FINTECH,
    "how-xinja-grew-deposits-it-couldnt-afford-and-handed-back-its-banking-licence": CAT_FINTECH,
    "how-klarna-entered-afterpays-home-turf-with-a-big-bank-alliance": CAT_FINTECH,
    "how-sharesies-took-kiwi-micro-investing-across-the-tasman": CAT_FINTECH,
    "how-starlings-engine-entered-australia-selling-bank-tech-not-banking": CAT_FINTECH,
    "how-quickflix-lost-its-home-market-when-netflix-arrived": CAT_AU_STARTUP,
    "how-guzman-y-gomez-filled-australias-mexican-fast-food-gap-and-hit-the-asx": CAT_AU_STARTUP,
    "how-koala-won-australian-mattresses-with-four-hour-delivery-and-a-120-night-trial": CAT_AU_STARTUP,
}


def sql_str(value: str | None) -> str:
    if value is None:
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


def slugify(text: str) -> str:
    text = re.sub(r"&", " and ", text.lower())
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def unescape_md(text: str) -> str:
    """Drop markdown backslash escapes (\\$, \\~, \\% ...)."""
    return re.sub(r"\\([$~%&#*_\[\]().+-])", r"\1", text)


def inline_md_to_html(text: str) -> str:
    text = html.escape(unescape_md(text), quote=False)
    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r'<a href="\2">\1</a>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<em>\1</em>", text)
    return text


def md_block_to_html(md: str) -> str:
    """Minimal markdown -> HTML for the constructs used in this batch:
    paragraphs, -/* bullet lists, numbered lists, bold/italic/links, and
    passthrough of raw HTML blocks (the quick-facts <table>)."""
    lines = md.split("\n")
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if not stripped:
            i += 1
            continue
        if stripped.startswith("<"):
            block = []
            while i < len(lines) and lines[i].strip():
                block.append(lines[i])
                i += 1
            out.append(unescape_md("\n".join(block)))
            continue
        if re.match(r"^[-*] ", stripped):
            items = []
            while i < len(lines) and re.match(r"^[-*] ", lines[i].strip()):
                items.append(f"<li>{inline_md_to_html(lines[i].strip()[2:])}</li>")
                i += 1
            out.append("<ul>\n" + "\n".join(items) + "\n</ul>")
            continue
        if re.match(r"^\d+\. ", stripped):
            items = []
            while i < len(lines) and re.match(r"^\d+\. ", lines[i].strip()):
                item_text = re.sub(r"^\d+\. ", "", lines[i].strip())
                items.append(f"<li>{inline_md_to_html(item_text)}</li>")
                i += 1
            out.append("<ol>\n" + "\n".join(items) + "\n</ol>")
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(
            r"^([-*] |\d+\. |<)", lines[i].strip()
        ):
            para.append(lines[i].strip())
            i += 1
        out.append(f"<p>{inline_md_to_html(' '.join(para))}</p>")
    return "\n".join(out)


def split_sections(md: str) -> tuple[str, list[tuple[str, str]]]:
    """Return (intro_md, [(heading, section_md), ...]) splitting on H1/H2."""
    parts = re.split(r"^#{1,2} (.+)$", md, flags=re.M)
    intro = parts[0].strip()
    sections = []
    for j in range(1, len(parts), 2):
        sections.append((parts[j].strip(), parts[j + 1].strip()))
    return intro, sections


def table_value(md: str, *labels: str) -> str | None:
    for label in labels:
        m = re.search(
            rf"<td>{re.escape(label)}</td>\s*<td>(.*?)</td>", md, re.S
        )
        if m:
            value = re.sub(r"<[^>]+>", "", m.group(1))
            value = unescape_md(value).strip()
            # De-markdown link syntax e.g. [Booking.com](http://Booking.com)
            value = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", value)
            if value:
                return value
    return None


def normalise_country(raw: str | None) -> str | None:
    if not raw:
        return None
    value = re.sub(r"\(.*?\)", "", raw)
    # Drop qualifiers after ";" / "—" (e.g. "Denmark; HQ San Francisco")
    value = re.split(r"[;—]", value)[0].strip().rstrip(",;")
    aliases = {
        "US": "United States",
        "USA": "United States",
        "UK": "United Kingdom",
        "South Korea (Republic of Korea)": "South Korea",
    }
    value = aliases.get(value, value)
    # "United States / Ireland" -> keep first for flag/filter consistency
    if "/" in value:
        value = value.split("/")[0].strip()
        value = aliases.get(value, value)
    return value or None


def outcome_value(raw: str | None) -> str | None:
    if not raw:
        return None
    low = raw.lower()
    if low.startswith(("success", "strong success")):
        return "successful"
    if low.startswith(("failure", "regulatory failure")):
        return "unsuccessful"
    return None  # Mixed / Ongoing -> no badge


def entry_year(raw: str | None) -> str | None:
    if not raw:
        return None
    m = re.search(r"(19|20)\d{2}", raw)
    return m.group(0) if m else None


def meta_description(intro_md: str) -> str | None:
    text = re.sub(r"<[^>]+>", " ", intro_md)
    text = unescape_md(text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return None
    first_para = text
    if len(first_para) <= 160:
        return first_para
    cut = first_para[:157]
    cut = cut[: cut.rfind(" ")] if " " in cut else cut
    return cut + "…"


def build_statement(row: dict) -> str:
    slug = row["suggested_slug"]
    body_md = row["body_markdown"].replace("\r\n", "\n")
    intro_md, sections = split_sections(body_md)

    company, origin_fallback = COMPANY_MAP.get(slug, (None, None))
    if not company:
        # Fallback: table "Company" value, stripped of qualifiers like
        # "(UK)" or ", formerly Lightspeed POS".
        raw_company = table_value(body_md, "Company")
        if raw_company:
            company = re.sub(r"\s*\(.*?\)", "", raw_company)
            company = re.split(r",\s*formerly\b|\s+—\s+", company)[0].strip()
    origin = normalise_country(
        table_value(body_md, "Origin country", "Origin")
    ) or origin_fallback
    industry = table_value(body_md, "Sector")
    entry = entry_year(table_value(body_md, "Entry year", "Key period"))
    outcome = outcome_value(table_value(body_md, "Outcome"))
    category = CATEGORY_OVERRIDES.get(slug, CAT_TECH_MARKET_ENTRY)

    words = len(re.findall(r"\w+", body_md))
    read_time = max(2, round(words / 200))

    # sections with de-duplicated slugs
    section_rows = []
    used = set()
    for order, (heading, section_md) in enumerate(sections, start=1):
        s_slug = slugify(unescape_md(heading)) or f"section-{order}"
        base = s_slug
        n = 2
        while s_slug in used:
            s_slug = f"{base}-{n}"
            n += 1
        used.add(s_slug)
        section_rows.append((unescape_md(heading), s_slug, order, section_md))

    sec_values = ",\n      ".join(
        f"({sql_str(t)}, {sql_str(s)}, {o})" for t, s, o, _ in section_rows
    )
    body_values = ",\n      ".join(
        f"({sql_str(s)}, {sql_str(md_block_to_html(md))}, {sql_str(md)}, {o})"
        for _, s, o, md in section_rows
    )

    stmt = f"""-- {slug}
WITH item AS (
  INSERT INTO public.content_items
    (slug, title, status, content_type, category_id, meta_description, read_time, publish_date, view_count)
  SELECT {sql_str(slug)}, {sql_str(row['title'])}, 'draft', 'case_study',
         {sql_str(category)}::uuid, {sql_str(meta_description(intro_md))}, {read_time}, NULL, 0
  WHERE NOT EXISTS (SELECT 1 FROM public.content_items WHERE slug = {sql_str(slug)})
  RETURNING id
),
intro AS (
  INSERT INTO public.content_bodies (content_id, body_text, body_markdown, sort_order, content_type)
  SELECT item.id, {sql_str(md_block_to_html(intro_md))}, {sql_str(intro_md)}, 0, 'case_study'
  FROM item
),
secs AS (
  INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active)
  SELECT item.id, v.title, v.slug, v.ord, true
  FROM item, (VALUES
      {sec_values}
  ) AS v(title, slug, ord)
  RETURNING id, content_id, slug
),
sec_bodies AS (
  INSERT INTO public.content_bodies (content_id, section_id, body_text, body_markdown, sort_order, content_type)
  SELECT s.content_id, s.id, v.html, v.md, v.ord, 'case_study'
  FROM secs s
  JOIN (VALUES
      {body_values}
  ) AS v(slug, html, md, ord) ON v.slug = s.slug
)
INSERT INTO public.content_company_profiles
  (content_id, company_name, origin_country, target_market, industry, entry_date, outcome)
SELECT item.id, {sql_str(company)}, {sql_str(origin)}, 'Australia',
       {sql_str(industry)}, {sql_str(entry)}, {sql_str(outcome)}
FROM item
WHERE {sql_str(company)} IS NOT NULL;"""
    return stmt


def main() -> None:
    csv.field_size_limit(10**9)
    with open(CSV_PATH) as f:
        rows = list(csv.DictReader(f))
    if len(rows) != 65:
        sys.exit(f"expected 65 rows, got {len(rows)}")

    OUT_DIR.mkdir(exist_ok=True)
    statements: list[str] = []
    imported: list[dict] = []
    skipped: list[tuple[str, str]] = []

    for row in rows:
        slug = row["suggested_slug"]
        if slug in SKIP_EXISTING:
            skipped.append((slug, SKIP_EXISTING[slug]))
            continue
        statements.append(build_statement(row))
        body_md = row["body_markdown"]
        imported.append(
            {
                "slug": slug,
                "title": row["title"],
                "company": COMPANY_MAP.get(slug, (None, None))[0]
                or table_value(body_md, "Company"),
                "origin": normalise_country(
                    table_value(body_md, "Origin country", "Origin")
                )
                or COMPANY_MAP.get(slug, (None, None))[1],
                "outcome": outcome_value(table_value(body_md, "Outcome")) or "mixed/none",
                "sections": len(split_sections(body_md)[1]),
                "notion": row["notion_page_url"],
            }
        )

    (OUT_DIR / "import_batch.sql").write_text("\n\n".join(statements) + "\n")

    lines = [
        "# MES-178 case-study import review",
        "",
        f"Source: `mes_case_studies_batch_65.csv` (65 drafts). Imported **{len(imported)}** as",
        f"`content_items` drafts (`status='draft'`, `content_type='case_study'`); skipped **{len(skipped)}**",
        "company-level duplicates already live in the catalogue.",
        "",
        "## Skipped (existing case study covers the same company story)",
        "",
        "| Batch slug (not imported) | Existing live slug |",
        "|---|---|",
    ]
    lines += [f"| `{s}` | `{e}` |" for s, e in skipped]
    lines += [
        "",
        "## Near matches (imported — editorial judgement call)",
        "",
    ]
    lines += [f"- `{s}` — {note}" for s, note in NEAR_MATCH_NOTES.items()]
    lines += [
        "",
        "## Imported drafts",
        "",
        "| Slug | Company | Origin | Outcome | Sections | Notion |",
        "|---|---|---|---|---|---|",
    ]
    lines += [
        f"| `{d['slug']}` | {d['company']} | {d['origin'] or '—'} | {d['outcome']} | {d['sections']} | [page]({d['notion']}) |"
        for d in imported
    ]
    lines += [
        "",
        "Sources for fact-checking stay in the CSV's `sources_markdown` column",
        "(editorial only — never published, not written to the database).",
        "",
    ]
    (OUT_DIR / "review.md").write_text("\n".join(lines))
    print(f"imported={len(imported)} skipped={len(skipped)}")
    print(f"sql bytes={len((OUT_DIR / 'import_batch.sql').read_text())}")


if __name__ == "__main__":
    main()
