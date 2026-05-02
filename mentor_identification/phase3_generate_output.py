"""
Phase 3: Apply Recipe Y filter (archetype + score floor 14) and produce the
final mes_mentor_candidates.xlsx + .csv + supporting sheets.

Inputs:
  archetype_classification.csv  (from archetype_simulator.py)

Outputs:
  mes_mentor_candidates.xlsx
  mes_mentor_candidates.csv
"""
from collections import Counter
from pathlib import Path

import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.utils.dataframe import dataframe_to_rows

ROOT = Path(__file__).parent
df = pd.read_csv(ROOT / "archetype_classification.csv", dtype=str, keep_default_na=False)

# Numeric columns
for col in ["total_score", "seniority_score", "relevance_score", "industry_score",
            "network_score", "persona_fit_score", "intl_founder_score",
            "linkedinFollowersCount"]:
    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

# Boolean columns (CSV stores as 'True'/'False')
for col in ["is_founder", "already_in_google_sheet", "already_in_supabase",
            "is_mes_tagged", "mes_company_match", "any_archetype",
            "archetype_advisor", "archetype_csuite_sector",
            "archetype_trade_gov", "archetype_intl_founder",
            "has_scale_signal"]:
    df[col] = df[col].astype(str).str.lower().isin(["true", "1"])

# ---------------------------------------------------------------------------
# Apply Recipe Y filter: archetype + score >= 14
# ---------------------------------------------------------------------------
qualified = df[df["any_archetype"] & (df["total_score"] >= 14)].copy()
print(f"Recipe Y qualified: {len(qualified)}")

# Re-tier within the new pool (no C tier — floor is 14, not 8)
def assign_rating(score):
    if score >= 19:
        return "A"
    if score >= 17:
        return "B+"
    return "B"
qualified["rating"] = qualified["total_score"].apply(assign_rating)

# Build "archetypes" string for visibility
def archetype_label(row):
    a = []
    if row["archetype_advisor"]:        a.append("Advisor")
    if row["archetype_csuite_sector"]:  a.append("C-Suite/Founder")
    if row["archetype_trade_gov"]:      a.append("Trade/Gov")
    if row["archetype_intl_founder"]:   a.append("Intl Founder")
    return " + ".join(a)
qualified["archetypes"] = qualified.apply(archetype_label, axis=1)

# Sort
qualified = qualified.sort_values(
    by=["total_score", "rating"], ascending=[False, True]
).reset_index(drop=True)

# Final column order matching the spec
COLUMNS = [
    "fullName", "rating", "total_score", "archetypes", "reasoning",
    "seniority_score", "relevance_score", "industry_score", "network_score",
    "persona_fit_score", "intl_founder_score",
    "is_founder", "origin_country", "origin_signals",
    "persona_fit_label", "mentor_category",
    "linkedinJobTitle", "companyName", "companyIndustry", "location",
    "linkedinHeadline", "linkedinProfileUrl",
    "professionalEmail1", "personalEmail1",
    "linkedinDescription", "linkedinSkillsLabel",
    "keyword_matches",
    "already_in_google_sheet", "already_in_supabase",
    "is_mes_tagged", "mes_company_match", "mes_company_name",
    "mes_company_source", "mes_company_match_type",
    "linkedinFollowersCount", "previousCompanyName",
    "linkedinSchoolName", "linkedinPreviousSchoolName",
]

# Truncate description / skills to spec
qualified["linkedinDescription"] = qualified["linkedinDescription"].astype(str).str[:500]
qualified["linkedinSkillsLabel"] = qualified["linkedinSkillsLabel"].astype(str).str[:300]

main = qualified[COLUMNS].copy()

# ---------------------------------------------------------------------------
# Save CSV
# ---------------------------------------------------------------------------
csv_path = ROOT / "mes_mentor_candidates.csv"
main.to_csv(csv_path, index=False)
print(f"Saved CSV: {csv_path} ({len(main)} rows)")

# ---------------------------------------------------------------------------
# Build xlsx with multiple sheets
# ---------------------------------------------------------------------------
xlsx_path = ROOT / "mes_mentor_candidates.xlsx"

wb = Workbook()
wb.remove(wb.active)  # remove default sheet

# --- Sheet 1: Mentor Candidates ----------------------------------------------
ws_main = wb.create_sheet("Mentor Candidates")
for r in dataframe_to_rows(main, index=False, header=True):
    ws_main.append(r)

# Format header row
header_font = Font(bold=True, color="FFFFFF")
header_fill = PatternFill("solid", fgColor="1F4E79")
for cell in ws_main[1]:
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
ws_main.row_dimensions[1].height = 32
ws_main.freeze_panes = "A2"

# Conditional fill by rating (column B)
fill_a   = PatternFill("solid", fgColor="C6EFCE")  # green
fill_bp  = PatternFill("solid", fgColor="FFEB9C")  # yellow
fill_b   = PatternFill("solid", fgColor="EAEAEA")  # light grey
rating_col_idx = COLUMNS.index("rating") + 1
for row_num in range(2, ws_main.max_row + 1):
    rating = ws_main.cell(row=row_num, column=rating_col_idx).value
    fill = {"A": fill_a, "B+": fill_bp, "B": fill_b}.get(rating)
    if fill:
        for col_num in range(1, len(COLUMNS) + 1):
            ws_main.cell(row=row_num, column=col_num).fill = fill

# Auto-width (with caps)
for col_idx, col_name in enumerate(COLUMNS, start=1):
    width_cap = 60 if col_name in {"reasoning", "linkedinHeadline",
                                   "linkedinDescription", "linkedinSkillsLabel",
                                   "keyword_matches", "linkedinJobTitle"} else 30
    max_len = max(len(col_name), main[col_name].astype(str).str.len().max() or 0)
    ws_main.column_dimensions[get_column_letter(col_idx)].width = min(max_len + 2, width_cap)

# --- Sheet 2: Summary --------------------------------------------------------
ws_sum = wb.create_sheet("Summary")

def write_section(ws, title, rows, start_row):
    ws.cell(row=start_row, column=1, value=title).font = Font(bold=True, size=12)
    r = start_row + 1
    for label, value in rows:
        ws.cell(row=r, column=1, value=label)
        ws.cell(row=r, column=2, value=value)
        r += 1
    return r + 1

next_row = 1
next_row = write_section(ws_sum, "Tier counts", [
    ("Total qualified (Recipe Y)", len(main)),
    ("Tier A (>=19)", (main["rating"] == "A").sum()),
    ("Tier B+ (17-18)", (main["rating"] == "B+").sum()),
    ("Tier B (14-16)", (main["rating"] == "B").sum()),
    ("Quick Wins (>=17)", (main["total_score"] >= 17).sum()),
], next_row)

next_row = write_section(ws_sum, "By archetype (overlapping)", [
    ("Active Advisor", qualified["archetype_advisor"].sum()),
    ("Experienced C-Suite/Founder", qualified["archetype_csuite_sector"].sum()),
    ("Trade & Government", qualified["archetype_trade_gov"].sum()),
    ("International Founder", qualified["archetype_intl_founder"].sum()),
], next_row)

# Mentor category
cat_counts = main["mentor_category"].value_counts()
next_row = write_section(ws_sum, "Mentor category (primary)",
    [(c, n) for c, n in cat_counts.items()], next_row)

# Persona fit label
pf_counts = main["persona_fit_label"].value_counts()
next_row = write_section(ws_sum, "Persona fit label",
    [(c, n) for c, n in pf_counts.items()], next_row)

# Intl founders by origin
intl = qualified[qualified["intl_founder_score"] >= 3]
intl_by_origin = intl.groupby("origin_country").size().sort_values(ascending=False)
next_row = write_section(ws_sum, "International founders by origin (>=3 score)",
    [(c, int(n)) for c, n in intl_by_origin.items()], next_row)

# Top industries
ind_counts = main["companyIndustry"].value_counts().head(15)
next_row = write_section(ws_sum, "Top 15 industries",
    [(c, int(n)) for c, n in ind_counts.items()], next_row)

# Top companies
co_counts = main["companyName"].value_counts().head(15)
next_row = write_section(ws_sum, "Top 15 companies",
    [(c, int(n)) for c, n in co_counts.items()], next_row)

# Locations
loc_counts = main["location"].value_counts().head(10)
next_row = write_section(ws_sum, "Top 10 locations",
    [(c, int(n)) for c, n in loc_counts.items()], next_row)

# MES tag / company match
next_row = write_section(ws_sum, "Ecosystem signal counts", [
    ("MES-tagged in network", main["is_mes_tagged"].sum()),
    ("MES company match (current/previous)", main["mes_company_match"].sum()),
], next_row)

ws_sum.column_dimensions["A"].width = 50
ws_sum.column_dimensions["B"].width = 20
ws_sum.freeze_panes = "A2"

# --- Sheet 3: International Founders ----------------------------------------
ws_intl = wb.create_sheet("International Founders")
intl_cols = ["fullName", "rating", "total_score", "archetypes",
             "intl_founder_score", "origin_country", "origin_signals",
             "linkedinJobTitle", "companyName", "location",
             "linkedinProfileUrl", "professionalEmail1", "personalEmail1",
             "reasoning"]
intl_df = qualified[qualified["intl_founder_score"] >= 3][intl_cols].copy()
intl_df = intl_df.sort_values(by=["origin_country", "total_score"],
                              ascending=[True, False]).reset_index(drop=True)

for r in dataframe_to_rows(intl_df, index=False, header=True):
    ws_intl.append(r)
for cell in ws_intl[1]:
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
ws_intl.row_dimensions[1].height = 32
ws_intl.freeze_panes = "A2"
for col_idx, col_name in enumerate(intl_cols, start=1):
    width_cap = 60 if col_name in {"reasoning", "linkedinJobTitle"} else 30
    max_len = max(len(col_name), intl_df[col_name].astype(str).str.len().max() or 0)
    ws_intl.column_dimensions[get_column_letter(col_idx)].width = min(max_len + 2, width_cap)

# --- Sheet 4: Quick Wins ----------------------------------------------------
ws_qw = wb.create_sheet("Quick Wins")
qw_cols = ["fullName", "rating", "total_score", "archetypes",
           "mentor_category", "origin_country",
           "linkedinJobTitle", "companyName", "location",
           "linkedinProfileUrl", "professionalEmail1", "personalEmail1",
           "reasoning"]
qw_df = qualified[qualified["total_score"] >= 17][qw_cols].copy()
qw_df = qw_df.sort_values(by="total_score", ascending=False).head(50).reset_index(drop=True)

for r in dataframe_to_rows(qw_df, index=False, header=True):
    ws_qw.append(r)
for cell in ws_qw[1]:
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
ws_qw.row_dimensions[1].height = 32
ws_qw.freeze_panes = "A2"
for col_idx, col_name in enumerate(qw_cols, start=1):
    width_cap = 60 if col_name in {"reasoning", "linkedinJobTitle"} else 30
    max_len = max(len(col_name), qw_df[col_name].astype(str).str.len().max() or 0)
    ws_qw.column_dimensions[get_column_letter(col_idx)].width = min(max_len + 2, width_cap)

# --- Sheet 5+: Per-archetype tabs -------------------------------------------
def add_archetype_sheet(name, mask, cols=None):
    cols = cols or ["fullName", "rating", "total_score", "archetypes",
                    "mentor_category", "linkedinJobTitle", "companyName",
                    "companyIndustry", "location", "linkedinProfileUrl",
                    "professionalEmail1", "personalEmail1", "reasoning"]
    sub = qualified[mask][cols].sort_values("total_score", ascending=False).reset_index(drop=True)
    ws = wb.create_sheet(name[:31])  # Excel sheet name limit is 31 chars
    for r in dataframe_to_rows(sub, index=False, header=True):
        ws.append(r)
    for cell in ws[1]:
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    ws.row_dimensions[1].height = 32
    ws.freeze_panes = "A2"
    for col_idx, col_name in enumerate(cols, start=1):
        width_cap = 60 if col_name in {"reasoning", "linkedinJobTitle"} else 30
        max_len = max(len(col_name), sub[col_name].astype(str).str.len().max() or 0)
        ws.column_dimensions[get_column_letter(col_idx)].width = min(max_len + 2, width_cap)
    print(f"  Tab {name}: {len(sub)} rows")

print("Per-archetype tabs:")
add_archetype_sheet("By Archetype - Advisor", qualified["archetype_advisor"])
add_archetype_sheet("By Archetype - C-Suite Founder", qualified["archetype_csuite_sector"])
add_archetype_sheet("By Archetype - Trade Gov", qualified["archetype_trade_gov"])
add_archetype_sheet("By Archetype - Intl Founder", qualified["archetype_intl_founder"])

wb.save(xlsx_path)
print(f"\nSaved xlsx: {xlsx_path}")
print(f"  Total sheets: {len(wb.sheetnames)}")
print(f"  Sheets: {wb.sheetnames}")
print(f"\nFinal Recipe Y output: {len(main)} contacts")
print(f"  Tier A (>=19):  {(main['rating']=='A').sum()}")
print(f"  Tier B+ (17-18): {(main['rating']=='B+').sum()}")
print(f"  Tier B (14-16):  {(main['rating']=='B').sum()}")
print(f"  Quick Wins (>=17): {(main['total_score']>=17).sum()}")
print(f"  Intl Founders:   {len(intl_df)}")
