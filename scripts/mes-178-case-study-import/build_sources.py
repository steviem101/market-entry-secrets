#!/usr/bin/env python3
"""MES-178 follow-up (audit W2): STAGED sources_markdown -> case_study_sources
conversion for the 9 enriched live case studies.

The enrichment left the 2 fills (Netflix, Afterpay) with zero citations and the
7 replaces carrying citations authored for their older text. This script turns
each draft's `sources_markdown` into `case_study_sources` rows so the citations
match the new bodies. It is STAGED — it writes SQL + a review doc but does NOT
touch the database. The ticket marks `sources_markdown` as editorial-only ("must
NOT be published" without review), so a human applies it after checking labels.

Parsing rules (the references are `- ` bullet lines):
  - `[url](url)` bare link          -> url=that URL, label=domain host (editorial
                                       polishes the label).
  - prose with an embedded [t](url) -> url=first embedded URL, label=the prose
                                       (link text inlined).
  - prose with NO URL               -> cannot become a row (url is NOT NULL);
                                       listed in the review doc as needs-editorial.

Apply semantics (in the generated SQL, per target, transactional):
  INSERT-ONLY, additive and idempotent. New rows skip any URL already present and
  are numbered after the current max citation_number. Existing citations are NEVER
  deleted — several drafts' references are prose-only (no URL), so a blind replace
  would strip live pages down to 0-1 citations. Editorial removes the now-stale
  pre-enrichment citations by hand during review.

Outputs (out/enrichment/):
  sources_proposal.sql   -- per-target BEGIN/COMMIT; NOT executed
  sources-review.md      -- per-target convertible vs needs-editorial breakdown
"""

from __future__ import annotations

import csv
import re
from pathlib import Path
from urllib.parse import urlparse

from transform import sql_str

HERE = Path(__file__).parent
CSV_PATH = HERE / "mes_case_studies_batch_65.csv"
OUT_DIR = HERE / "out" / "enrichment"

# new_slug -> (existing published slug, action)
TARGETS: dict[str, tuple[str, str]] = {
    "how-netflix-localised-its-way-to-australian-streaming-dominance": ("netflix-streaming-australia-launch", "fill"),
    "how-afterpay-invented-buy-now-pay-later-from-its-australian-home-market": ("afterpay-buy-now-pay-later-revolution", "fill"),
    "how-secretlab-sold-australia-gaming-chairs-without-a-single-store": ("secretlab-anz-market-entry", "replace"),
    "how-shopback-used-cashback-to-break-into-australian-loyalty": ("shopback-anz-market-entry", "replace"),
    "how-starbucks-misread-australias-coffee-culture-and-closed-61-stores": ("starbucks-australia-market-entry", "replace"),
    "how-masters-lowes-lost-billions-challenging-bunnings": ("masters-australia-market-entry", "replace"),
    "how-ola-won-australian-drivers-but-never-won-the-riders": ("ola-australia-market-entry", "replace"),
    "how-topshops-australian-franchise-collapsed-under-its-own-economics": ("topshop-australia-market-entry", "replace"),
    "how-weworks-australian-business-outlived-its-parents-bankruptcy": ("wework-australia-market-entry", "replace"),
}

LINK_RE = re.compile(r"\[([^\]]*)\]\((https?://[^)\s]+)\)")


def infer_source_type(url: str) -> str:
    host = (urlparse(url).hostname or "").lower().lstrip("www.")
    if any(host.endswith(g) or g in host for g in (".gov", ".gov.au", "rba.", "abs.gov", "asic.", "accc.", "austlia", "legislation")):
        return "government"
    if "wikipedia.org" in host:
        return "other"
    if "linkedin.com" in host:
        return "linkedin"
    news = ("theguardian", "smh.com", "afr.com", "news.com.au", "abc.net.au", "theage",
            "reuters", "bloomberg", "ft.com", "cnbc", "techcrunch", "zdnet", "itnews",
            "crikey", "theconversation", "businesstimes", "channelnews", "financialreview")
    if any(n in host for n in news):
        return "news"
    return "other"


def parse_sources(md: str):
    """Return (rows, unresolved) where rows are (label, url, source_type)."""
    rows, unresolved = [], []
    for raw in md.split("\n"):
        line = raw.strip()
        if not line.startswith("-"):
            continue
        line = line.lstrip("-").strip()
        if not line:
            continue
        links = LINK_RE.findall(line)
        if not links:
            unresolved.append(line)
            continue
        url = links[0][1].strip()
        # Prose label: replace every [text](url) with its text; if the whole line
        # was just the bare link, fall back to the URL's host as the label.
        prose = LINK_RE.sub(lambda m: m.group(1), line).strip()
        prose = re.sub(r"\\([$~%&#*_\[\]().+-])", r"\1", prose)  # unescape md
        host = (urlparse(url).hostname or url).lstrip("www.")
        label = host if (not prose or prose == url or prose == host) else prose
        label = label[:280]
        rows.append((label, url, infer_source_type(url)))
    # de-dup by url, keep first
    seen, deduped = set(), []
    for label, url, st in rows:
        if url in seen:
            continue
        seen.add(url)
        deduped.append((label, url, st))
    return deduped, unresolved


def build_block(existing_slug: str, action: str, rows) -> str:
    tgt = (f"(SELECT id FROM public.content_items "
           f"WHERE slug = {sql_str(existing_slug)} AND content_type = 'case_study')")
    lines = [f"-- {existing_slug} ({action}: +{len(rows)} URL-bearing sources, additive)", "BEGIN;"]
    if not rows:
        lines += ["  -- no URL-bearing references parsed; all need an editorial URL (see review doc)",
                  "COMMIT;"]
        return "\n".join(lines)
    values = ",\n      ".join(
        f"({sql_str(label)}, {sql_str(url)}, {sql_str(st)}, {i})"
        for i, (label, url, st) in enumerate(rows, start=1)
    )
    lines += [
        "INSERT INTO public.case_study_sources (case_study_id, label, url, source_type, citation_number)",
        f"SELECT {tgt}, v.label, v.url, v.source_type,",
        f"       COALESCE((SELECT max(citation_number) FROM public.case_study_sources WHERE case_study_id = {tgt}), 0) + v.ord",
        "FROM (VALUES",
        f"      {values}",
        ") AS v(label, url, source_type, ord)",
        f"WHERE NOT EXISTS (SELECT 1 FROM public.case_study_sources cs WHERE cs.case_study_id = {tgt} AND cs.url = v.url);",
        "COMMIT;",
    ]
    return "\n".join(lines)


def main() -> None:
    csv.field_size_limit(10**9)
    rows_by_slug = {r["suggested_slug"]: r for r in csv.DictReader(open(CSV_PATH))}
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    blocks, doc = [], []
    for new_slug, (existing_slug, action) in TARGETS.items():
        parsed, unresolved = parse_sources(rows_by_slug[new_slug]["sources_markdown"])
        blocks.append(build_block(existing_slug, action, parsed))
        doc.append((existing_slug, action, len(parsed), unresolved))

    header = (
        "-- MES-178 follow-up (audit W2): STAGED sources_markdown -> case_study_sources.\n"
        "-- NOT APPLIED. Review out/enrichment/sources-review.md first (labels for bare\n"
        "-- URLs are domain placeholders; prose-only references without a URL are NOT\n"
        "-- included and need an editorial URL). Apply via the reviewed service-role path.\n"
        "-- Additive insert-only: skips URLs already present, numbers after the current\n"
        "-- max; existing citations are never deleted (editorial removes stale ones).\n\n"
    )
    (OUT_DIR / "sources_proposal.sql").write_text(header + "\n\n".join(blocks) + "\n")

    md = [
        "# MES-178 follow-up — staged citation conversion (audit W2)",
        "",
        "**Status: proposed, NOT applied.** Converts each enriched draft's",
        "`sources_markdown` into `case_study_sources` rows so citations match the new",
        "bodies. `sources_markdown` is editorial-only per the ticket, so a human reviews",
        "labels and adds URLs for the prose-only references below, then applies",
        "`out/enrichment/sources_proposal.sql`.",
        "",
        "- **Additive, insert-only:** new rows skip any URL already present and are",
        "  numbered after the current max citation. Existing citations are never",
        "  deleted (several drafts are prose-only, so a blind replace would strip live",
        "  pages down to 0-1 sources). Editorial removes the stale pre-enrichment",
        "  citations by hand — the 7 replace targets still carry those until then.",
        "- Bare-URL references get a domain-host label (editorial should polish).",
        "- Prose-only references with **no URL** cannot be rows (`url` is NOT NULL) —",
        "  listed per target for an editorial URL.",
        "",
        "| Live slug | Action | Sources emitted | Needs editorial URL |",
        "|---|---|---:|---:|",
    ]
    md += [
        f"| `{slug}` | {action} | {n} | {len(unres)} |"
        for slug, action, n, unres in doc
    ]
    md += ["", "## Prose-only references needing an editorial URL", ""]
    any_unres = False
    for slug, action, n, unres in doc:
        if unres:
            any_unres = True
            md.append(f"**`{slug}`**")
            md += [f"- {u}" for u in unres]
            md.append("")
    if not any_unres:
        md.append("_None — every reference carried a URL._")
    (OUT_DIR / "sources-review.md").write_text("\n".join(md) + "\n")
    print(f"targets={len(blocks)} "
          f"total_sources={sum(n for _,_,n,_ in doc)} "
          f"needs_editorial={sum(len(u) for *_,u in doc)}")


if __name__ == "__main__":
    main()
