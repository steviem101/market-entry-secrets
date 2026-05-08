"""Generate SQL UPDATEs from enrichments.json.

Composes new description = enriched_description + " · Highlights: X · Y · Z"
when proof_points exist. Merges new specialties with existing (deduped).
"""
import json
from pathlib import Path

ROOT = Path(__file__).parent
data = json.load(open(ROOT / "enrichments.json"))

def quote(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"

def array_lit(arr: list) -> str:
    if not arr:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ", ".join(quote(str(x)) for x in arr) + "]"

stmts = []
for row in data:
    desc = row["enriched_description"].strip()
    proof = [p.strip() for p in row.get("proof_points", []) if p.strip()]
    if proof:
        desc += " · Highlights: " + " · ".join(proof)
    # Cap at 1000 chars
    if len(desc) > 1000:
        desc = desc[:997] + "..."
    new_specs = row.get("additional_specialties", [])
    new_specs_lit = array_lit(new_specs)
    # Merge with existing specialties using array_cat + dedup via DISTINCT
    stmts.append(
        f"UPDATE community_members SET "
        f"description = {quote(desc)}, "
        f"specialties = ARRAY(SELECT DISTINCT unnest(specialties || {new_specs_lit})), "
        f"updated_at = now() "
        f"WHERE slug = {quote(row['slug'])};"
    )

sql_path = ROOT / "enrichments.sql"
sql_path.write_text("BEGIN;\n\n" + "\n\n".join(stmts) + "\n\nCOMMIT;\n")
print(f"Wrote {len(stmts)} UPDATE statements to {sql_path}")
print(f"Total SQL size: {sql_path.stat().st_size} chars")
