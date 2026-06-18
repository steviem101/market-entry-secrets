/**
 * Sector taxonomy for the matcher (Phase D).
 *
 * Mirrors src/constants/linkedinTaxonomy.ts: the intake form collects LinkedIn
 * industry GROUPS (152); directory rows are tagged with the 20 LinkedIn parent
 * SECTORS (as slugs). This module rolls groups up to sector slugs so the matcher
 * can compute sector overlap.
 *
 * Pure module — no Deno globals — importable by the Deno function AND a Node test.
 * The slug derivation must stay identical to the SQL migration's 20-sector slugs.
 */

// sector display name → its industry groups (the 152 selectable values)
const LINKEDIN_TAXONOMY: Record<string, string[]> = {
  'Accommodation and Food Services': ['Food and Beverage Services', 'Hospitality'],
  'Administrative and Support Services': ['Collection Agencies', 'Events Services', 'Facilities Services', 'Fundraising', 'Office Administration', 'Security and Investigations', 'Staffing and Recruiting', 'Telephone Call Centers', 'Translation and Localization', 'Travel Arrangements', 'Writing and Editing'],
  'Construction': ['Building Construction', 'Civil Engineering', 'Specialty Trade Contractors'],
  'Consumer Services': ['Civic and Social Organizations', 'Household Services', 'Non-profit Organizations', 'Personal and Laundry Services', 'Philanthropic Fundraising Services', 'Religious Institutions', 'Repair and Maintenance'],
  'Education': ['E-Learning Providers', 'Higher Education', 'Primary and Secondary Education', 'Professional Training and Coaching', 'Technical and Vocational Training'],
  'Entertainment Providers': ['Artists and Writers', 'Museums, Historical Sites, and Zoos', 'Musicians', 'Performing Arts and Spectator Sports', 'Recreational Facilities', 'Spectator Sports'],
  'Farming, Ranching, Forestry': ['Farming', 'Ranching and Fisheries', 'Forestry and Logging'],
  'Financial Services': ['Capital Markets', 'Credit Intermediation', 'Funds and Trusts', 'Insurance'],
  'Government Administration': ['Administration of Justice', 'Economic Programs', 'Environmental Quality Programs', 'Health and Human Services', 'Housing and Community Development', 'Military and International Affairs', 'Public Policy', 'Public Policy Offices', 'Space Research and Technology'],
  'Holding Companies': ['Holding Companies'],
  'Hospitals and Health Care': ['Community Services', 'Hospitals, Individual and Family Services', 'Medical Practices', 'Nursing Homes and Residential Care Facilities'],
  'Manufacturing': ['Apparel Manufacturing', 'Appliances, Electrical, and Electronics Manufacturing', 'Chemical Manufacturing', 'Computers and Electronics Manufacturing', 'Fabricated Metal Products', 'Food and Beverage Manufacturing', 'Furniture and Home Furnishings Manufacturing', 'Glass, Ceramics and Concrete Manufacturing', 'Leather Product Manufacturing', 'Machinery Manufacturing', 'Medical Equipment Manufacturing', 'Oil and Coal Product Manufacturing', 'Paper and Forest Product Manufacturing', 'Plastics and Rubber Product Manufacturing', 'Primary Metal Manufacturing', 'Printing Services', 'Sporting Goods Manufacturing', 'Textile Manufacturing', 'Tobacco Manufacturing', 'Transportation Equipment Manufacturing', 'Wood Product Manufacturing'],
  'Oil, Gas, and Mining': ['Mining', 'Oil and Gas'],
  'Professional Services': ['Accounting', 'Advertising Services', 'Architecture and Planning', 'Business Consulting and Services', 'Design Services', 'Engineering Services', 'IT Services and IT Consulting', 'Legal Services', 'Research Services', 'Services for Renewable Energy', 'Veterinary Services'],
  'Real Estate and Equipment Rental Services': ['Equipment Rental Services', 'Real Estate'],
  'Retail': ['Food and Beverage Retail', 'Online and Mail Order Retail', 'Retail Apparel and Fashion', 'Retail Appliances, Electrical, and Electronic Equipment', 'Retail Art Dealers', 'Retail Art Supplies', 'Retail Books and Printed News', 'Retail Building Materials and Garden Equipment', 'Retail Florists', 'Retail Furniture and Home Furnishings', 'Retail Gasoline', 'Retail Health and Personal Care Products', 'Retail Luxury Goods and Jewelry', 'Retail Motor Vehicles', 'Retail Musical Instruments', 'Retail Office Equipment', 'Retail Office Supplies and Gifts', 'Retail Recyclable Materials and Used Merchandise'],
  'Technology, Information and Media': ['Book and Periodical Publishing', 'Broadcast Media Production and Distribution', 'Data Infrastructure and Analytics', 'Information Services', 'Internet Marketplace Platforms', 'Movies, Videos, and Sound', 'Social Networking Platforms', 'Software Development', 'Telecommunications'],
  'Transportation, Logistics, Supply Chain and Storage': ['Airlines and Aviation', 'Freight and Package Transportation', 'Ground Passenger Transportation', 'Maritime Transportation', 'Pipeline Transportation', 'Postal Services', 'Rail Transportation', 'Truck Transportation', 'Warehousing and Storage'],
  'Utilities': ['Electric Power Generation', 'Electric Power Transmission, Control, and Distribution', 'Natural Gas Distribution', 'Water, Waste, Steam, and Air Conditioning Services'],
  'Wholesale': ['Wholesale Alcoholic Beverages', 'Wholesale Apparel and Sewing Supplies', 'Wholesale Appliances, Electrical, and Electronics', 'Wholesale Building Materials', 'Wholesale Chemical and Allied Products', 'Wholesale Computer Equipment', 'Wholesale Drugs and Sundries', 'Wholesale Food and Beverage', 'Wholesale Footwear', 'Wholesale Furniture and Home Furnishings', 'Wholesale Hardware, Plumbing, Heating Equipment', 'Wholesale Import and Export', 'Wholesale Luxury Goods and Jewelry', 'Wholesale Machinery', 'Wholesale Metals and Minerals', 'Wholesale Motor Vehicles and Parts', 'Wholesale Paper Products', 'Wholesale Petroleum and Petroleum Products', 'Wholesale Photography Equipment and Supplies', 'Wholesale Raw Farm Products', 'Wholesale Recyclable Materials'],
};

/** Must match the SQL migration's 20-sector slugs exactly. */
export function sectorSlug(sectorDisplay: string): string {
  return sectorDisplay.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// industry group → parent sector slug
const GROUP_TO_SECTOR_SLUG: Record<string, string> = {};
for (const [sector, groups] of Object.entries(LINKEDIN_TAXONOMY)) {
  const slug = sectorSlug(sector);
  for (const g of groups) GROUP_TO_SECTOR_SLUG[g.toLowerCase()] = slug;
}

/**
 * Thematic / free-text alias map (substring keyword → sector slugs).
 *
 * The intake form accepts custom industries ("Cybersecurity", "FinTech",
 * "AI", "Video Analytics", "WHS"...) which the LinkedIn taxonomy does NOT
 * contain — so the strict lookup above mapped them to nothing, every
 * sector-overlap score collapsed to zero, and every report converged on
 * the same agnostic-Sydney rows. Each key is a case-insensitive substring
 * tested against the trimmed industry text; the value is the sector slugs
 * to apply when it matches.
 *
 * Order matters only inasmuch as multiple keys can match a single industry;
 * the result is a set, so duplicates dedupe.
 */
// Each alternative is wrapped in word boundaries so bare-substring matches
// don't fire on "Window Manufacturing" (would have matched "wind"), "Texas
// Holdings" (would have matched "gas"), or "Geoanalytics" (would have
// matched "analytics"). Multi-word phrases use boundary on each end only.
const SECTOR_KEYWORD_ALIASES: Array<[RegExp, string[]]> = [
  [/\b(?:fintech|financial technology|digital payments|insurtech|regtech|wealthtech)\b/, ['financial-services', 'technology-information-and-media']],
  [/\b(?:cybersec(?:urity)?|cyber security|infosec|information security|digital identity|identity & access|iam)\b/, ['technology-information-and-media', 'professional-services']],
  [/\b(?:saas|software development|software engineering|enterprise software|developer tools)\b/, ['technology-information-and-media']],
  [/\b(?:ai|artificial intelligence|machine learning|ml|computer vision|video analytics|deep learning|llm|generative ai)\b/, ['technology-information-and-media']],
  [/\b(?:data|big data|analytics|data infrastructure|data platform|business intelligence)\b/, ['technology-information-and-media', 'professional-services']],
  [/\b(?:cloud|cloud computing|devops|platform engineering)\b/, ['technology-information-and-media']],
  [/\b(?:blockchain|crypto|web3|defi|nft)\b/, ['financial-services', 'technology-information-and-media']],
  [/\b(?:biotech|pharma|medtech|medical device|life sciences|clinical|therapeutics)\b/, ['hospitals-and-health-care', 'manufacturing']],
  // Deliberately NOT matching bare \bhealth\b — that catches phrases like
  // "Workplace Health and Safety" which is a construction/professional-services
  // domain, not healthcare. Require explicit healthcare-domain words.
  [/\b(?:healthcare|digital health|telehealth|mental health|hospital|primary care)\b/, ['hospitals-and-health-care']],
  [/\b(?:edtech|education technology|e-learning|online learning)\b/, ['education', 'technology-information-and-media']],
  [/\b(?:proptech|real estate technology)\b/, ['real-estate-and-equipment-rental-services', 'technology-information-and-media']],
  [/\b(?:agritech|agtech|agriculture technology|food tech|foodtech|agri-food)\b/, ['farming-ranching-forestry', 'technology-information-and-media']],
  [/\b(?:cleantech|climatetech|climate tech|renewables?|sustainability|green tech)\b/, ['utilities', 'technology-information-and-media']],
  [/\b(?:energy|solar|wind|hydrogen|battery storage)\b/, ['utilities']],
  [/\b(?:mining|miner|miners|critical minerals|exploration)\b/, ['oil-gas-and-mining']],
  [/\b(?:oil|gas|petroleum|lng)\b/, ['oil-gas-and-mining']],
  [/\b(?:construction|infrastructure|civil|engineering services|whs|ehs|ohs|workplace health and safety|workplace safety|occupational health and safety|occupational safety|health and safety|safety management)\b/, ['construction', 'professional-services']],
  [/\b(?:manufactur\w*|industrial|machinery|automation|robotics)\b/, ['manufacturing']],
  [/\b(?:logistics|supply chain|warehousing|shipping|freight|maritime)\b/, ['transportation-logistics-supply-chain-and-storage']],
  [/\b(?:retail|ecommerce|e-commerce|d2c|dtc)\b/, ['retail']],
  [/\b(?:hospitality|tourism|travel|food (?:&|and) beverage|f&b|restaurant)\b/, ['accommodation-and-food-services']],
  [/\b(?:media|entertainment|gaming|streaming|publishing)\b/, ['entertainment-providers', 'technology-information-and-media']],
  [/\b(?:telecom|telecommunications|5g|networking)\b/, ['technology-information-and-media']],
  [/\b(?:automotive|electric vehicle|ev|mobility)\b/, ['transportation-logistics-supply-chain-and-storage', 'manufacturing']],
  [/\b(?:consult\w*|advisory|advisor|advisors|professional services|accounting|tax|legal)\b/, ['professional-services']],
  [/\b(?:government|public sector|defence|defense|aerospace)\b/, ['government-administration']],
  [/\b(?:non[- ]?profit|ngo|charity)\b/, ['consumer-services']],
];

/**
 * Roll a list of industry values up to deduped 20-sector slugs.
 *
 * Resolution order per value:
 *   1. Exact LinkedIn group name (canonical taxonomy hit)
 *   2. Keyword alias map (handles custom free-text industries like
 *      "Cybersecurity", "FinTech", "Video Analytics", "Workplace Health
 *      and Safety" — the values the v2 form actually receives)
 *
 * Unknown values that match neither path are ignored.
 */
export function industryGroupsToSectorSlugs(groups: string[] | null | undefined): string[] {
  const out = new Set<string>();
  for (const raw of groups ?? []) {
    const g = (raw ?? '').toLowerCase().trim();
    if (!g) continue;
    const direct = GROUP_TO_SECTOR_SLUG[g];
    if (direct) { out.add(direct); continue; }
    for (const [re, slugs] of SECTOR_KEYWORD_ALIASES) {
      if (re.test(g)) for (const s of slugs) out.add(s);
    }
  }
  return [...out];
}

/** Count of shared elements between two arrays (case-sensitive). */
export function overlapCount(a: string[] | null | undefined, b: string[] | null | undefined): number {
  if (!a?.length || !b?.length) return 0;
  const set = new Set(b);
  let n = 0;
  for (const x of a) if (set.has(x)) n++;
  return n;
}
