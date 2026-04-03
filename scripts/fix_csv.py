#!/usr/bin/env python3
"""
Fix misaligned rows in the Australian Angel Investors CSV.
Based on Airtable screenshot verification, 41 rows have column alignment issues.
"""

import csv
import io
import sys

# All 267 rows as correct 7-field tuples, based on Airtable screenshots.
# Fields: name, linkedin, sector_focus, investment_portfolio, cheque_size, headquarters, how_to_pitch
# Only the MISALIGNED rows are explicitly corrected here; correct rows are passed through.

# Map of row index (0-based) -> corrected fields tuple
FIXES = {
    # Row 7: Adrenalin Equity - was 8 fields, extra empty between portfolio & cheque
    6: ("Adrenalin Equity", "", "Industrial, aerospace, def...", "", "$50000 to $250000", "Sydney", "Pitch@adrenalinequity.com"),
    # Row 25: Andrew Wilson - was 8 fields, sector shifted to portfolio
    24: ("Andrew Wilson", "", "Defence Tech, Aboriginal ...", "Skoutli", "$2.5k-$10k", "Sydney", "wilkandconsulting@outlo..."),
    # Row 41: Brent Clark - was 8 fields, sector shifted to portfolio
    40: ("Brent Clark", "", "Fintech, Energy", "Eshares.com.au, GPayme...", "", "Sydney", ""),
    # Row 73: Debra Hall - was 6 fields, missing empty cheque
    72: ("Debra Hall", "https://www.linkedin.com/in/rugbymother/", "Generalist", "Valocity, Mindhive Global,...", "", "Auckland", "Not currently investing"),
    # Row 81: Exhort Ventures - was 8 fields, sector shifted to portfolio
    80: ("Exhort Ventures", "", "Sector agnostic, softwar...", "Fluency, Tikpay, Mary Tec...", "$150k", "Sydney", "fed@exhortventures.com"),
    # Row 94: Glenn Bartlett - was 8 fields, sector shifted to portfolio
    93: ("Glenn Bartlett", "", "Impact, Sustainability, Te...", "Monarc Global, Amber El...", "", "Sydney", "bartlett.glenn@gmail.com"),
    # Row 95: Glenn Butcher - was 8 fields + missing email
    94: ("Glenn Butcher", "", "", "", "", "Perth", "glenn@thegrowthexecs.c..."),
    # Row 102: Hugh Stephens - was 8 fields, sector shifted to portfolio
    101: ("Hugh Stephens", "", "B2B SaaS", "Audience Republic, Wagg...", "", "Melbourne", ""),
    # Row 105: Impact Angel Network - was 9 fields
    104: ("Impact Angel Network", "", "Social and environmental ...", "", "$100K", "Melbourne", ""),
    # Row 107: Jacob Kino - was 9 fields
    106: ("Jacob Kino", "", "All", "", "", "Melbourne", "jacob@shinjukugroup.co..."),
    # Row 108: Jaffy Chen - was 8 fields
    107: ("Jaffy Chen", "https://www.linkedin.com/in/jafflychen/", "", "", "", "Sydney", "hello@jaffy.com"),
    # Row 114: Jayden Basha - was 9 fields
    113: ("Jayden Basha", "", "B2B SaaS", "", "", "Sydney", "jaydenpbasha@gmail.com"),
    # Row 115: Jeremy Goldschmidt - was 8 fields
    114: ("Jeremy Goldschmidt", "https://www.linkedin.com/in/jeremy-goldschmidt-6...", "All - experience with Prop...", "", "", "Sydney", "jeremy.g@rentbetter.com...."),
    # Row 121: Jonathan Lay - was 10 fields
    120: ("Jonathan Lay", "", "B2B SaaS, enterprise soft...", "", "$5m-$25m", "Sydney", "jonathan.lay@macquarie...."),
    # Row 122: Jonny Levi - was 6 fields, missing empty portfolio
    121: ("Jonny Levi", "https://www.linkedin.com/in/jonnylevi/", "Industry Agnostic but mu...", "", "Up to $15k", "Byron Bay", "jonny@planetearthventur..."),
    # Row 125: Juan Bejjani - was 8 fields
    124: ("Juan Bejjani", "https://www.linkedin.com/in/juanbeijjani/", "Clean Tech, SaaS, Impact...", "", "$10k-$25k", "Sydney", ""),
    # Row 147: Lynton J Pipkorn - was 9 fields
    146: ("Lynton J Pipkorn", "", "FinTech, InsurTech, Ecom...", "", "$5k-$50k", "Melbourne", "Pippaslyntonis@gmail.com"),
    # Row 148: M8 Ventures - was 8 fields
    147: ("M8 Ventures", "", "No sector focus. Focusin...", "", "$AUD$50-200k", "Sydney", "Apply online."),
    # Row 153: Marc Schwartz - was 9 fields
    152: ("Marc Schwartz", "", "All", "", "", "Sydney", "mschwartzz@gmail.com"),
    # Row 154: Marc Sofer - was 6 fields, missing empty cheque
    153: ("Marc Sofer", "https://www.linkedin.com/in/marc-sofer-937162184/", "All sectors with a focus o...", "Humble Bee, Ping, Vaulta,...", "", "Byron Bay", "pitch@byron.ventures"),
    # Row 155: Mark Ghiasy - was 8 fields
    154: ("Mark Ghiasy", "", "B2B SaaS", "Insightech, sumo logic", "$25k", "Sydney", "Mark.ghiasy@gmail.com"),
    # Row 160: Matt Bauer - was 8 fields
    159: ("Matt Bauer", "", "Sector Agnostic", "Functionly, PUSHAS, Cart...", "$5k-$25k", "Adelaide", "investments at lachmill d..."),
    # Row 162: Matt Evans - was 8 fields, NA shifted
    161: ("Matt Evans", "NA", "SAAS, AI-ML, Dev Tools, ...", "https://angel.co/u/mattev...", "$10k-$35k", "California", "khuluinja@gmail.com"),
    # Row 168: Michael Gonski - was 8 fields
    167: ("Michael Gonski", "", "All", "Propeller Aero, Instaclustr...", "", "Sydney", "michael.gonski@hsf.com"),
    # Row 172: Mike Cannon-Brookes - was 8 fields + missing email
    171: ("Mike Cannon-Brookes", "", "", "https://twitter.com/i/lists/7...", "", "Sydney", "hi@grok.ventures"),
    # Row 173: Muhilan Sriravindrarajah - was 8 fields
    172: ("Muhilan Sriravindrarajah", "www.linkedin.com/in/muhilans", "ClimateTech, EdTech, Me...", "", "", "Sydney", "muhilan_s@hotmail.com"),
    # Row 183: Nullarbor Ventures - was 8 fields
    182: ("Nullarbor Ventures", "", "Agnostic", "Mr Yum, Superhero, Kom...", "$10-20k", "Sydney", "nullarborventures@gmail...."),
    # Row 191: Peter Davis - missing pitch URL (was 7 fields but pitch empty)
    190: ("Peter Davis Davis Enterp...", "https://www.linkedin.com/in/peterdavisau/", "Sector agnostic - current ...", "Puralink, Aquila, Fluency, ...", "$20-$40K", "Sydney", "https://www.linkedin.com/..."),
    # Row 195: Rafael Kimberley-Bowen - was 8 fields
    194: ("Rafael Kimberley-Bowen", "https://au.linkedin.com/in/rafkb", "B2C, SaaS, Fintech", "", "", "Perth", "raf@scale.partners"),
    # Row 206: Rolf Weber - was 8 fields
    205: ("Rolf Weber", "", "Health, AI, saas models, t...", "", "25-100k", "Sydney", "rolf@mannabeach.com"),
    # Row 211: Sam Bird - was 8 fields
    210: ("Sam Bird", "", "All", "Spriggy", "> 100K", "Sydney", "samuelj.bird@gmail.com"),
    # Row 214: Sam Savis - was 8 fields
    213: ("Sam Savis", "", "Climate Tech, AI, FinTech,...", "ZeroCO", "<=10K", "Melbourne", "ssavis@kpmg.com.au"),
    # Row 217: Screen Angels - was 8 fields
    216: ("Screen Angels", "", "Media, Film, & Television", "", "$2,500 - $10,000", "Sydney", "Contact@screenangels.c..."),
    # Row 218: Sebastien Eckersley-Maslin - was 8 fields
    217: ("Sebastien Eckersley-Maslin", "https://www.linkedin.com/in/sebeckmas/", "Most", "", "", "Sydney", ""),
    # Row 223: Simran Gambhir - was 8 fields
    222: ("Simran Gambhir", "http://linkedin.com/in/simrang", "", "Pushstart (TinyBeans, We...", "", "Sydney", "simran@dn.gs"),
    # Row 249: Tribe Global Ventures - was 8 fields
    248: ("Tribe Global Ventures", "", "B2B ventures expanding t...", "", "$200k-$1.5m", "Brisbane", "hello@tribeglobal.vc"),
    # Row 250: Troy Harper - was 8 fields
    249: ("Troy Harper", "", "Mining, Technology, Energy", "Cafe X, Neybourly, Adyto...", "$50k", "Brisbane", "troy@tragal.co"),
    # Row 255: Utilism - was 9 fields
    254: ("Utilism", "", "B2B, Fintech + ESG", "Buildkite, Cake, Weel, Pro...", "10-100k", "Sydney", "hello@utilism.com"),
    # Row 260: Victoria Lee - was 9 fields
    259: ("Victoria Lee", "", "Energy ; education ; aged...", "", "", "Sydney", "Viclee288@gmail.com"),
    # Row 265: West Tech Investor Network - was 8 fields
    264: ("West Tech Investor Netw...", "", "Agnostic", "Grow Impact, Procuracon", "$5k", "Perth", ""),
    # --- Additional 29 rows discovered by parser ---
    # Row 43: Brisbane Angels - extra empty
    42: ("Brisbane Angels", "", "", "50+", "", "Brisbane", ""),
    # Row 76: Electrifi Ventures - extra empty
    75: ("Electrifi Ventures", "", "Climate Tech", "", "$150k - $400K", "Sydney", "hello@electrifi.ventures"),
    # Row 83: Flying Fox Ventures - extra empty
    82: ("Flying Fox Ventures", "", "", "", "", "Sydney", ""),
    # Row 87: Garry Visontay - extra empty
    86: ("Garry Visontay", "https://www.linkedin.com/in/garryvisontay", "Software", "", "", "Sydney", ""),
    # Row 89: Geelong Angels - extra empty
    88: ("Geelong Angels", "", "", "Kesem Health, Monnie Lt...", "", "Geelong", ""),
    # Row 119: John Henderson - extra empty
    118: ("John Henderson", "https://www.linkedin.com/in/johnhenderson/", "Generalist", "", "", "Sydney", "john at airtree dot vc"),
    # Row 128: Justin Dry - extra empty
    127: ("Justin Dry", "https://www.linkedin.com/in/justindry/", "All", "", "", "Melbourne", ""),
    # Row 132: Kath Purkis - extra empty
    131: ("Kath Purkis", "https://au.linkedin.com/in/kathpurkis", "Retail technology, e-com...", "", "$50K", "Sydney", "Kp@kathpurkis.com"),
    # Row 140: Leila Oliveira - extra empty
    139: ("Leila Oliveira", "https://www.linkedin.com/in/leilaneoliveira/", "", "", "", "Melbourne", ""),
    # Row 144: Lumpur Kuo - extra empty
    143: ("Lumpur Kuo", "https://www.linkedin.com/in/lumpurkuo/", "", "", "", "Sydney", ""),
    # Row 146: Lyndal Thorburn - extra empty
    145: ("Lyndal Thorburn", "https://au.linkedin.com/in/lyndalthorburn", "", "Enabled Employment, Sig...", "", "Canberra", ""),
    # Row 149: Madeleine Grummet - extra empty
    148: ("Madeleine Grummet", "https://www.linkedin.com/in/madeleinegrummet/", "", "", "", "Melbourne", ""),
    # Row 151: Mandi Gunsberger - extra empty
    150: ("Mandi Gunsberger", "https://www.linkedin.com/in/mandigunsberger/", "Not sector specific", "", "", "Sydney", "mandi@mandigunsberger..."),
    # Row 164: Matthew Karakinos - extra empty
    163: ("Matthew Karakinos", "https://au.linkedin.com/in/matthew-karakinos-7758...", "", "", "$5k-$25k", "Melbourne", "mkarakinos@gmail.com"),
    # Row 179: Nick Moutzouris - extra empty
    178: ("Nick Moutzouris", "https://www.linkedin.com/in/nick-moutzouris-821a3...", "", "", "", "Melbourne", "nickmoutzouris1@gmail.c..."),
    # Row 187: PB Ventures - $25,000 split by comma
    186: ("PB Ventures", "https://www.linkedin.com/in/kanetempleton/", "B2bsaas, Fintech, Healtht...", "10 so far. EntryLevel, GG...", "$25,000", "Gold Coast", "kane@cakeequity.com"),
    # Row 199: Rebecca Ren - extra empty
    198: ("Rebecca Ren", "linkedin.com/in/rebeccaren", "Tech, Web3", "", "", "Sydney", "yren8742@gmail.com"),
    # Row 202: Robbie Sita - extra empty
    201: ("Robbie Sita", "https://www.linkedin.com/in/robbiesita/", "B2B SaaS, RegTech, Lega...", "", "", "Melbourne", "robsita91@gmail.com"),
    # Row 205: Rohit Bhargava - extra empty
    204: ("Rohit Bhargava", "https://www.linkedin.com/in/rohbhargava/", "", "", "", "Melbourne", "rohit@startupplaybook.co"),
    # Row 208: Rosanna Biggs - extra empty
    207: ("Rosanna Biggs", "https://www.linkedin.com/in/rosanna-biggs-567754...", "Legal and ecommerce", "", "", "Sydney", "rosanna.biggs@hotmail.c..."),
    # Row 209: Rui Rodrigues - extra empty
    208: ("Rui Rodrigues", "https://www.linkedin.com/in/ruirodriguesf1/", "Tech, deep tech, self drivi...", "", "", "Sydney", ""),
    # Row 220: Sharif Sethi - $25,000 split by comma
    219: ("Sharif Sethi", "linkedin.com/in/sharif-sethi", "Health & Medical, Energy,...", "Autram, Moxion, Venueno...", "Up to $25,000", "Brisbane", "sharif.sethi@iinet.net.au"),
    # Row 222: Simon Keeling - extra empty
    221: ("Simon Keeling", "https://www.linkedin.com/in/simonkeeling/", "Mainly focus on: Tech, Cr...", "", "", "Sydney", ""),
    # Row 228: SPV Ventures - portfolio split by comma
    227: ("SPV Ventures", "https://www.linkedin.com/in/mathewtbenjamin/", "Deglobalization, decorbo...", "Cortical Labs Stealth,...", "US$250k-$2M", "Sydney", ""),
    # Row 229: Srikanth Muthyala - extra empty
    228: ("Srikanth Muthyala", "https://www.linkedin.com/in/srikanthmm/", "SaaS, FinTech, AI", "", "$10-50k", "Melbourne", "invest@shavik.ai"),
    # Row 234: SunCoast Angels - extra empty
    233: ("SunCoast Angels", "https://www.linkedin.com/company/suncoast-angels", "All", "", "", "Sunshine Coast", "admin@suncoastangels.c..."),
    # Row 236: Sydney Angels - extra empty
    235: ("Sydney Angels", "https://www.linkedin.com/company/sydney-angels/", "All", "", "", "Sydney", ""),
    # Row 238: The Saljar Group - extra empty
    237: ("The Saljar Group", "", "", "", "", "Sydney", "investment@saljar.com"),
    # Row 252: Tuan-Anh Tran - extra empty
    251: ("Tuan-Anh Tran", "https://www.linkedin.com/in/tuananhoxon/", "Food + Agri, Energy, Indu...", "", "", "Sydney", "tuananh.tran@oxon.org"),
}

# Row 267: Zoe Keck - completely missing from CSV
ZOE_KECK = ("Zoe Keck", "www.linkedin.com/in/zoekeck", "SaaS, Tech, Health/Wellness, FemT...", "", "", "Sydney", "")


def main():
    # Read the original CSV from stdin or file
    input_file = sys.argv[1] if len(sys.argv) > 1 else "/home/user/market-entry-secrets/australian_angel_investors_original.csv"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "/home/user/market-entry-secrets/australian_angel_investors_corrected.csv"

    with open(input_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse with csv module
    reader = csv.reader(io.StringIO(content))
    rows = list(reader)

    header = rows[0]
    data_rows = rows[1:]

    print(f"Original CSV: {len(data_rows)} data rows")
    print(f"Header: {header}")

    # Report issues
    issues = []
    for i, row in enumerate(data_rows):
        if len(row) != 7:
            issues.append((i, len(row), row[0] if row else "???"))

    print(f"\nRows with != 7 fields: {len(issues)}")
    for idx, field_count, name in issues:
        fix_status = "WILL FIX" if idx in FIXES else "NO FIX DEFINED"
        print(f"  Row {idx+1} ({name}): {field_count} fields - {fix_status}")

    # Apply fixes
    corrected = [header]
    for i, row in enumerate(data_rows):
        if i in FIXES:
            corrected.append(list(FIXES[i]))
        else:
            if len(row) != 7:
                print(f"  WARNING: Row {i+1} ({row[0]}) has {len(row)} fields but no fix defined!")
            corrected.append(row)

    # Add missing Zoe Keck
    corrected.append(list(ZOE_KECK))

    # Write corrected CSV
    with open(output_file, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(corrected)

    print(f"\nCorrected CSV written: {len(corrected)-1} data rows (including added Zoe Keck)")

    # Verify all rows have 7 fields
    bad = [(i+1, len(r)) for i, r in enumerate(corrected[1:]) if len(r) != 7]
    if bad:
        print(f"ERROR: {len(bad)} rows still have wrong field count:")
        for row_num, count in bad:
            print(f"  Row {row_num}: {count} fields")
    else:
        print("VERIFIED: All rows have exactly 7 fields ✓")


if __name__ == "__main__":
    main()
