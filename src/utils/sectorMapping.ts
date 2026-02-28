// Utility functions to map data to standardized sectors

export const STANDARD_SECTORS = [
  'Technology',
  'Healthcare', 
  'Finance',
  'Manufacturing',
  'Education',
  'Government',
  'Retail',
  'Agriculture',
  'Energy',
  'Tourism',
  'Other'
];

export const mapSpecialtiesToSectors = (specialties: string[]): string[] => {
  const sectors = new Set<string>();
  
  specialties.forEach(specialty => {
    const lowerSpecialty = specialty.toLowerCase();
    
    if (lowerSpecialty.includes('tech') || lowerSpecialty.includes('software') || 
        lowerSpecialty.includes('digital') || lowerSpecialty.includes('innovation')) {
      sectors.add('Technology');
    } else if (lowerSpecialty.includes('health') || lowerSpecialty.includes('medical')) {
      sectors.add('Healthcare');
    } else if (lowerSpecialty.includes('finance') || lowerSpecialty.includes('banking') || 
               lowerSpecialty.includes('investment')) {
      sectors.add('Finance');
    } else if (lowerSpecialty.includes('manufactur') || lowerSpecialty.includes('industrial')) {
      sectors.add('Manufacturing');
    } else if (lowerSpecialty.includes('education') || lowerSpecialty.includes('training')) {
      sectors.add('Education');
    } else if (lowerSpecialty.includes('government') || lowerSpecialty.includes('public')) {
      sectors.add('Government');
    } else if (lowerSpecialty.includes('retail') || lowerSpecialty.includes('commerce')) {
      sectors.add('Retail');
    } else if (lowerSpecialty.includes('agricultur') || lowerSpecialty.includes('food')) {
      sectors.add('Agriculture');
    } else if (lowerSpecialty.includes('energy') || lowerSpecialty.includes('mining')) {
      sectors.add('Energy');
    } else if (lowerSpecialty.includes('tourism') || lowerSpecialty.includes('travel')) {
      sectors.add('Tourism');
    } else {
      sectors.add('Other');
    }
  });
  
  return Array.from(sectors);
};

export const mapServicesToSectors = (services: string[]): string[] => {
  const sectors = new Set<string>();
  
  services.forEach(service => {
    const lowerService = service.toLowerCase();
    
    if (lowerService.includes('tech') || lowerService.includes('software') || 
        lowerService.includes('digital') || lowerService.includes('it')) {
      sectors.add('Technology');
    } else if (lowerService.includes('health') || lowerService.includes('medical')) {
      sectors.add('Healthcare');
    } else if (lowerService.includes('finance') || lowerService.includes('accounting') || 
               lowerService.includes('banking')) {
      sectors.add('Finance');
    } else if (lowerService.includes('manufactur') || lowerService.includes('industrial')) {
      sectors.add('Manufacturing');
    } else if (lowerService.includes('education') || lowerService.includes('training')) {
      sectors.add('Education');
    } else if (lowerService.includes('government') || lowerService.includes('public')) {
      sectors.add('Government');
    } else if (lowerService.includes('retail') || lowerService.includes('commerce')) {
      sectors.add('Retail');
    } else if (lowerService.includes('agricultur') || lowerService.includes('food')) {
      sectors.add('Agriculture');
    } else if (lowerService.includes('energy') || lowerService.includes('mining')) {
      sectors.add('Energy');
    } else if (lowerService.includes('tourism') || lowerService.includes('travel')) {
      sectors.add('Tourism');
    } else {
      sectors.add('Other');
    }
  });
  
  return Array.from(sectors);
};

export const mapIndustryToSector = (industry: string): string => {
  const lowerIndustry = industry.toLowerCase();
  
  if (lowerIndustry.includes('tech') || lowerIndustry.includes('software') || 
      lowerIndustry.includes('digital')) {
    return 'Technology';
  } else if (lowerIndustry.includes('health') || lowerIndustry.includes('medical')) {
    return 'Healthcare';
  } else if (lowerIndustry.includes('finance') || lowerIndustry.includes('banking')) {
    return 'Finance';
  } else if (lowerIndustry.includes('manufactur') || lowerIndustry.includes('industrial')) {
    return 'Manufacturing';
  } else if (lowerIndustry.includes('education')) {
    return 'Education';
  } else if (lowerIndustry.includes('government') || lowerIndustry.includes('public')) {
    return 'Government';
  } else if (lowerIndustry.includes('retail') || lowerIndustry.includes('commerce')) {
    return 'Retail';
  } else if (lowerIndustry.includes('agricultur') || lowerIndustry.includes('food')) {
    return 'Agriculture';
  } else if (lowerIndustry.includes('energy') || lowerIndustry.includes('mining')) {
    return 'Energy';
  } else if (lowerIndustry.includes('tourism') || lowerIndustry.includes('travel')) {
    return 'Tourism';
  } else {
    return 'Other';
  }
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