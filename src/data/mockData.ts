import { Company } from "@/components/CompanyCard";

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

export const companies: Company[] = [
  {
    id: "1",
    name: "Sport Endorse",
    description: "SPORT ENDORSE is the premier global platform revolutionizing athlete endorsements by providing innovative, cost-effective solutions that connect brands and athletes, maximizing visibility through authentic and transparent engagements.",
    location: "Sydney, NSW",
    founded: "2018",
    employees: "4-10",
    services: ["Social media & digital marketing", "Event management", "Advertising, branding & marketing"],
    website: "https://sportendorse.com",
    contact: "contact@sportendorse.com",
    experienceTiles: [
      { id: "1", name: "Nike", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop" },
      { id: "2", name: "Adidas", logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop" },
      { id: "3", name: "FIFA", logo: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&h=100&fit=crop" }
    ],
    contactPersons: [
      { id: "1", name: "Sarah Johnson", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop", role: "Business Development" },
      { id: "2", name: "Mike O'Connor", role: "Account Manager" }
    ]
  },
  {
    id: "2",
    name: "TechFlow Solutions",
    description: "Leading software development company specializing in enterprise solutions, cloud architecture, and digital transformation. We help businesses streamline their operations through innovative technology solutions.",
    location: "Melbourne, VIC",
    founded: "2015",
    employees: "51-100",
    services: ["Website development", "Website / Digital platform hosting & management", "Business development"],
    website: "https://techflow.com",
    contact: "hello@techflow.com",
    experienceTiles: [
      { id: "4", name: "Microsoft", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop" },
      { id: "5", name: "AWS", logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop" }
    ],
    contactPersons: [
      { id: "3", name: "David Chen", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100&h=100&fit=crop", role: "CTO" }
    ]
  },
  {
    id: "3",
    name: "GreenTech Innovations",
    description: "Sustainable technology company focused on renewable energy solutions and environmental consulting. We partner with organizations to reduce their carbon footprint and implement green technologies.",
    location: "Brisbane, QLD",
    founded: "2020",
    employees: "11-25",
    services: ["Strategy & long-term planning", "Business development", "Partner identification"],
    website: "https://greentech-innovations.com",
    experienceTiles: [
      { id: "6", name: "Tesla", logo: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&h=100&fit=crop" },
      { id: "7", name: "Siemens", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop" },
      { id: "8", name: "Shell", logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop" },
      { id: "9", name: "BP", logo: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&h=100&fit=crop" }
    ],
    contactPersons: [
      { id: "4", name: "Anna Mueller", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop", role: "Head of Sustainability" },
      { id: "5", name: "Klaus Weber", role: "Technical Director" }
    ]
  },
  {
    id: "4",
    name: "DataSecure Pro",
    description: "Cybersecurity specialists providing comprehensive security solutions for enterprises. Our team of experts ensures your data and systems are protected against evolving cyber threats.",
    location: "Perth, WA",
    founded: "2017",
    employees: "26-50",
    services: ["Data protection & Information assurance", "Risk consultation", "Regulatory support"],
    website: "https://datasecure-pro.com",
    contactPersons: [
      { id: "6", name: "Emma Thompson", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop", role: "Security Analyst" }
    ]
  },
  {
    id: "5",
    name: "MediaCraft Studios",
    description: "Creative digital agency specializing in brand development, content creation, and digital marketing campaigns. We bring brands to life through compelling storytelling and innovative design.",
    location: "Adelaide, SA",
    founded: "2019",
    employees: "11-25",
    services: ["Advertising, branding & marketing", "Social media & digital marketing", "Event management"],
    website: "https://mediacraft-studios.com",
    experienceTiles: [
      { id: "10", name: "Coca-Cola", logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop" },
      { id: "11", name: "Netflix", logo: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=100&h=100&fit=crop" }
    ],
    contactPersons: [
      { id: "7", name: "Alex Rivera", role: "Creative Director" },
      { id: "8", name: "Sophie Martin", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop", role: "Account Executive" }
    ]
  },
  {
    id: "6",
    name: "HealthTech Partners",
    description: "Healthcare technology company developing cutting-edge medical software and telehealth solutions. We're committed to improving patient outcomes through innovative healthcare technology.",
    location: "Canberra, ACT",
    founded: "2016",
    employees: "101-250",
    services: ["Business development", "Website development", "Strategy & long-term planning"],
    website: "https://healthtech-partners.com"
  },
  {
    id: "7",
    name: "AutoMotive Solutions Inc",
    description: "Automotive technology company specializing in electric vehicle components and smart transportation systems. We're driving the future of sustainable mobility.",
    location: "Gold Coast, QLD",
    founded: "2014",
    employees: "251-500",
    services: ["Product safety regulation and compliance", "Quality assurance & quality control", "Cross-border logistics support and warehousing"],
    website: "https://automotive-solutions.com"
  },
  {
    id: "8",
    name: "EduTech Global",
    description: "Educational technology platform providing online learning solutions and digital classroom tools. We empower educators and students with innovative learning technologies.",
    location: "Darwin, NT",
    founded: "2021",
    employees: "26-50",
    services: ["Website development", "Business development", "Translation / Interpretation services"],
    website: "https://edutech-global.com"
  },
  {
    id: "9",
    name: "FinanceForward",
    description: "Financial technology company offering banking solutions, payment processing, and financial analytics. We help businesses optimize their financial operations and growth strategies.",
    location: "Hobart, TAS",
    founded: "2013",
    employees: "101-250",
    services: ["Accounting & Tax", "Foreign exchange services", "Opening a bank account"],
    website: "https://financeforward.com"
  },
  {
    id: "10",
    name: "AeroSpace Dynamics",
    description: "Aerospace engineering company specializing in aircraft design, avionics systems, and space technology. We push the boundaries of flight and space exploration.",
    location: "Newcastle, NSW",
    founded: "2012",
    employees: "501-1000",
    services: ["Product safety regulation and compliance", "Quality assurance & quality control", "Regulatory support"],
    website: "https://aerospace-dynamics.com"
  }
];
