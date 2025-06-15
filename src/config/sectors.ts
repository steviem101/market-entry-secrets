
export interface SectorConfig {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  serviceKeywords: string[];
  eventKeywords: string[];
  leadKeywords: string[];
  industries: string[];
  heroTitle: string;
  heroDescription: string;
}

export const SECTOR_MAPPINGS: Record<string, SectorConfig> = {
  fintech: {
    id: 'fintech',
    name: 'FinTech',
    description: 'Financial Technology Market Entry Solutions',
    keywords: ['fintech', 'financial', 'banking', 'payments', 'cryptocurrency', 'blockchain', 'lending', 'insurtech', 'wealthtech', 'regtech'],
    serviceKeywords: ['financial services', 'banking', 'payment', 'fintech', 'regulatory', 'compliance', 'investment', 'trading'],
    eventKeywords: ['fintech', 'financial', 'banking', 'payments', 'blockchain', 'cryptocurrency'],
    leadKeywords: ['financial', 'banking', 'fintech', 'payments'],
    industries: ['Financial Services', 'Banking', 'FinTech', 'Insurance', 'Investment'],
    heroTitle: 'FinTech Market Entry Solutions',
    heroDescription: 'Connect with specialized service providers, events, and opportunities in Australia\'s thriving financial technology ecosystem.'
  },
  medtech: {
    id: 'medtech',
    name: 'MedTech',
    description: 'Medical Technology Market Entry Solutions',
    keywords: ['medtech', 'medical', 'healthcare', 'biotechnology', 'pharmaceutical', 'health tech', 'digital health', 'telemedicine', 'medical devices'],
    serviceKeywords: ['medical', 'healthcare', 'biotechnology', 'pharmaceutical', 'regulatory', 'clinical', 'health'],
    eventKeywords: ['medtech', 'medical', 'healthcare', 'biotechnology', 'health'],
    leadKeywords: ['medical', 'healthcare', 'pharmaceutical', 'biotech'],
    industries: ['Healthcare', 'Medical Technology', 'Biotechnology', 'Pharmaceuticals', 'Digital Health'],
    heroTitle: 'MedTech Market Entry Solutions',
    heroDescription: 'Navigate Australia\'s medical technology landscape with specialized expertise and regulatory guidance.'
  },
  telecoms: {
    id: 'telecoms',
    name: 'Telecoms',
    description: 'Telecommunications Market Entry Solutions',
    keywords: ['telecoms', 'telecommunications', 'telco', '5g', 'network', 'connectivity', 'iot', 'satellite', 'wireless', 'broadband'],
    serviceKeywords: ['telecommunications', 'network', 'connectivity', 'infrastructure', 'spectrum', 'regulatory'],
    eventKeywords: ['telecoms', 'telecommunications', '5g', 'network', 'connectivity'],
    leadKeywords: ['telecoms', 'telecommunications', 'network', 'infrastructure'],
    industries: ['Telecommunications', 'Technology', 'Infrastructure', 'IoT', 'Connectivity'],
    heroTitle: 'Telecoms Market Entry Solutions',
    heroDescription: 'Enter Australia\'s telecommunications market with expert guidance on infrastructure, regulation, and partnerships.'
  }
};

export const getSectorConfig = (sectorId: string): SectorConfig | null => {
  return SECTOR_MAPPINGS[sectorId] || null;
};

export const getAllSectors = (): SectorConfig[] => {
  return Object.values(SECTOR_MAPPINGS);
};
