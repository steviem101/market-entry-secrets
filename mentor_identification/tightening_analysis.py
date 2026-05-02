"""Diagnose what's inflating the qualified count and project tightening impact."""
import json
import re
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).parent
df = pd.read_csv(ROOT / "scored_contacts.csv")
print(f"Current qualified (>= 8): {len(df)}")
print(f"  A (>=19): {(df.total_score >= 19).sum()}")
print(f"  B (13-18): {((df.total_score >= 13) & (df.total_score < 19)).sum()}")
print(f"  C (8-12):  {((df.total_score >= 8) & (df.total_score < 13)).sum()}")

print("\n=== Score component means ===")
print(df[["seniority_score", "relevance_score", "industry_score",
         "network_score", "persona_fit_score", "intl_founder_score",
         "total_score"]].describe().loc[["mean", "min", "max"]])

# --- Where does the median candidate get their points from?
print("\n=== Median qualified candidate ===")
median = df["total_score"].median()
print(f"Median total_score = {median}")
median_band = df[df.total_score.between(median - 0.5, median + 0.5)].head(20)
print(median_band[["fullName", "total_score", "seniority_score", "relevance_score",
                   "industry_score", "network_score", "persona_fit_score",
                   "intl_founder_score", "linkedinJobTitle"]].to_string())

# --- What % of qualified contacts have ZERO genuine ecosystem signal?
no_eco = df[(~df.is_mes_tagged) & (~df.mes_company_match) & (df.intl_founder_score == 0)]
print(f"\nQualified contacts with NO genuine ecosystem signal "
      f"(no MES tag, no MES company, no intl founder): {len(no_eco)} ({100*len(no_eco)/len(df):.0f}%)")

# --- Where does the floor sit if we strip the 4 soft network signals?
# Each soft signal is 0.5; max free = 2.0. Recompute "tight" total = total - capped soft
# We don't have the breakdown stored, so estimate via the original network logic:
def soft_signal_value(row):
    """Estimate the soft signal points a row earned."""
    s = 0.0
    desc = row.get("linkedinDescription") or ""
    if isinstance(desc, str) and len(desc) >= 100:
        s += 0.5
    if isinstance(row.get("linkedinSkillsLabel"), str) and (row.get("linkedinSkillsLabel") or "").strip():
        s += 0.5
    try:
        if int(row.get("linkedinFollowersCount") or 0) >= 500:
            s += 0.5
    except (ValueError, TypeError):
        pass
    if (isinstance(row.get("professionalEmail1"), str) and (row.get("professionalEmail1") or "").strip()) or \
       (isinstance(row.get("personalEmail1"), str) and (row.get("personalEmail1") or "").strip()):
        s += 0.5
    return s

df["soft_signal_value"] = df.apply(soft_signal_value, axis=1)
print(f"\nMean soft_signal_value: {df['soft_signal_value'].mean():.2f}")
print(f"Distribution:")
print(df["soft_signal_value"].value_counts().sort_index())

# --- If we cap soft signals at 0.5 (only 1 out of 4 counts)
df["score_capped_soft_05"] = df.total_score - df["soft_signal_value"] + df["soft_signal_value"].clip(upper=0.5)
print(f"\n[Lever D-soft] Cap soft signals at 0.5 (was 2.0):")
print(f"  Qualified (>=8):  {(df.score_capped_soft_05 >= 8).sum()} (was 2827)")
print(f"  Qualified (>=10): {(df.score_capped_soft_05 >= 10).sum()}")
print(f"  Qualified (>=12): {(df.score_capped_soft_05 >= 12).sum()}")

# --- If we drop soft signals entirely
df["score_no_soft"] = df.total_score - df["soft_signal_value"]
print(f"\n[Lever D-strict] Drop soft signals entirely:")
print(f"  Qualified (>=8):  {(df.score_no_soft >= 8).sum()}")
print(f"  Qualified (>=10): {(df.score_no_soft >= 10).sum()}")
print(f"  Qualified (>=12): {(df.score_no_soft >= 12).sum()}")
print(f"  Qualified (>=14): {(df.score_no_soft >= 14).sum()}")

# --- Lever B: require minimum seniority >= 2
print(f"\n[Lever B-min seniority>=2]: {(df.seniority_score >= 2).sum()}")
print(f"[Lever B-min seniority>=3]: {(df.seniority_score >= 3).sum()}")
print(f"[Lever B-min seniority>=4]: {(df.seniority_score >= 4).sum()}")

# --- Lever C: require minimum relevance >= 2
print(f"\n[Lever C-min relevance>=2]: {(df.relevance_score >= 2).sum()}")
print(f"[Lever C-min relevance>=3]: {(df.relevance_score >= 3).sum()}")

# --- Lever F: AND of dimensions (require strong evidence in at least one place)
def has_strong_signal(row):
    return (
        (row["relevance_score"] >= 3 and row["seniority_score"] >= 3)
        or row["network_score"] >= 3
        or row["intl_founder_score"] >= 3
    )

df["has_strong"] = df.apply(has_strong_signal, axis=1)
print(f"\n[Lever F] Has strong signal (relevance>=3 AND seniority>=3) "
      f"OR network>=3 OR intl_founder>=3:")
print(f"  Total qualifying: {df['has_strong'].sum()}")

# --- Combined recommendation: floor >=12 + cap soft + require strong signal
df["score_tightened"] = df.total_score - df["soft_signal_value"] + df["soft_signal_value"].clip(upper=0.5)
combined = df[
    (df["score_tightened"] >= 12)
    & ((df["seniority_score"] >= 2))
    & (df["relevance_score"] >= 2)
    & (df["has_strong"])
]
print(f"\n[Combined: floor>=12 + soft cap 0.5 + seniority>=2 + relevance>=2 + strong signal]:")
print(f"  Qualified: {len(combined)}")
print(f"  Tier A (>=19, original total): {(combined.total_score >= 19).sum()}")
print(f"  Tier B (13-18, original total): {((combined.total_score >= 13) & (combined.total_score < 19)).sum()}")

# --- Show what's removed under tightening
removed = df[~df.index.isin(combined.index)]
print(f"\n  Removed: {len(removed)}")
print("  Sample of contacts removed by tightening (top by score):")
for _, r in removed.sort_values("total_score", ascending=False).head(15).iterrows():
    print(f"    {r.total_score:5.1f}  {r.fullName:<25} | {(r.linkedinJobTitle or '')[:35]:<35} | sen={r.seniority_score} rel={r.relevance_score} net={r.network_score} ecosys={'Y' if (r.is_mes_tagged or r.mes_company_match) else 'N'}")

# --- Quick win cohort under tightening
print(f"\n[Tightened Quick Wins target (>=17)]: {(df[df.has_strong].total_score >= 17).sum()}")

# Save per-row breakdown for later reference
df[["fullName", "total_score", "score_tightened", "score_no_soft",
    "seniority_score", "relevance_score", "industry_score",
    "network_score", "persona_fit_score", "intl_founder_score",
    "soft_signal_value", "is_mes_tagged", "mes_company_match", "has_strong"]].to_csv(
    ROOT / "tightening_diagnostic.csv", index=False
)
print(f"\nDiagnostic saved to tightening_diagnostic.csv")
