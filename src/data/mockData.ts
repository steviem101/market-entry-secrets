
import { Company } from "@/components/CompanyCard";
import { ServiceCategory } from "@/components/SearchFilters";

export const serviceCategories: ServiceCategory[] = [
  { id: "aerospace", name: "Aerospace & Aviation", count: 24 },
  { id: "agriculture", name: "Agriculture & Equine", count: 18 },
  { id: "automotive", name: "Automotive", count: 42 },
  { id: "business-process", name: "Business Process Outsourcing", count: 33 },
  { id: "construction-products", name: "Construction Products", count: 27 },
  { id: "construction-services", name: "Construction Services", count: 31 },
  { id: "construction-tech", name: "Construction Tech", count: 19 },
  { id: "consumer-products", name: "Consumer Products", count: 38 },
  { id: "cybersecurity", name: "Cybersecurity", count: 29 },
  { id: "digital-entertainment", name: "Digital Entertainment", count: 22 },
  { id: "education", name: "Education", count: 35 },
  { id: "electronics", name: "Electronics & Electronic Manufacturing", count: 44 },
  { id: "energy", name: "Energy", count: 26 },
  { id: "financial-services", name: "Financial Services", count: 41 },
  { id: "healthcare", name: "Healthcare", count: 37 },
  { id: "marketing", name: "Marketing & Advertising", count: 52 },
  { id: "software", name: "Software Development", count: 68 },
  { id: "sports-marketing", name: "Sports Marketing", count: 15 },
];

export const companies: Company[] = [
  {
    id: "1",
    name: "Sport Endorse",
    description: "SPORT ENDORSE is the premier global platform revolutionizing athlete endorsements by providing innovative, cost-effective solutions that connect brands and athletes, maximizing visibility through authentic and transparent engagements.",
    location: "Ireland",
    founded: "2018",
    employees: "4-10",
    services: ["Fan Engagement", "Management Software", "Marketing & Advertising"],
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
    location: "United States",
    founded: "2015",
    employees: "51-100",
    services: ["Software Development", "Cloud Solutions", "Digital Transformation"],
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
    location: "Germany",
    founded: "2020",
    employees: "11-25",
    services: ["Energy", "Environmental Consulting", "Sustainability"],
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
    location: "United Kingdom",
    founded: "2017",
    employees: "26-50",
    services: ["Cybersecurity", "Data Protection", "Security Consulting"],
    website: "https://datasecure-pro.com",
    contactPersons: [
      { id: "6", name: "Emma Thompson", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop", role: "Security Analyst" }
    ]
  },
  {
    id: "5",
    name: "MediaCraft Studios",
    description: "Creative digital agency specializing in brand development, content creation, and digital marketing campaigns. We bring brands to life through compelling storytelling and innovative design.",
    location: "Canada",
    founded: "2019",
    employees: "11-25",
    services: ["Marketing & Advertising", "Digital Entertainment", "Brand Development"],
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
    location: "Australia",
    founded: "2016",
    employees: "101-250",
    services: ["Healthcare", "Software Development", "Telehealth"],
    website: "https://healthtech-partners.com"
  },
  {
    id: "7",
    name: "AutoMotive Solutions Inc",
    description: "Automotive technology company specializing in electric vehicle components and smart transportation systems. We're driving the future of sustainable mobility.",
    location: "Japan",
    founded: "2014",
    employees: "251-500",
    services: ["Automotive", "Electronics", "Transportation Tech"],
    website: "https://automotive-solutions.com"
  },
  {
    id: "8",
    name: "EduTech Global",
    description: "Educational technology platform providing online learning solutions and digital classroom tools. We empower educators and students with innovative learning technologies.",
    location: "Singapore",
    founded: "2021",
    employees: "26-50",
    services: ["Education", "Software Development", "E-Learning"],
    website: "https://edutech-global.com"
  },
  {
    id: "9",
    name: "FinanceForward",
    description: "Financial technology company offering banking solutions, payment processing, and financial analytics. We help businesses optimize their financial operations and growth strategies.",
    location: "Switzerland",
    founded: "2013",
    employees: "101-250",
    services: ["Financial Services", "Fintech", "Banking Solutions"],
    website: "https://financeforward.com"
  },
  {
    id: "10",
    name: "AeroSpace Dynamics",
    description: "Aerospace engineering company specializing in aircraft design, avionics systems, and space technology. We push the boundaries of flight and space exploration.",
    location: "France",
    founded: "2012",
    employees: "501-1000",
    services: ["Aerospace & Aviation", "Engineering", "Space Technology"],
    website: "https://aerospace-dynamics.com"
  }
];
