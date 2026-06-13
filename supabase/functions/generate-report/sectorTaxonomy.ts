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
 * Roll a list of LinkedIn industry GROUP names up to deduped 20-sector slugs.
 * Unknown values (custom free-text industries) are ignored.
 */
export function industryGroupsToSectorSlugs(groups: string[] | null | undefined): string[] {
  const out = new Set<string>();
  for (const g of groups ?? []) {
    const slug = GROUP_TO_SECTOR_SLUG[(g ?? '').toLowerCase().trim()];
    if (slug) out.add(slug);
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
