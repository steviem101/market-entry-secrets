import { Person } from "@/components/PersonCard";

export interface ServiceCategory {
  id: string;
  name: string;
  count: number;
  parentId?: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  categories: ServiceCategory[];
  totalCount: number;
}

export interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  founded: string;
  employees: string;
  services: string[];
  website?: string;
  contact?: string;
  experienceTiles?: { id: string; name: string; logo: string; }[];
}

export const serviceCategories: ServiceCategory[] = [
  // Accounting, Payroll & Tax
  { id: "accounting-tax", name: "Accounting & Tax", count: 18 },
  { id: "payroll", name: "Payroll", count: 24 },
  
  // Communications, PR, Public Affairs
  { id: "public-affairs", name: "Public Affairs", count: 12 },
  { id: "public-relations", name: "Public Relations, Media Relations, Social Media & Corporate Communications", count: 18 },
  
  // Corporate Banking
  { id: "corporate-banking", name: "Corporate Banking", count: 15 },
  
  // Coworking, Private offices & Real Estate
  { id: "coworking-offices", name: "Coworking & Private Offices", count: 22 },
  { id: "real-estate", name: "Real Estate", count: 16 },
  
  // Financial Solutions
  { id: "private-investment", name: "Private Investment", count: 14 },
  { id: "productive-investment", name: "Productive Investment", count: 10 },
  { id: "rd-innovation", name: "R&D & Innovation", count: 8 },
  
  // Business support & operations
  { id: "business-relocation", name: "Business relocation, staff and family relocation", count: 12 },
  { id: "cross-border-logistics", name: "Cross-border logistics support and warehousing", count: 8 },
  { id: "planning-consultants", name: "Planning consultants and facilities", count: 15 },
  { id: "specialist-broker", name: "Specialist broker support", count: 6 },
  
  // Compliance & Risk management
  { id: "product-safety", name: "Product safety regulation and compliance", count: 9 },
  { id: "regulatory-support", name: "Regulatory support", count: 11 },
  { id: "risk-consultation", name: "Risk consultation", count: 7 },
  { id: "quality-assurance", name: "Quality assurance & quality control", count: 13 },
  
  // Financial
  { id: "foreign-exchange", name: "Foreign exchange services", count: 14 },
  { id: "insurance", name: "Insurance", count: 22 },
  { id: "bank-account", name: "Opening a bank account", count: 16 },
  { id: "raising-capital", name: "Raising capital", count: 10 },
  
  // Market research & consultancy
  { id: "business-development", name: "Business development", count: 25 },
  { id: "commercial-pricing", name: "Commercial & pricing strategy", count: 18 },
  { id: "market-entry", name: "Market entry research", count: 20 },
  { id: "partner-identification", name: "Partner identification", count: 12 },
  { id: "strategy-planning", name: "Strategy & long-term planning", count: 15 },
  { id: "intellectual-property", name: "Intellectual property (non-legal)", count: 8 },
  
  // Human resources
  { id: "employment-talent", name: "Employment & talent research", count: 19 },
  { id: "workforce-development", name: "Workforce Development & Staff Management", count: 17 },
  
  // Legal
  { id: "company-incorporation", name: "Company incorporation", count: 21 },
  { id: "data-protection", name: "Data protection & Information assurance", count: 16 },
  { id: "employment-law", name: "Employment law", count: 14 },
  { id: "tax-legal", name: "Tax", count: 18 },
  { id: "immigration", name: "Immigration", count: 12 },
  { id: "intellectual-property-law", name: "Intellectual property law", count: 9 },
  
  // Market access
  { id: "customs-services", name: "Customs services", count: 11 },
  { id: "freight-forwarders", name: "Freight forwarders", count: 15 },
  { id: "conformity-assessment", name: "Conformity assessment", count: 7 },
  { id: "sanitary-phytosanitary", name: "Sanitary and phytosanitary measures", count: 5 },
  { id: "mobility-visas", name: "Mobility & Visas", count: 13 },
  { id: "vat", name: "VAT", count: 16 },
  { id: "local-representation", name: "Local representation", count: 8 },
  
  // Marketing, PR & Communications
  { id: "advertising-branding", name: "Advertising, branding & marketing", count: 28 },
  { id: "event-management", name: "Event management", count: 22 },
  { id: "social-media-digital", name: "Social media & digital marketing", count: 31 },
  { id: "website-development", name: "Website development", count: 26 },
  { id: "website-hosting", name: "Website / Digital platform hosting & management", count: 19 },
  { id: "translation-services", name: "Translation / Interpretation services", count: 14 }
];

export const categoryGroups: CategoryGroup[] = [
  {
    id: "aerospace-defence",
    name: "Aerospace & Defence",
    categories: [
      { id: "aerospace-manufacturing", name: "Aerospace Manufacturing", count: 8 },
      { id: "defence-contracting", name: "Defence Contracting", count: 12 },
      { id: "avionics-systems", name: "Avionics Systems", count: 6 }
    ],
    totalCount: 26
  },
  {
    id: "automotive-mobility",
    name: "Automotive & Mobility",
    categories: [
      { id: "electric-vehicles", name: "Electric Vehicles", count: 15 },
      { id: "autonomous-systems", name: "Autonomous Systems", count: 8 },
      { id: "automotive-parts", name: "Automotive Parts & Components", count: 22 }
    ],
    totalCount: 45
  },
  {
    id: "consumer-ecommerce",
    name: "Consumer & Ecommerce",
    categories: [
      { id: "retail-ecommerce", name: "Retail & Ecommerce", count: 35 },
      { id: "consumer-goods", name: "Consumer Goods", count: 28 },
      { id: "fashion-lifestyle", name: "Fashion & Lifestyle", count: 18 }
    ],
    totalCount: 81
  },
  {
    id: "digital-media-adtech",
    name: "Digital Media & Adtech",
    categories: [
      { id: "digital-advertising", name: "Digital Advertising", count: 24 },
      { id: "content-creation", name: "Content Creation", count: 19 },
      { id: "streaming-media", name: "Streaming & Media", count: 14 }
    ],
    totalCount: 57
  },
  {
    id: "electronics-embedded",
    name: "Electronics & Embedded Software",
    categories: [
      { id: "consumer-electronics", name: "Consumer Electronics", count: 20 },
      { id: "embedded-systems", name: "Embedded Systems", count: 16 },
      { id: "semiconductors", name: "Semiconductors", count: 12 }
    ],
    totalCount: 48
  },
  {
    id: "energy-environment",
    name: "Energy & Environment",
    categories: [
      { id: "renewable-energy", name: "Renewable Energy", count: 18 },
      { id: "environmental-services", name: "Environmental Services", count: 14 },
      { id: "sustainability", name: "Sustainability Consulting", count: 11 }
    ],
    totalCount: 43
  },
  {
    id: "industrial-materials",
    name: "Industrial & Materials",
    categories: [
      { id: "manufacturing", name: "Manufacturing", count: 32 },
      { id: "materials-science", name: "Materials Science", count: 15 },
      { id: "industrial-automation", name: "Industrial Automation", count: 21 }
    ],
    totalCount: 68
  },
  {
    id: "intellectual-property",
    name: "Intellectual Property",
    categories: [
      { id: "patent-services", name: "Patent Services", count: 14 },
      { id: "trademark-copyright", name: "Trademark & Copyright", count: 16 },
      { id: "ip-licensing", name: "IP Licensing", count: 8 }
    ],
    totalCount: 38
  },
  {
    id: "medtech-life-sciences",
    name: "Medtech & Life Sciences",
    categories: [
      { id: "medical-devices", name: "Medical Devices", count: 22 },
      { id: "biotechnology", name: "Biotechnology", count: 18 },
      { id: "pharmaceuticals", name: "Pharmaceuticals", count: 25 }
    ],
    totalCount: 65
  },
  {
    id: "software-cloud",
    name: "Software & Cloud",
    categories: [
      { id: "cloud-services", name: "Cloud Services", count: 29 },
      { id: "software-development", name: "Software Development", count: 41 },
      { id: "cybersecurity", name: "Cybersecurity", count: 23 }
    ],
    totalCount: 93
  },
  {
    id: "telecoms-networks",
    name: "Telecoms & Networks",
    categories: [
      { id: "telecommunications", name: "Telecommunications", count: 19 },
      { id: "network-infrastructure", name: "Network Infrastructure", count: 16 },
      { id: "5g-technology", name: "5G Technology", count: 12 }
    ],
    totalCount: 47
  },
  {
    id: "accounting-payroll-tax",
    name: "Accounting, Payroll & Tax",
    categories: [
      { id: "accounting-tax", name: "Accounting & Tax", count: 18 },
      { id: "payroll", name: "Payroll", count: 24 }
    ],
    totalCount: 42
  },
  {
    id: "communications-pr",
    name: "Communications, PR, Public Affairs",
    categories: [
      { id: "public-affairs", name: "Public Affairs", count: 12 },
      { id: "public-relations", name: "Public Relations, Media Relations, Social Media & Corporate Communications", count: 18 }
    ],
    totalCount: 30
  },
  {
    id: "corporate-banking",
    name: "Corporate Banking",
    categories: [
      { id: "corporate-banking", name: "Corporate Banking", count: 15 }
    ],
    totalCount: 15
  },
  {
    id: "coworking-real-estate",
    name: "Coworking, Private offices & Real Estate",
    categories: [
      { id: "coworking-offices", name: "Coworking & Private Offices", count: 22 },
      { id: "real-estate", name: "Real Estate", count: 16 }
    ],
    totalCount: 38
  },
  {
    id: "financial-solutions",
    name: "Financial Solutions",
    categories: [
      { id: "private-investment", name: "Private Investment", count: 14 },
      { id: "productive-investment", name: "Productive Investment", count: 10 },
      { id: "rd-innovation", name: "R&D & Innovation", count: 8 }
    ],
    totalCount: 32
  }
];

export const people: Person[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Market Entry Strategist",
    description: "Experienced professional helping international companies navigate the Australian market. Specializes in regulatory compliance, business development, and strategic partnerships across technology and healthcare sectors.",
    location: "Sydney, NSW",
    experience: "12+ years",
    specialties: ["Market Entry Strategy", "Regulatory Compliance", "Business Development", "Strategic Partnerships"],
    website: "https://sarahjohnson.com",
    contact: "sarah@example.com",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
    company: "Johnson Strategic Consulting",
    experienceTiles: [
      { id: "1", name: "Microsoft", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop" },
      { id: "2", name: "Salesforce", logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop" },
      { id: "3", name: "Pfizer", logo: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&h=100&fit=crop" }
    ]
  },
  {
    id: "2",
    name: "David Chen",
    title: "Technology Integration Specialist",
    description: "Senior consultant specializing in helping tech startups and scale-ups establish operations in Australia. Expert in digital transformation, cloud migration, and establishing local development teams.",
    location: "Melbourne, VIC",
    experience: "15+ years",
    specialties: ["Technology Integration", "Cloud Migration", "Team Building", "Digital Transformation"],
    website: "https://davidchen.consulting",
    contact: "david@example.com",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop",
    company: "TechScale Australia",
    experienceTiles: [
      { id: "4", name: "AWS", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop" },
      { id: "5", name: "Google Cloud", logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop" }
    ]
  },
  {
    id: "3",
    name: "Anna Mueller",
    title: "Sustainability & ESG Advisor",
    description: "Environmental sustainability expert helping international companies align with Australia's environmental regulations and ESG requirements. Specializes in renewable energy and clean technology market entry.",
    location: "Brisbane, QLD",
    experience: "10+ years",
    specialties: ["ESG Compliance", "Renewable Energy", "Environmental Regulations", "Sustainability Strategy"],
    website: "https://annamueller.eco",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
    company: "GreenPath Consulting",
    experienceTiles: [
      { id: "6", name: "Tesla", logo: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&h=100&fit=crop" },
      { id: "7", name: "Siemens", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop" },
      { id: "8", name: "Shell", logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop" }
    ]
  },
  {
    id: "4",
    name: "Emma Thompson",
    title: "Cybersecurity & Risk Management Consultant",
    description: "Cybersecurity specialist helping international companies establish secure operations in Australia. Expert in data protection laws, risk assessment, and implementing security frameworks for Australian compliance.",
    location: "Perth, WA",
    experience: "8+ years",
    specialties: ["Cybersecurity", "Risk Management", "Data Protection", "Compliance Frameworks"],
    website: "https://emmathompson.security",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
    company: "SecureOps Australia"
  },
  {
    id: "5",
    name: "Alex Rivera",
    title: "Digital Marketing & Brand Strategist",
    description: "Creative marketing professional specializing in helping international brands establish their presence in the Australian market. Expert in digital campaigns, brand positioning, and local market insights.",
    location: "Adelaide, SA",
    experience: "9+ years",
    specialties: ["Digital Marketing", "Brand Strategy", "Content Creation", "Market Research"],
    website: "https://alexrivera.marketing",
    contact: "alex@example.com",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop",
    company: "Rivera Creative Agency",
    experienceTiles: [
      { id: "10", name: "Coca-Cola", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop" },
      { id: "11", name: "Netflix", logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop" }
    ]
  },
  {
    id: "6",
    name: "Sophie Martin",
    title: "Healthcare & Life Sciences Advisor",
    description: "Healthcare industry specialist with deep expertise in Australian regulatory frameworks for medical devices and pharmaceuticals. Helps international companies navigate TGA approval processes and establish clinical operations.",
    location: "Canberra, ACT",
    experience: "14+ years",
    specialties: ["Healthcare Regulations", "TGA Compliance", "Clinical Operations", "Medical Devices"],
    website: "https://sophiemartin.health",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
    company: "MedTech Australia Consulting"
  },
  {
    id: "7",
    name: "Klaus Weber",
    title: "Automotive & Manufacturing Expert",
    description: "Manufacturing and automotive industry veteran helping international companies establish production facilities and supply chains in Australia. Specializes in electric vehicle market entry and sustainable manufacturing.",
    location: "Gold Coast, QLD",
    experience: "18+ years",
    specialties: ["Manufacturing Setup", "Supply Chain", "Automotive Industry", "Electric Vehicles"],
    website: "https://klausweber.manufacturing",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop",
    company: "AutoManufacture Solutions"
  },
  {
    id: "8",
    name: "Jennifer Liu",
    title: "Education Technology Specialist",
    description: "EdTech consultant helping international education companies and platforms enter the Australian market. Expert in education regulations, curriculum alignment, and establishing partnerships with Australian institutions.",
    location: "Darwin, NT",
    experience: "7+ years",
    specialties: ["Education Technology", "Curriculum Development", "Regulatory Compliance", "Partnership Development"],
    website: "https://jenniferliu.edutech",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
    company: "EduPath Consulting"
  },
  {
    id: "9",
    name: "Marcus O'Brien",
    title: "Financial Services & FinTech Advisor",
    description: "Financial services expert specializing in helping international FinTech companies navigate Australian financial regulations. Expert in APRA compliance, banking partnerships, and payment system integration.",
    location: "Hobart, TAS",
    experience: "16+ years",
    specialties: ["Financial Regulations", "APRA Compliance", "Banking Partnerships", "Payment Systems"],
    website: "https://marcusobrien.fintech",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop",
    company: "FinServe Australia"
  },
  {
    id: "10",
    name: "Rachel Kim",
    title: "Aerospace & Defence Industry Consultant",
    description: "Aerospace and defence industry specialist helping international companies establish operations in Australia's growing space and defence sectors. Expert in government contracting and security clearance processes.",
    location: "Newcastle, NSW",
    experience: "11+ years",
    specialties: ["Aerospace Industry", "Defence Contracting", "Government Relations", "Security Clearances"],
    website: "https://rachelkim.aerospace",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop",
    company: "AeroDefence Consulting"
  }
];

// Mock companies data for the vendor/company pages
export const companies: Company[] = [
  {
    id: "1",
    name: "TechForward Solutions",
    description: "Leading technology consulting firm specializing in digital transformation and cloud migration for international companies entering the Australian market.",
    location: "Sydney, NSW",
    founded: "2018",
    employees: "50-100",
    services: ["Cloud Migration", "Digital Transformation", "Software Development", "Technology Integration"],
    website: "https://techforward.com.au",
    contact: "info@techforward.com.au",
    experienceTiles: [
      { id: "1", name: "AWS", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop" },
      { id: "2", name: "Microsoft", logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop" }
    ]
  },
  {
    id: "2",
    name: "GreenPath Consulting",
    description: "Environmental sustainability experts helping companies navigate Australia's environmental regulations and implement ESG strategies.",
    location: "Melbourne, VIC",
    founded: "2020",
    employees: "20-50",
    services: ["ESG Compliance", "Environmental Consulting", "Sustainability Strategy", "Renewable Energy"],
    website: "https://greenpath.com.au",
    contact: "hello@greenpath.com.au"
  },
  {
    id: "3",
    name: "MarketEntry Pro",
    description: "Comprehensive market entry consultancy providing end-to-end support for international companies establishing operations in Australia.",
    location: "Brisbane, QLD",
    founded: "2015",
    employees: "100+",
    services: ["Market Research", "Business Development", "Regulatory Compliance", "Strategic Planning"],
    website: "https://marketentrypro.com.au",
    contact: "contact@marketentrypro.com.au"
  }
];
