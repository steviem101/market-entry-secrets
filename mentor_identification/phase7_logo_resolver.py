"""Resolve experience-tile company names to Logo.dev URLs and emit SQL UPDATEs.

Strategy:
1. Try exact match against MES tables (service_providers, trade_investment_agencies,
   innovation_ecosystem, content_company_profiles, country_trade_organizations)
2. Try hardcoded brand → domain map for major global brands
3. Heuristic fallback: slugify name → {slug}.com
4. Skip clearly-noise tiles (starts with quote/and/various/case studies, etc.)
"""
import json
import re
import unicodedata
from urllib.parse import urlparse

LOGO_DEV_TOKEN = "pk_L3JbJjCeT0-mUdhpPlS6SA"

# ---------------------------------------------------------------------------
# Hardcoded brand → domain map for major brands likely to appear as tiles
# ---------------------------------------------------------------------------
BRAND_DOMAIN = {
    # Tech
    "microsoft": "microsoft.com",
    "google": "google.com",
    "google australia": "google.com.au",
    "amazon": "amazon.com",
    "amazon web services": "aws.amazon.com",
    "aws": "aws.amazon.com",
    "apple": "apple.com",
    "ibm": "ibm.com",
    "dell": "dell.com",
    "dell technologies": "dell.com",
    "hewlett packard enterprise": "hpe.com",
    "intel": "intel.com",
    "cisco": "cisco.com",
    "oracle": "oracle.com",
    "sap": "sap.com",
    "salesforce": "salesforce.com",
    "servicenow": "servicenow.com",
    "atlassian": "atlassian.com",
    "github": "github.com",
    "openai": "openai.com",
    "vmware": "vmware.com",
    "samsung": "samsung.com",
    "sony": "sony.com",
    "lego": "lego.com",
    "nokia": "nokia.com",
    "miro": "miro.com",
    "monday.com": "monday.com",
    "shopify": "shopify.com",
    "spotify": "spotify.com",
    "twilio": "twilio.com",
    "dropbox": "dropbox.com",
    "slack": "slack.com",
    "zendesk": "zendesk.com",
    "okta": "okta.com",
    "crowdstrike": "crowdstrike.com",
    "darktrace": "darktrace.com",
    "fortinet": "fortinet.com",
    "palo alto networks": "paloaltonetworks.com",
    "cyberark": "cyberark.com",
    "cybercx": "cybercx.com",
    "cloudera": "cloudera.com",
    "databricks": "databricks.com",
    "rubrik": "rubrik.com",
    "hashicorp": "hashicorp.com",
    "infosys": "infosys.com",
    "datacom": "datacom.com",
    "barracuda": "barracuda.com",
    "knowbe4": "knowbe4.com",
    "kaspersky": "kaspersky.com",
    "veracode": "veracode.com",
    "lacework": "lacework.com",
    "illumio": "illumio.com",
    "gigamon": "gigamon.com",
    "solarwinds": "solarwinds.com",
    "arista": "arista.com",
    "dataminr": "dataminr.com",
    "facebook": "facebook.com",
    "linkedin": "linkedin.com",
    "tinder": "tinder.com",
    "expedia": "expedia.com",
    "booking.com": "booking.com",
    "reddit": "reddit.com",
    "scale ai": "scale.com",
    "leonardo.ai": "leonardo.ai",
    "harrison.ai": "harrison.ai",
    "leading global consulting firm": None,  # noise
    "general electric": "ge.com",
    "kpmg": "kpmg.com",
    "pwc": "pwc.com",
    "ey": "ey.com",
    # Banks & finance
    "anz": "anz.com.au",
    "anz bank": "anz.com.au",
    "anz banking group": "anz.com.au",
    "anz group": "anz.com.au",
    "nab": "nab.com.au",
    "commonwealth bank": "commbank.com.au",
    "commonwealth bank of australia": "commbank.com.au",
    "westpac": "westpac.com.au",
    "hsbc australia": "hsbc.com.au",
    "barclays": "barclays.com",
    "bank of america": "bankofamerica.com",
    "judo bank": "judo.bank",
    "kiwibank": "kiwibank.co.nz",
    "bank first": "bankfirst.com.au",
    "mastercard": "mastercard.com",
    "american express": "americanexpress.com",
    "blackstone": "blackstone.com",
    "cpp investments": "cppinvestments.com",
    "pacific equity partners": "pep.com.au",
    "rampersand": "rampersand.com",
    "vickers venture partners": "vickersventure.com",
    "airtree ventures": "airtree.vc",
    "svg ventures": "svg.vc",
    "l1 capital": "l1.com.au",
    "athena home loans": "athena.com.au",
    "wise": "wise.com",
    "revolut": "revolut.com",
    "afterpay": "afterpay.com",
    "zepto": "zepto.com.au",
    "wemoney": "wemoney.com.au",
    "hnry": "hnry.com.au",
    # Australian/NZ corporates
    "bhp": "bhp.com",
    "rio tinto": "riotinto.com",
    "telstra": "telstra.com.au",
    "optus": "optus.com.au",
    "vodafone": "vodafone.com.au",
    "qantas": "qantas.com",
    "vietnam airlines": "vietnamairlines.com",
    "emirates": "emirates.com",
    "woolworths": "woolworths.com.au",
    "coles supermarkets australia pty ltd": "coles.com.au",
    "coles liquor": "colesliquor.com.au",
    "metcash": "metcash.com",
    "myer": "myer.com.au",
    "bunnings": "bunnings.com.au",
    "officeworks": "officeworks.com.au",
    "harvey norman": "harveynorman.com.au",
    "csiro": "csiro.au",
    "australia post": "auspost.com.au",
    "altium": "altium.com",
    "airtrunk": "airtrunk.com",
    "nrma": "mynrma.com.au",
    "aami": "aami.com.au",
    "iag": "iag.com.au",
    "suncorp": "suncorp.com.au",
    "bupa": "bupa.com.au",
    "bupa foundation": "bupa.com.au",
    "blackmores": "blackmores.com.au",
    "treasury wine estates": "tweglobal.com",
    "lendlease": "lendlease.com",
    "apa group": "apa.com.au",
    "australian government": "australia.gov.au",
    "victorian government": "vic.gov.au",
    "australian red cross": "redcross.org.au",
    "rspca": "rspca.org.au",
    "unicef australia": "unicef.org.au",
    "cricket australia": "cricket.com.au",
    "rmit university": "rmit.edu.au",
    "university of melbourne": "unimelb.edu.au",
    "university of sydney": "sydney.edu.au",
    "the university of sydney": "sydney.edu.au",
    "bond university": "bond.edu.au",
    "lse": "lse.ac.uk",
    "london school of economics": "lse.ac.uk",
    "diageo": "diageo.com",
    "domino's": "dominos.com.au",
    "pepsi max": "pepsi.com",
    "coca-cola": "coca-cola.com",
    "coca cola": "coca-cola.com",
    "nestle": "nestle.com",
    "nestlé": "nestle.com",
    "colgate-palmolive": "colgatepalmolive.com",
    "haleon": "haleon.com",
    "gsk": "gsk.com",
    "pfizer": "pfizer.com",
    "novotech": "novotech-cro.com",
    "huel": "huel.com",
    "myer": "myer.com.au",
    "shein": "shein.com",
    "anytime fitness": "anytimefitness.com.au",
    "starbucks apac": "starbucks.com",
    "boeing": "boeing.com",
    "bae systems": "baesystems.com",
    "thales": "thalesgroup.com",
    "naval group": "naval-group.com",
    "lego": "lego.com",
    "lenovo": "lenovo.com",
    "hp": "hp.com",
    # Pro services
    "accenture": "accenture.com",
    "deloitte": "deloitte.com",
    "ashurst": "ashurst.com",
    "king & wood mallesons": "kwm.com",
    "sportify": "spotify.com",
    "deloitte australia": "deloitte.com.au",
    # Smaller AU brands
    "envato": "envato.com",
    "canva": "canva.com",
    "atlassian": "atlassian.com",
    "amazon australia": "amazon.com.au",
    "xero": "xero.com",
    "qantas": "qantas.com",
    "shippit": "shippit.com",
    "cleanaway": "cleanaway.com.au",
    "elders": "elders.com.au",
    "ggm group": "ggm.com.au",
    "loam bio": "loambio.com",
    "novotech": "novotech-cro.com",
    "infosys": "infosys.com",
    "cobram estate olives": "cobramestate.com.au",
    "bega cheese limited": "begacheese.com.au",
    "blackmores": "blackmores.com.au",
    "kia": "kia.com",
    "hyundai": "hyundai.com",
    "toyota": "toyota.com",
    "mazda": "mazda.com",
    "bmw": "bmw.com",
    "mg": "mgmotor.com.au",
    "ford": "ford.com",
    "yamaha": "yamaha.com",
    "harley-davidson": "harley-davidson.com",
    "michelin": "michelin.com",
    "the michelin group": "michelin.com",
    "eucalyptus": "eucalyptus.health",
    "afterpay": "afterpay.com",
    "amplified intelligence": "amplifiedintelligence.com.au",
    # Common non-companies — skip
    "various international suppliers and manufacturers": None,
    "foreign exchange vendors": None,
    "freight operators": None,
    "3pls": None,
    "last-mile carriers": None,
    "high-net-worth individuals": None,
    "afs licensee": None,
    "middle market businesses": None,
    "privately owned companies": None,
    "foreign-controlled entities": None,
    "government-owned entities": None,
    "government": None,
    "global financial services": None,
    "global investment bank": None,
    "global social app": None,
    "fortune 500 financial services firm": None,
    "international law firm": None,
    "leading global consulting firm": None,
    "leading global medical device oems": None,
    "major media companies": None,
    "multinational corporations in higher education": None,
    "multinational professional services firm": None,
    "case studies mention \"a leading middle east automotive group": None,
    "and not-for-profit organizations": None,
    "and master builders australia": None,
    "and ramelius resources": None,
    "and multinational pharmaceutical firms in germany and the us. freyr success stories": None,
    "and international organizations in film and media": None,
    "and e-commerce brands": None,
    "and legalvision": None,
    "biopharmaceutical companies in china and south korea": None,
    "various developers of robot-assisted surgical systems": None,
    "unnamed large-scale renewables companies": None,
    "victorian government (principal sponsors). homepage": None,
    "tasmania) which may list active clients.": None,
    "no specific clients are publicly listed on their website": None,
    "while specific client names are not listed on their main website to maintain confidentiality": None,
    "they are registered on various state lobbyist registers": None,
    "our clients)": None,
    "an australian petroleum refinery": None,
    "a major australian infrastructure company": None,
    # Country names — skip
    "ghana": None,
    "tuvalu": None,
    "ukraine": None,
    "zambia": None,
    "sri lanka": None,
    "victoria": None,
    "brisbane city": "brisbane.qld.gov.au",
    "city of melbourne": "melbourne.vic.gov.au",
    "uae free zones": None,
    # Misc
    "facebook)": "facebook.com",
    "linkedin)": "linkedin.com",
    "and ramelius resources": "rameliusresources.com.au",
    "the daily aus": "thedailyaus.com.au",
    "spice ai": "spice.ai",
    "ar global": "arglobal.com.au",
    "ir global": "irglobal.com",
    # Inv NSW etc are also tiles
    "investment nsw": "investment.nsw.gov.au",
    "launchvic": "launchvic.org",
    "csiro": "csiro.au",
    "national ai centre": "csiro.au",
    "department of industry": "industry.gov.au",
    "australian industry group": "aigroup.com.au",
    "engineers australia": "engineersaustralia.org.au",
    "cpa australia": "cpaaustralia.com.au",
    "chartered accountants anz": "charteredaccountantsanz.com",
}


def normalize_name(name: str) -> str:
    """Lowercase + strip diacritics + collapse whitespace."""
    if not name:
        return ""
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return s.lower().strip()


def is_noise_tile(name: str) -> bool:
    """Heuristic: skip tiles that aren't clearly company names."""
    if not name or len(name.strip()) < 2:
        return True
    n = name.strip().lower()
    # Quote starts
    if n.startswith('"') or n.startswith("“") or n.startswith("‘"):
        return True
    # Linker noise
    if n.startswith("and "):
        return True
    if n.startswith("various "):
        return True
    if n.startswith("a ") and len(n.split()) > 4:  # "A premium kitchen manufacturer..."
        return True
    if n.startswith("an "):
        return True
    # Vague descriptors
    junk_starts = (
        "case studies", "no specific", "while specific", "they are registered",
        "various ", "leading global", "global financial", "global investment",
        "global social app", "fortune 500", "international law firm",
        "multinational ", "middle market", "privately owned", "government-owned",
        "foreign-controlled", "foreign exchange vendors", "freight operators",
        "high-net-worth", "afs licensee", "3pls", "last-mile carriers",
        "major media", "unnamed ", "biopharmaceutical companies",
        "tasmania)", "victoria)", "victorian government",
        "or unnamed", "our clients)",
    )
    if any(n.startswith(j) for j in junk_starts):
        return True
    return False


def extract_domain(url: str) -> str | None:
    if not url:
        return None
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    try:
        host = urlparse(url).hostname
        if not host:
            return None
        host = host.lower()
        if host.startswith("www."):
            host = host[4:]
        return host
    except Exception:
        return None


def slugify_to_domain(name: str) -> str:
    """Heuristic: take name → trim suffixes → lowercase → .com"""
    n = normalize_name(name)
    # Strip common suffixes
    suffixes = [
        " pty ltd", " pty. ltd.", " pty ltd.", " ltd", " inc", " inc.", " llc",
        " corporation", " corp.", " corp", " group", " limited", " co.",
        " australia", " au", " (australia)", " (au)", " (apac)", " apac",
        " international", " global",
    ]
    for s in suffixes:
        if n.endswith(s):
            n = n[: -len(s)].strip()
    # Strip parenthetical aliases
    n = re.sub(r"\s*\([^)]*\)\s*", "", n).strip()
    # Strip trailing ' australia' tokens etc.
    n = re.sub(r"[^a-z0-9 \-]", "", n)
    n = re.sub(r"\s+", "", n)
    if not n:
        return None
    return f"{n}.com"


def resolve_domain(tile_name: str, mes_lookup: dict) -> str | None:
    """Try MES tables → hardcoded brands → heuristic. Returns domain or None."""
    if is_noise_tile(tile_name):
        return None
    n = normalize_name(tile_name)
    # 1. MES tables
    if n in mes_lookup:
        domain = extract_domain(mes_lookup[n])
        if domain and "linkedin.com" not in domain:
            return domain
    # 1b. Try without parens
    n_clean = re.sub(r"\s*\([^)]*\)\s*", "", n).strip()
    if n_clean in mes_lookup and n_clean != n:
        domain = extract_domain(mes_lookup[n_clean])
        if domain and "linkedin.com" not in domain:
            return domain
    # 2. Hardcoded
    if n in BRAND_DOMAIN:
        return BRAND_DOMAIN[n]  # may be None for explicitly-skipped names
    # 3. Heuristic
    return slugify_to_domain(tile_name)


def logo_url(domain: str) -> str:
    return f"https://img.logo.dev/{domain}?token={LOGO_DEV_TOKEN}&size=128&format=png"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
import sys
import os

# MES name → website lookup (loaded from JSON file dumped by SQL above)
MES_RAW = json.load(open(os.path.join(os.path.dirname(__file__), "mes_name_website_lookup.json")))
MES_LOOKUP = {normalize_name(r["name"]): r["website"] for r in MES_RAW if r["website"]}

# Provider experience_tiles to update
PROVIDER_TILES = json.load(open(os.path.join(os.path.dirname(__file__), "provider_tiles.json")))

resolved_count = 0
skipped_count = 0
heuristic_count = 0
exact_count = 0
hardcoded_count = 0

provider_updates = []

for prov in PROVIDER_TILES:
    new_tiles = []
    for tile in prov["experience_tiles"]:
        name = tile.get("name", "")
        domain = resolve_domain(name, MES_LOOKUP)
        if domain is None:
            new_tiles.append(tile)
            skipped_count += 1
            continue
        # Tag where we got it
        n = normalize_name(name)
        if n in MES_LOOKUP:
            exact_count += 1
        elif n in BRAND_DOMAIN:
            hardcoded_count += 1
        else:
            heuristic_count += 1
        new_tile = dict(tile)
        new_tile["logo"] = logo_url(domain)
        new_tile["website"] = f"https://{domain}"
        new_tiles.append(new_tile)
        resolved_count += 1
    provider_updates.append({
        "id": prov["id"],
        "name": prov["name"],
        "experience_tiles": new_tiles,
    })

print(f"Resolved: {resolved_count}")
print(f"  via MES tables: {exact_count}")
print(f"  via hardcoded brand map: {hardcoded_count}")
print(f"  via heuristic: {heuristic_count}")
print(f"Skipped (noise): {skipped_count}")
print(f"Total tiles: {resolved_count + skipped_count}")

# Save the updates payload
out_path = os.path.join(os.path.dirname(__file__), "tile_logo_updates.json")
with open(out_path, "w") as f:
    json.dump(provider_updates, f, indent=2)
print(f"\nSaved {len(provider_updates)} provider updates to {out_path}")

# Generate UPDATE SQL
sql_path = os.path.join(os.path.dirname(__file__), "tile_logo_updates.sql")
with open(sql_path, "w") as f:
    f.write("BEGIN;\n\n")
    for upd in provider_updates:
        tiles_json = json.dumps(upd["experience_tiles"]).replace("'", "''")
        f.write(
            f"UPDATE service_providers SET experience_tiles = '{tiles_json}'::jsonb, "
            f"updated_at = now() WHERE id = '{upd['id']}';\n"
        )
    f.write("\nCOMMIT;\n")
print(f"Wrote SQL to {sql_path} ({os.path.getsize(sql_path)} bytes)")
