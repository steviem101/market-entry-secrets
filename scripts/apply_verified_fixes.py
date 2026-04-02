#!/usr/bin/env python3
"""
Apply 30 verified fixes to australian_angel_investors_corrected.csv.
Only fixes that have been verified via web search with citable sources.

Sources documented inline for each fix.
"""

import csv
import sys

INPUT = "australian_angel_investors_corrected.csv"
OUTPUT = "australian_angel_investors_enriched.csv"

# --- VERIFIED FIXES ---
# Format: row_number (1-based data row, excluding header) -> (column_index, new_value, source)
# Column indices: 0=name, 1=linkedin, 2=sector, 3=portfolio, 4=cheque, 5=location, 6=email

FIXES = {
    # === 6 TRUNCATED NAMES (column 0) ===
    # Source: https://energylab.org.au/angel-group/
    80: (0, "EnergyLab Cleantech Angel Network"),
    # Source: https://au.linkedin.com/company/davisenterprisesholdings
    191: (0, "Peter Davis, Davis Enterprises Holdings"),
    # Source: https://angelmatch.io/investors/spencer-cole
    227: (0, "Spencer Cole / Mineral Royalties Online"),
    # Source: https://app.aussieangels.com/syndicate/torus-previously-known-palm-beach-ventures
    246: (0, "TORUS (previously Palm Beach Ventures)"),
    # Source: https://www.triviancapital.com/team
    264: (0, "Web3 VC Coinvestment Syndicate"),
    # Source: https://app.aussieangels.com/syndicate/west-tech-investor-network
    265: (0, "West Tech Investor Network"),

    # === 1 TRUNCATED LOCATION (column 5) ===
    # Source: https://melbourneangels.com/
    166: (5, "Southbank VIC"),

    # === 1 TRUNCATED EMAIL (column 6) ===
    # Source: https://www.crunchbase.com/person/jo-burston-2 / https://www.inspiringrarebirds.com/
    116: (6, "jo.burston@inspiringrarebirds.com"),

    # === 1 TRUNCATED CHEQUE SIZE (column 4) ===
    # Source: https://www.byronbayangels.com
    44: (4, "$100,000 - $500,000"),
}

# === 21 TRUNCATED LINKEDIN URLS (column 1) ===
# All verified via LinkedIn web search results
LINKEDIN_FIXES = {
    # Source: LinkedIn search -> https://au.linkedin.com/in/dr-amandeep-hansra-b2092623
    20: "https://au.linkedin.com/in/dr-amandeep-hansra-b2092623",
    # Source: LinkedIn search -> https://au.linkedin.com/in/ariane-barker-098ba02b
    28: "https://au.linkedin.com/in/ariane-barker-098ba02b",
    # Source: LinkedIn search -> https://au.linkedin.com/company/medicalangels-au
    31: "https://au.linkedin.com/company/medicalangels-au",
    # Source: LinkedIn search -> https://www.linkedin.com/in/benjamin-thomas-kennedy-a5401966
    33: "https://www.linkedin.com/in/benjamin-thomas-kennedy-a5401966",
    # Source: LinkedIn search -> https://www.linkedin.com/company/blossom-capital-partners
    36: "https://www.linkedin.com/company/blossom-capital-partners",
    # Source: LinkedIn search -> https://au.linkedin.com/company/cut-through-venture
    59: "https://au.linkedin.com/company/cut-through-venture",
    # Source: LinkedIn search -> https://au.linkedin.com/in/danieldavidmurray
    63: "https://au.linkedin.com/in/danieldavidmurray",
    # Source: LinkedIn search -> https://www.linkedin.com/company/ecotone-ventures
    74: "https://www.linkedin.com/company/ecotone-ventures",
    # Source: LinkedIn search -> https://au.linkedin.com/company/energylab-international
    80: "https://au.linkedin.com/company/energylab-international",
    # Source: LinkedIn search -> https://www.linkedin.com/in/gavin-ezekowitz-966a29a
    88: "https://www.linkedin.com/in/gavin-ezekowitz-966a29a",
    # Source: LinkedIn search -> https://www.linkedin.com/in/jeremy-goldschmidt-6406ba2
    115: "https://www.linkedin.com/in/jeremy-goldschmidt-6406ba2",
    # Source: LinkedIn search -> https://www.linkedin.com/in/kristy-chong-oam-3b21357
    135: "https://www.linkedin.com/in/kristy-chong-oam-3b21357",
    # Source: LinkedIn search -> https://www.linkedin.com/in/lawrence-wen-5650011b
    139: "https://www.linkedin.com/in/lawrence-wen-5650011b",
    # Source: LinkedIn search -> https://au.linkedin.com/in/matthew-karakinos-77587b74
    164: "https://au.linkedin.com/in/matthew-karakinos-77587b74",
    # Source: LinkedIn search -> https://www.linkedin.com/in/michael-coleman-40698815
    167: "https://www.linkedin.com/in/michael-coleman-40698815",
    # Source: LinkedIn search -> https://www.linkedin.com/in/nick-moutzouris-821a3b129
    179: "https://www.linkedin.com/in/nick-moutzouris-821a3b129",
    # Source: LinkedIn search -> https://www.linkedin.com/in/paul-tontodonati-1976801b
    186: "https://www.linkedin.com/in/paul-tontodonati-1976801b",
    # Source: LinkedIn search -> https://au.linkedin.com/company/playbook-ventures
    193: "https://au.linkedin.com/company/playbook-ventures",
    # Source: LinkedIn search -> https://www.linkedin.com/in/rosanna-biggs-56775477
    208: "https://www.linkedin.com/in/rosanna-biggs-56775477",
    # Source: LinkedIn search -> https://au.linkedin.com/company/something-real-ventures
    224: "https://au.linkedin.com/company/something-real-ventures",
    # Source: LinkedIn search -> https://au.linkedin.com/company/venturecrowd-pty-ltd
    257: "https://au.linkedin.com/company/venturecrowd-pty-ltd",
}


def main():
    rows = []
    with open(INPUT, "r", newline="") as f:
        reader = csv.reader(f)
        header = next(reader)
        rows.append(header)
        for i, row in enumerate(reader, 1):
            # Apply single-column fixes
            if i in FIXES:
                col_idx, new_val = FIXES[i]
                old_val = row[col_idx]
                row[col_idx] = new_val
                print(f"Row {i} col {col_idx}: '{old_val}' -> '{new_val}'")

            # Apply LinkedIn fixes
            if i in LINKEDIN_FIXES:
                old_val = row[1]
                row[1] = LINKEDIN_FIXES[i]
                print(f"Row {i} LinkedIn: '{old_val}' -> '{LINKEDIN_FIXES[i]}'")

            rows.append(row)

    with open(OUTPUT, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(rows)

    print(f"\nDone. Wrote {len(rows)-1} data rows to {OUTPUT}")


if __name__ == "__main__":
    main()
