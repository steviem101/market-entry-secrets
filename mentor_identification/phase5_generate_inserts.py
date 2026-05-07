"""
Phase 5: Generate INSERT SQL from upload_payload.json, split into 4 batches
of ~33 mentors each (small enough to fit in execute_sql output limits).
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent
payload = json.load(open(ROOT / "upload_payload.json"))

def quote(s: str | None) -> str:
    if s is None:
        return "NULL"
    if not isinstance(s, str):
        s = str(s)
    return "'" + s.replace("'", "''") + "'"

def array_lit(arr: list) -> str:
    if not arr:
        return "ARRAY[]::text[]"
    parts = [quote(str(x)) for x in arr]
    return "ARRAY[" + ", ".join(parts) + "]"

def jsonb_lit(obj) -> str:
    return quote(json.dumps(obj)) + "::jsonb"

# Build VALUES tuples
columns = [
    "name", "title", "description", "location", "experience",
    "specialties", "website", "contact", "image", "company",
    "is_anonymous", "experience_tiles", "origin_country",
    "associated_countries", "location_id", "slug",
    "archetype", "persona_fit", "is_active", "is_featured",
]

def build_values(row: dict) -> str:
    parts = [
        quote(row["name"]),
        quote(row["title"]),
        quote(row["description"]),
        quote(row["location"]),
        quote(row["experience"]),
        array_lit(row["specialties"]),
        quote(row["website"]),
        quote(row["contact"]),
        quote(row["image"]),
        quote(row["company"]),
        "TRUE" if row["is_anonymous"] else "FALSE",
        jsonb_lit(row["experience_tiles"]),
        quote(row["origin_country"]),
        array_lit(row["associated_countries"]),
        quote(row["location_id"]),
        quote(row["slug"]),
        quote(row["archetype"]),
        array_lit(row["persona_fit"]),
        "TRUE" if row["is_active"] else "FALSE",
        "TRUE" if row["is_featured"] else "FALSE",
    ]
    return "(" + ", ".join(parts) + ")"

# Split into batches small enough to fit in Bash/MCP windows
BATCH_SIZE = 11
batches = [payload[i:i+BATCH_SIZE] for i in range(0, len(payload), BATCH_SIZE)]

for i, batch in enumerate(batches, 1):
    values_lines = ",\n  ".join(build_values(row) for row in batch)
    sql = f"""INSERT INTO community_members (
  {', '.join(columns)}
) VALUES
  {values_lines}
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  location = EXCLUDED.location,
  experience = EXCLUDED.experience,
  specialties = EXCLUDED.specialties,
  website = EXCLUDED.website,
  company = EXCLUDED.company,
  experience_tiles = EXCLUDED.experience_tiles,
  origin_country = EXCLUDED.origin_country,
  associated_countries = EXCLUDED.associated_countries,
  archetype = EXCLUDED.archetype,
  persona_fit = EXCLUDED.persona_fit,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  updated_at = now();"""
    out_path = ROOT / f"insert_batch_{i}.sql"
    out_path.write_text(sql)
    print(f"Batch {i}: {len(batch)} rows → {out_path.name} ({len(sql)} chars)")

print(f"\nTotal: {len(payload)} mentors split into {len(batches)} batches")
