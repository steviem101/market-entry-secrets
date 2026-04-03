#!/usr/bin/env python3
"""
Phase 3: Generate SQL to import 267 angel investors into Supabase.
Reads from australian_angel_investors_enriched.csv.
Outputs SQL to scripts/import_investors.sql.
"""

import csv
import re
import json
import os

INPUT = os.path.join(os.path.dirname(__file__), '..', 'australian_angel_investors_enriched.csv')
OUTPUT = os.path.join(os.path.dirname(__file__), 'import_investors.sql')

# Existing records that need UPDATE instead of INSERT
EXISTING_NAMES = {
    'Sydney Angels': 'Sydney Angels',
    'Melbourne Angels Inc.': 'Melbourne Angels',  # CSV name -> DB name
}


def parse_cheque(raw):
    """Parse cheque size string into (min_val, max_val) integers or (None, None)."""
    if not raw or raw.strip() in ('', 'n/a', 'N/A', 'Email', 'Apply online.'):
        return None, None

    s = raw.strip()
    # Remove currency prefixes
    for prefix in ['US$', 'A$', 'AUD$', '$AUD', 'AUD', 'EUR', 'GBP', 'USD', '$']:
        s = s.replace(prefix, '')
    s = s.replace(',', '').strip()

    # Remove trailing noise like "+ pro-rata..." or "(as angel...)"
    s = re.sub(r'\s*\+.*', '', s)
    s = re.sub(r'\s+then.*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s+as\s+.*', '', s, flags=re.IGNORECASE)
    s = re.sub(r'Varies.*', '', s, flags=re.IGNORECASE)
    s = s.strip()

    if not s:
        return None, None

    def apply_mult(val, mult):
        mult = mult.lower() if mult else ''
        if mult == 'k':
            return int(val * 1000)
        elif mult in ('m', 'mil'):
            return int(val * 1000000)
        return int(val)

    # "Up to X" pattern
    m = re.match(r'[Uu]p\s+to\s+([\d.]+)\s*([kKmM](?:il)?)?', s)
    if m:
        return None, apply_mult(float(m.group(1)), m.group(2))

    # "> X" or ">= X"
    m = re.match(r'>\s*=?\s*([\d.]+)\s*([kKmM](?:il)?)?', s)
    if m:
        return apply_mult(float(m.group(1)), m.group(2)), None

    # "<= X"
    m = re.match(r'<=\s*([\d.]+)\s*([kKmM](?:il)?)?', s)
    if m:
        return None, apply_mult(float(m.group(1)), m.group(2))

    # Range: "X-Y" or "X - Y" (with optional k/m suffixes)
    m = re.match(r'([\d.]+)\s*([kKmM](?:il)?)?\s*[-–—]\s*([\d.]+)\s*([kKmM](?:il)?)?', s)
    if m:
        lo_val = float(m.group(1))
        lo_mult = m.group(2)
        hi_val = float(m.group(3))
        hi_mult = m.group(4)

        hi = apply_mult(hi_val, hi_mult)
        # If lo has no suffix but hi does, infer lo's suffix from hi
        if lo_mult:
            lo = apply_mult(lo_val, lo_mult)
        elif hi_mult:
            lo = apply_mult(lo_val, hi_mult)
        elif hi > 1000 and lo_val < 1000:
            # e.g., "50-100k" after removing k: "50-100000" — lo needs same scale
            # But this case is already handled by hi_mult inference
            lo = int(lo_val)
        else:
            lo = int(lo_val)
        return lo, hi

    # "X to Y"
    m = re.match(r'([\d.]+)\s*([kKmM](?:il)?)?\s+to\s+([\d.]+)\s*([kKmM](?:il)?)?', s)
    if m:
        lo_val = float(m.group(1))
        lo_mult = m.group(2)
        hi_val = float(m.group(3))
        hi_mult = m.group(4)

        hi = apply_mult(hi_val, hi_mult)
        if lo_mult:
            lo = apply_mult(lo_val, lo_mult)
        elif hi_mult:
            lo = apply_mult(lo_val, hi_mult)
        else:
            lo = int(lo_val)
        return lo, hi

    # Single number
    m = re.match(r'([\d.]+)\s*([kKmM](?:il)?)?\s*$', s)
    if m:
        val = apply_mult(float(m.group(1)), m.group(2))
        if val > 0:
            return val, val

    return None, None


def parse_sectors(raw):
    """Split comma-separated sector string into a Postgres text array literal."""
    if not raw or not raw.strip():
        return 'NULL'
    sectors = [s.strip() for s in raw.split(',') if s.strip()]
    escaped = [s.replace("'", "''") for s in sectors]
    return "ARRAY[" + ", ".join(f"'{s}'" for s in escaped) + "]::text[]"


def sql_str(val):
    """Escape a string for SQL or return NULL."""
    if not val or not val.strip():
        return 'NULL'
    return "'" + val.strip().replace("'", "''") + "'"


def normalize_linkedin(url):
    """Normalize LinkedIn URL."""
    if not url or not url.strip():
        return 'NULL'
    url = url.strip()
    if url.upper() == 'NA':
        return 'NULL'
    if 'linkedin' not in url.lower():
        return 'NULL'
    if not url.startswith('http'):
        url = 'https://' + url
    return sql_str(url)


def is_url(val):
    """Check if a value looks like a URL rather than an email."""
    if not val:
        return False
    return val.strip().startswith('http') or val.strip().startswith('www.')


def main():
    rows = []
    with open(INPUT, 'r') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if len(row) >= 7:
                rows.append(row)

    lines = []
    lines.append("-- Phase 3: Import angel investors into Supabase")
    lines.append(f"-- Source: australian_angel_investors_enriched.csv ({len(rows)} rows)")
    lines.append("-- Date: 2026-04-03")
    lines.append("-- Slug auto-generated by trg_investors_slug BEFORE INSERT trigger")
    lines.append("")
    lines.append("BEGIN;")
    lines.append("")

    # Handle existing records (UPDATE)
    update_count = 0
    for row in rows:
        name = row[0].strip()
        if name in EXISTING_NAMES:
            db_name = EXISTING_NAMES[name]
            linkedin = normalize_linkedin(row[1])
            sectors = parse_sectors(row[2])
            cheque_min, cheque_max = parse_cheque(row[4])
            location = sql_str(row[5]) if row[5].strip() else 'NULL'
            email_raw = row[6].strip()
            email = sql_str(email_raw) if email_raw and not is_url(email_raw) else 'NULL'

            lines.append(f"-- Update existing record: {db_name}")
            lines.append(f"UPDATE investors SET")
            lines.append(f"  linkedin_url = {linkedin},")
            lines.append(f"  sector_focus = {sectors},")
            lines.append(f"  check_size_min = {cheque_min if cheque_min is not None else 'NULL'},")
            lines.append(f"  check_size_max = {cheque_max if cheque_max is not None else 'NULL'},")
            lines.append(f"  contact_email = {email},")
            if location != 'NULL':
                lines.append(f"  location = {location},")
            lines.append(f"  updated_at = now()")
            lines.append(f"WHERE name = {sql_str(db_name)};")
            lines.append("")
            update_count += 1

    # Insert new records
    insert_count = 0
    for row in rows:
        name = row[0].strip()
        if name in EXISTING_NAMES:
            continue

        linkedin = normalize_linkedin(row[1])
        sectors = parse_sectors(row[2])
        cheque_min, cheque_max = parse_cheque(row[4])
        location_raw = row[5].strip() if row[5].strip() else 'Australia'
        location = sql_str(location_raw)

        email_raw = row[6].strip()
        email = sql_str(email_raw) if email_raw and not is_url(email_raw) else 'NULL'

        # Build description
        desc_parts = [f"Angel investor based in {location_raw}"]
        if row[2].strip():
            sector_preview = row[2].strip()[:120]
            desc_parts.append(f"Sector focus: {sector_preview}")
        description = sql_str('. '.join(desc_parts) + '.')

        # Build details jsonb with raw data
        details = {}
        if row[3].strip():
            details['portfolio'] = row[3].strip()
        if row[4].strip():
            details['cheque_size_raw'] = row[4].strip()
        details_sql = sql_str(json.dumps(details)) + '::jsonb' if details else 'NULL'

        name_sql = sql_str(name)

        lines.append(f"INSERT INTO investors (name, description, investor_type, location, linkedin_url, sector_focus, check_size_min, check_size_max, contact_email, details)")
        lines.append(f"VALUES ({name_sql}, {description}, 'angel', {location}, {linkedin}, {sectors}, {cheque_min if cheque_min is not None else 'NULL'}, {cheque_max if cheque_max is not None else 'NULL'}, {email}, {details_sql})")
        lines.append(f"ON CONFLICT (slug) DO NOTHING;")
        lines.append("")
        insert_count += 1

    lines.append("COMMIT;")
    lines.append("")
    lines.append(f"-- Summary: {update_count} updates + {insert_count} inserts = {update_count + insert_count} total")

    sql = '\n'.join(lines)

    with open(OUTPUT, 'w') as f:
        f.write(sql)

    print(f"Generated {OUTPUT}")
    print(f"  {update_count} UPDATE statements (existing records)")
    print(f"  {insert_count} INSERT statements (new records)")
    print(f"  {update_count + insert_count} total")

    # Print cheque parse stats
    parsed = 0
    unparsed_vals = []
    for row in rows:
        cheque = row[4].strip()
        if cheque:
            lo, hi = parse_cheque(cheque)
            if lo is not None or hi is not None:
                parsed += 1
            else:
                unparsed_vals.append(cheque)
    total_with_cheque = sum(1 for r in rows if r[4].strip())
    print(f"\n  Cheque parsing: {parsed}/{total_with_cheque} parsed successfully")
    if unparsed_vals:
        print(f"  Unparsed cheque values ({len(unparsed_vals)}):")
        for v in unparsed_vals:
            print(f"    '{v}'")


if __name__ == "__main__":
    main()
