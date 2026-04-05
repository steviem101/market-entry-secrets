/**
 * LinkedIn Industry Taxonomy (2026)
 *
 * 3-level hierarchy: Sector (20) > Industry Group (152) > Sub-Industry (137)
 * Source: linkedin_industries_2026.csv
 *
 * The selectable level for forms is `industry_group` (152 unique values).
 * Sectors provide grouping in the UI. Sub-industries provide optional drill-down.
 */

export interface LinkedInIndustry {
  sector: string;
  industryGroup: string;
  subIndustry: string | null;
  displayName: string;
}

export interface SectorGroup {
  sector: string;
  industryGroups: string[];
}

/**
 * All 20 LinkedIn sectors in display order.
 */
export const LINKEDIN_SECTORS = [
  'Accommodation and Food Services',
  'Administrative and Support Services',
  'Construction',
  'Consumer Services',
  'Education',
  'Entertainment Providers',
  'Farming, Ranching, Forestry',
  'Financial Services',
  'Government Administration',
  'Holding Companies',
  'Hospitals and Health Care',
  'Manufacturing',
  'Oil, Gas, and Mining',
  'Professional Services',
  'Real Estate and Equipment Rental Services',
  'Retail',
  'Technology, Information and Media',
  'Transportation, Logistics, Supply Chain and Storage',
  'Utilities',
  'Wholesale',
] as const;

export type LinkedInSector = typeof LINKEDIN_SECTORS[number];

/**
 * Full taxonomy: sector → industry_group[] (the primary selectable level).
 * Industry groups are the 152 unique values users pick from in forms.
 */
export const LINKEDIN_TAXONOMY: Record<string, string[]> = {
  'Accommodation and Food Services': [
    'Food and Beverage Services',
    'Hospitality',
  ],
  'Administrative and Support Services': [
    'Collection Agencies',
    'Events Services',
    'Facilities Services',
    'Fundraising',
    'Office Administration',
    'Security and Investigations',
    'Staffing and Recruiting',
    'Telephone Call Centers',
    'Translation and Localization',
    'Travel Arrangements',
    'Writing and Editing',
  ],
  'Construction': [
    'Building Construction',
    'Civil Engineering',
    'Specialty Trade Contractors',
  ],
  'Consumer Services': [
    'Civic and Social Organizations',
    'Household Services',
    'Non-profit Organizations',
    'Personal and Laundry Services',
    'Philanthropic Fundraising Services',
    'Religious Institutions',
    'Repair and Maintenance',
  ],
  'Education': [
    'E-Learning Providers',
    'Higher Education',
    'Primary and Secondary Education',
    'Professional Training and Coaching',
    'Technical and Vocational Training',
  ],
  'Entertainment Providers': [
    'Artists and Writers',
    'Museums, Historical Sites, and Zoos',
    'Musicians',
    'Performing Arts and Spectator Sports',
    'Recreational Facilities',
    'Spectator Sports',
  ],
  'Farming, Ranching, Forestry': [
    'Farming',
    'Ranching and Fisheries',
    'Forestry and Logging',
  ],
  'Financial Services': [
    'Capital Markets',
    'Credit Intermediation',
    'Funds and Trusts',
    'Insurance',
  ],
  'Government Administration': [
    'Administration of Justice',
    'Economic Programs',
    'Environmental Quality Programs',
    'Health and Human Services',
    'Housing and Community Development',
    'Military and International Affairs',
    'Public Policy',
    'Public Policy Offices',
    'Space Research and Technology',
  ],
  'Holding Companies': [
    'Holding Companies',
  ],
  'Hospitals and Health Care': [
    'Community Services',
    'Hospitals, Individual and Family Services',
    'Medical Practices',
    'Nursing Homes and Residential Care Facilities',
  ],
  'Manufacturing': [
    'Apparel Manufacturing',
    'Appliances, Electrical, and Electronics Manufacturing',
    'Chemical Manufacturing',
    'Computers and Electronics Manufacturing',
    'Fabricated Metal Products',
    'Food and Beverage Manufacturing',
    'Furniture and Home Furnishings Manufacturing',
    'Glass, Ceramics and Concrete Manufacturing',
    'Leather Product Manufacturing',
    'Machinery Manufacturing',
    'Medical Equipment Manufacturing',
    'Oil and Coal Product Manufacturing',
    'Paper and Forest Product Manufacturing',
    'Plastics and Rubber Product Manufacturing',
    'Primary Metal Manufacturing',
    'Printing Services',
    'Sporting Goods Manufacturing',
    'Textile Manufacturing',
    'Tobacco Manufacturing',
    'Transportation Equipment Manufacturing',
    'Wood Product Manufacturing',
  ],
  'Oil, Gas, and Mining': [
    'Mining',
    'Oil and Gas',
  ],
  'Professional Services': [
    'Accounting',
    'Advertising Services',
    'Architecture and Planning',
    'Business Consulting and Services',
    'Design Services',
    'Engineering Services',
    'IT Services and IT Consulting',
    'Legal Services',
    'Research Services',
    'Services for Renewable Energy',
    'Veterinary Services',
  ],
  'Real Estate and Equipment Rental Services': [
    'Equipment Rental Services',
    'Real Estate',
  ],
  'Retail': [
    'Food and Beverage Retail',
    'Online and Mail Order Retail',
    'Retail Apparel and Fashion',
    'Retail Appliances, Electrical, and Electronic Equipment',
    'Retail Art Dealers',
    'Retail Art Supplies',
    'Retail Books and Printed News',
    'Retail Building Materials and Garden Equipment',
    'Retail Florists',
    'Retail Furniture and Home Furnishings',
    'Retail Gasoline',
    'Retail Health and Personal Care Products',
    'Retail Luxury Goods and Jewelry',
    'Retail Motor Vehicles',
    'Retail Musical Instruments',
    'Retail Office Equipment',
    'Retail Office Supplies and Gifts',
    'Retail Recyclable Materials and Used Merchandise',
  ],
  'Technology, Information and Media': [
    'Book and Periodical Publishing',
    'Broadcast Media Production and Distribution',
    'Data Infrastructure and Analytics',
    'Information Services',
    'Internet Marketplace Platforms',
    'Movies, Videos, and Sound',
    'Social Networking Platforms',
    'Software Development',
    'Telecommunications',
  ],
  'Transportation, Logistics, Supply Chain and Storage': [
    'Airlines and Aviation',
    'Freight and Package Transportation',
    'Ground Passenger Transportation',
    'Maritime Transportation',
    'Pipeline Transportation',
    'Postal Services',
    'Rail Transportation',
    'Truck Transportation',
    'Warehousing and Storage',
  ],
  'Utilities': [
    'Electric Power Generation',
    'Electric Power Transmission, Control, and Distribution',
    'Natural Gas Distribution',
    'Water, Waste, Steam, and Air Conditioning Services',
  ],
  'Wholesale': [
    'Wholesale Alcoholic Beverages',
    'Wholesale Apparel and Sewing Supplies',
    'Wholesale Appliances, Electrical, and Electronics',
    'Wholesale Building Materials',
    'Wholesale Chemical and Allied Products',
    'Wholesale Computer Equipment',
    'Wholesale Drugs and Sundries',
    'Wholesale Food and Beverage',
    'Wholesale Footwear',
    'Wholesale Furniture and Home Furnishings',
    'Wholesale Hardware, Plumbing, Heating Equipment',
    'Wholesale Import and Export',
    'Wholesale Luxury Goods and Jewelry',
    'Wholesale Machinery',
    'Wholesale Metals and Minerals',
    'Wholesale Motor Vehicles and Parts',
    'Wholesale Paper Products',
    'Wholesale Petroleum and Petroleum Products',
    'Wholesale Photography Equipment and Supplies',
    'Wholesale Raw Farm Products',
    'Wholesale Recyclable Materials',
  ],
};

/**
 * Flat list of all 152 industry groups (the primary selectable level).
 * This replaces the old INDUSTRY_OPTIONS constant.
 */
export const INDUSTRY_GROUP_OPTIONS: string[] = LINKEDIN_SECTORS.flatMap(
  (sector) => LINKEDIN_TAXONOMY[sector] || []
);

/**
 * Reverse lookup: industry_group → sector.
 */
export const INDUSTRY_GROUP_TO_SECTOR: Record<string, string> = {};
for (const sector of LINKEDIN_SECTORS) {
  for (const group of LINKEDIN_TAXONOMY[sector] || []) {
    INDUSTRY_GROUP_TO_SECTOR[group] = sector;
  }
}

/**
 * Get the parent sector(s) for an array of industry_group values.
 * Useful for sector-level fallback matching in the report generator.
 */
export function getSectorsForIndustryGroups(industryGroups: string[]): string[] {
  const sectors = new Set<string>();
  for (const group of industryGroups) {
    const sector = INDUSTRY_GROUP_TO_SECTOR[group];
    if (sector) sectors.add(sector);
  }
  return Array.from(sectors);
}

/**
 * Sector gradient classes for UI display.
 * Maps the 20 LinkedIn sectors to Tailwind gradient classes.
 */
export const SECTOR_GRADIENTS: Record<string, string> = {
  'Accommodation and Food Services': 'from-orange-500 to-amber-600',
  'Administrative and Support Services': 'from-slate-500 to-gray-600',
  'Construction': 'from-amber-500 to-orange-600',
  'Consumer Services': 'from-pink-500 to-rose-600',
  'Education': 'from-cyan-500 to-blue-600',
  'Entertainment Providers': 'from-purple-500 to-violet-600',
  'Farming, Ranching, Forestry': 'from-lime-500 to-green-600',
  'Financial Services': 'from-blue-500 to-indigo-600',
  'Government Administration': 'from-slate-500 to-gray-600',
  'Holding Companies': 'from-gray-500 to-slate-600',
  'Hospitals and Health Care': 'from-emerald-500 to-teal-600',
  'Manufacturing': 'from-amber-500 to-orange-600',
  'Oil, Gas, and Mining': 'from-yellow-500 to-amber-600',
  'Professional Services': 'from-violet-500 to-purple-600',
  'Real Estate and Equipment Rental Services': 'from-teal-500 to-cyan-600',
  'Retail': 'from-pink-500 to-rose-600',
  'Technology, Information and Media': 'from-violet-500 to-purple-600',
  'Transportation, Logistics, Supply Chain and Storage': 'from-sky-500 to-cyan-600',
  'Utilities': 'from-yellow-500 to-amber-600',
  'Wholesale': 'from-gray-500 to-slate-600',
};

export const getSectorGradient = (sector: string | null): string => {
  if (!sector) return 'from-gray-500 to-slate-600';
  return SECTOR_GRADIENTS[sector] || 'from-gray-500 to-slate-600';
};
