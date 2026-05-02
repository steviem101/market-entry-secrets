"""
Simulate tightening recipes WITHOUT over-pruning legitimate candidates like
trade commissioners (whose titles don't match my seniority patterns).

Strategy:
- Lever 1: cap network soft signals at 0.5 total (was 2.0 max)
- Lever 2: require >= 2 Tier 2/3 keywords for relevance=1 (was 1)
- Lever 3: drop generic Tier 2A/2B keywords ("founder", " AI ", "compliance",
           "regulatory", "growth", "platform", "cloud" alone)
- Lever 4: persona_fit tangential = 0 (was 0.5)
- Lever 5: industry baseline = 0 for "other" (was 1)
- Lever 6: composite floor = 12, AND require ANY of:
           - intl_founder_score >= 3
           - mes_tagged
           - mes_company_match (current OR previous)
           - relevance_score >= 3
           - (seniority_score >= 4 AND relevance_score >= 2)
- Special-case lift: trade-related titles add bonus seniority
"""
import re
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).parent
df = pd.read_csv(ROOT / "scored_contacts.csv")
print(f"Starting: {len(df)} qualified contacts (>=8 under current rules)")

# Lever 1: cap soft signals at 0.5
def soft_signal_value(row):
    s = 0.0
    desc = row.get("linkedinDescription") or ""
    if isinstance(desc, str) and len(desc) >= 100: s += 0.5
    if isinstance(row.get("linkedinSkillsLabel"), str) and (row.get("linkedinSkillsLabel") or "").strip(): s += 0.5
    try:
        if int(row.get("linkedinFollowersCount") or 0) >= 500: s += 0.5
    except (ValueError, TypeError):
        pass
    if (isinstance(row.get("professionalEmail1"), str) and (row.get("professionalEmail1") or "").strip()) or \
       (isinstance(row.get("personalEmail1"), str) and (row.get("personalEmail1") or "").strip()):
        s += 0.5
    return s

df["soft_signal_value"] = df.apply(soft_signal_value, axis=1)

# Lever 2 + 3: re-derive relevance based on tightened keyword lists
GENERIC_KEYWORDS_TO_DROP = {
    " ai ", " hr ", " pr ", " vc ", " gst ", " vat ", " ip ",  # single-letter acronyms (too noisy)
    "founder",  # too common; intl-founder dimension already credits real founders
    "compliance", "regulatory",  # common in banking/finance for non-mentor roles
    "growth", "platform", "cloud", "communications",  # too generic
    "branding", "advertising", "ecosystem",
    "advisory", "mentoring",  # almost everyone says this
    "strategic", "strategies",
}
def parse_existing_keywords(km: str) -> dict[str, list[str]]:
    """Parse the keyword_matches column 'TIER:keyword, TIER:keyword' back to dict."""
    out = {"1A": [], "1B": [], "1C": [], "2A": [], "2B": [], "3": []}
    if not isinstance(km, str) or not km:
        return out
    for entry in km.split(", "):
        if ":" in entry:
            tier, kw = entry.split(":", 1)
            kw_clean = kw.strip().lower()
            # Drop generic keywords
            if kw_clean in GENERIC_KEYWORDS_TO_DROP:
                continue
            if tier in out:
                out[tier].append(kw_clean)
    return out

def tighter_relevance(km: dict) -> int:
    n_t1 = len(km["1A"]) + len(km["1B"]) + len(km["1C"])
    n_t2 = len(km["2A"]) + len(km["2B"])
    n_t3 = len(km["3"])
    if n_t1 >= 3:
        return 5
    if n_t1 >= 2 or (n_t1 >= 1 and n_t2 >= 3):
        return 4
    if n_t1 == 1 or n_t2 >= 4 or len(km["2B"]) >= 3:
        return 3
    # Tightened: 2 only requires 3+ Tier 2 matches OR (2 Tier 2 + 2 Tier 3)
    if n_t2 >= 3 or (n_t2 >= 2 and n_t3 >= 2) or n_t3 >= 4:
        return 2
    # Tightened: 1 requires 2+ Tier 2/3 matches (not just 1)
    if n_t2 >= 2 or n_t3 >= 2 or (n_t2 >= 1 and n_t3 >= 1):
        return 1
    return 0

df["km_clean"] = df["keyword_matches"].apply(parse_existing_keywords)
df["relevance_tight"] = df["km_clean"].apply(tighter_relevance)

# Lever 4: tangential persona_fit -> 0
df["persona_tight"] = df["persona_fit_score"].where(df["persona_fit_score"] != 0.5, 0.0)

# Lever 5: industry baseline -> 0 for "other"
df["industry_tight"] = df["industry_score"].where(df["industry_score"] != 1, 0)

# Special-case lift: trade-related titles get seniority bonus
TRADE_TITLE_PATTERNS = [
    r"\btrade\s+commissioner\b", r"\bconsul\s*-?\s*general\b", r"\bconsul\b",
    r"\bcountry\s+director\b", r"\bregional\s+(director|manager|head)\b",
    r"\binvestment\s+(commissioner|specialist|manager)\b",
    r"\bmarket\s+entry\s+manager\b",
    r"\bambassador\b", r"\battache\b", r"\battaché\b",
    r"\bchief\s+representative\b", r"\bbusiness\s+commissioner\b",
    r"\bsenior\s+trade\b",
]
def safe_str(v):
    if not isinstance(v, str):
        return ""
    return v
def trade_title_bonus(row):
    title = safe_str(row.get("linkedinJobTitle")).lower()
    headline = safe_str(row.get("linkedinHeadline")).lower()
    text = title + " " + headline
    if any(re.search(p, text) for p in TRADE_TITLE_PATTERNS):
        return 4  # treat as Director-equivalent (matches "Director" rule)
    return 0
df["seniority_lift"] = df.apply(trade_title_bonus, axis=1)
df["seniority_tight"] = df[["seniority_score", "seniority_lift"]].max(axis=1)

# Cap soft signal at 0.5 total for network
df["network_tight"] = df["network_score"] - df["soft_signal_value"] + df["soft_signal_value"].clip(upper=0.5)

# Recompute total under tightening
df["score_tight"] = (
    df["seniority_tight"]
    + df["relevance_tight"]
    + df["industry_tight"]
    + df["network_tight"]
    + df["persona_tight"]
    + df["intl_founder_score"]
)

# Lever 6: floor + AT LEAST ONE strong evidence signal
def has_evidence(row):
    return bool(
        (row["intl_founder_score"] >= 3)
        or row["is_mes_tagged"]
        or row["mes_company_match"]
        or (row["relevance_tight"] >= 3)
        or (row["seniority_tight"] >= 4 and row["relevance_tight"] >= 2)
    )
df["has_evidence"] = df.apply(has_evidence, axis=1)

# Project counts at various floors
print("\n=== TIGHTENED SCORING (lever 1-5 applied) ===")
for floor in [8, 10, 12, 14, 17, 19]:
    print(f"  >= {floor}: {(df.score_tight >= floor).sum()}")

print("\n=== TIGHTENED + EVIDENCE GATE (lever 1-6) ===")
for floor in [8, 10, 12, 14, 17, 19]:
    cnt = ((df.score_tight >= floor) & df.has_evidence).sum()
    print(f"  >= {floor} AND has evidence: {cnt}")

# Recommended cohort
recipe_strict = df[(df.score_tight >= 12) & df.has_evidence].copy()
print(f"\n=== RECIPE A (recommended): score_tight>=12 AND has_evidence ===")
print(f"  Total: {len(recipe_strict)}")
print(f"  Tier A (score_tight>=19): {(recipe_strict.score_tight >= 19).sum()}")
print(f"  Tier B (15-18):           {((recipe_strict.score_tight >= 15) & (recipe_strict.score_tight < 19)).sum()}")
print(f"  Tier C (12-14):           {((recipe_strict.score_tight >= 12) & (recipe_strict.score_tight < 15)).sum()}")

# Sanity: confirm the trade commissioners survive
print("\n=== Sanity check: did trade commissioners survive? ===")
for name in ["Najib Lawand", "Sarah Quigley", "Steven Walker", "Ceri Morgan", "Sophie O'Grady", "Diane Belliveau"]:
    rows = df[df.fullName == name]
    if len(rows):
        r = rows.iloc[0]
        keep = "KEEP" if (r.score_tight >= 12 and r.has_evidence) else "DROP"
        print(f"  [{keep}]  {name:<22} | score_tight={r.score_tight:5.1f} | sen_tight={r.seniority_tight} rel_tight={r.relevance_tight} net_tight={r.network_tight:.1f} ecosys={r.has_evidence}")

# Recipe B: ultra-strict — only A-tier
recipe_ultra = df[(df.score_tight >= 17) & df.has_evidence].copy()
print(f"\n=== RECIPE B (ultra-strict, A-tier only): score_tight>=17 AND has_evidence ===")
print(f"  Total: {len(recipe_ultra)}")

# Recipe C: middle ground
recipe_mid = df[(df.score_tight >= 14) & df.has_evidence].copy()
print(f"\n=== RECIPE C (balanced): score_tight>=14 AND has_evidence ===")
print(f"  Total: {len(recipe_mid)}")

# International founder breakdown under each recipe
for label, recipe in [("A (>=12)", recipe_strict), ("B (>=17)", recipe_ultra), ("C (>=14)", recipe_mid)]:
    intl = recipe[recipe.intl_founder_score >= 3]
    by_origin = intl.groupby("origin_country").size().sort_values(ascending=False)
    print(f"\n  Intl founders surviving Recipe {label}: {len(intl)}")
    print(f"    By origin: {dict(by_origin)}")

# Save the tightened scoring for re-use
df.to_csv(ROOT / "tightened_scored.csv", index=False)
print(f"\nSaved per-row tightened scores to tightened_scored.csv")
