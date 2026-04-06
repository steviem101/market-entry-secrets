// Utility functions to map data to standardized LinkedIn sectors
import { LINKEDIN_SECTORS } from '@/constants/linkedinTaxonomy';

export const STANDARD_SECTORS: string[] = [...LINKEDIN_SECTORS];

/**
 * Keyword → LinkedIn sector mapping rules.
 * Each rule is [keywords[], sector]. First match wins.
 */
const SECTOR_RULES: [string[], string][] = [
  [['software', 'saas', 'ai ', 'data', 'cyber', 'cloud', 'internet', 'media', 'broadcast', 'publishing', 'telecom'], 'Technology, Information and Media'],
  [['health', 'medical', 'hospital', 'pharma', 'clinical'], 'Hospitals and Health Care'],
  [['financ', 'banking', 'investment', 'insurance', 'capital', 'credit', 'fintech'], 'Financial Services'],
  [['manufactur', 'industrial', 'chemical', 'semiconductor', 'machinery', 'automotive'], 'Manufacturing'],
  [['education', 'training', 'e-learning', 'university', 'school'], 'Education'],
  [['government', 'public policy', 'defence', 'defense', 'military', 'justice'], 'Government Administration'],
  [['retail', 'commerce', 'shopping', 'fashion', 'luxury'], 'Retail'],
  [['agricultur', 'farming', 'ranch', 'forestry'], 'Farming, Ranching, Forestry'],
  [['energy', 'mining', 'oil', 'gas', 'petroleum'], 'Oil, Gas, and Mining'],
  [['electric', 'power', 'utility', 'water', 'waste'], 'Utilities'],
  [['tourism', 'travel', 'hotel', 'hospitality', 'food', 'beverage', 'restaurant'], 'Accommodation and Food Services'],
  [['construct', 'building', 'civil engineer'], 'Construction'],
  [['transport', 'logistics', 'freight', 'shipping', 'aviation', 'airline', 'warehouse'], 'Transportation, Logistics, Supply Chain and Storage'],
  [['legal', 'law', 'accounting', 'consult', 'advisory', 'architect', 'engineer', 'design', 'research', 'advertis', 'marketing', 'pr ', 'recruit'], 'Professional Services'],
  [['real estate', 'property', 'rental'], 'Real Estate and Equipment Rental Services'],
  [['wholesale', 'import', 'export', 'distribution'], 'Wholesale'],
  [['nonprofit', 'non-profit', 'charity', 'social', 'community', 'religious'], 'Consumer Services'],
  [['security', 'staffing', 'facilities', 'event', 'translation'], 'Administrative and Support Services'],
  [['entertainment', 'sport', 'music', 'art', 'museum', 'perform'], 'Entertainment Providers'],
];

function matchSector(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [keywords, sector] of SECTOR_RULES) {
    if (keywords.some(kw => lower.includes(kw))) {
      return sector;
    }
  }
  return null;
}

export const mapSpecialtiesToSectors = (specialties: string[]): string[] => {
  const sectors = new Set<string>();
  specialties.forEach(s => {
    const sector = matchSector(s);
    if (sector) sectors.add(sector);
  });
  return Array.from(sectors);
};

export const mapServicesToSectors = (services: string[]): string[] => {
  const sectors = new Set<string>();
  services.forEach(s => {
    const sector = matchSector(s);
    if (sector) sectors.add(sector);
  });
  return Array.from(sectors);
};

export const mapIndustryToSector = (industry: string): string => {
  return matchSector(industry) || 'Professional Services';
};

export const getStandardTypes = {
  community: ['Expert', 'Consultant', 'Advisor', 'Mentor', 'Specialist'],
  content: ['Article', 'Case Study', 'Guide', 'Report', 'Video'],
  events: ['Conference', 'Workshop', 'Webinar', 'Networking', 'Trade Show'],
  leads: ['Lead Database', 'Market Data', 'TAM Map'],
  serviceProviders: ['Consultant', 'Law Firm', 'Accountant', 'Marketing Agency', 'Other'],
  innovationEcosystem: ['Incubator', 'Accelerator', 'Coworking Space', 'Research Institute'],
  tradeAgencies: ['Trade Agency', 'Investment Agency', 'Government Agency']
};