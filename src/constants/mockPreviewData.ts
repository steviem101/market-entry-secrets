// Mock preview data for the LeadPreviewModal when no real preview records exist.
// TODO: Replace mock data with real preview records from lead_database_records table

export interface MockPreviewRow {
  company: string;
  contact: string;
  title: string;
  email: string;
  location: string;
}

const MOCK_DATA_BY_SECTOR: Record<string, MockPreviewRow[]> = {
  Finance: [
    { company: 'Afterpay', contact: 'John D.', title: 'Head of Procurement', email: 'j.doe@••••••••.com.au', location: 'Melbourne, VIC' },
    { company: 'Zip Co', contact: 'Sarah M.', title: 'VP of Partnerships', email: 's.m••••@••••••.com.au', location: 'Sydney, NSW' },
    { company: 'Xero Australia', contact: 'Michael T.', title: 'Director of Strategy', email: 'm.t••••@••••.com.au', location: 'Sydney, NSW' },
    { company: 'Tyro Payments', contact: 'Lisa K.', title: 'CTO', email: 'l.k••••@••••.com.au', location: 'Sydney, NSW' },
    { company: 'Judo Bank', contact: 'David R.', title: 'Head of Technology', email: 'd.r••••@••••.com.au', location: 'Melbourne, VIC' },
  ],
  Technology: [
    { company: 'Canva', contact: 'Emily W.', title: 'VP Engineering', email: 'e.w••••@••••••.com.au', location: 'Sydney, NSW' },
    { company: 'Atlassian', contact: 'James L.', title: 'Director of Product', email: 'j.l••••@••••••••.com.au', location: 'Sydney, NSW' },
    { company: 'SafetyCulture', contact: 'Anna P.', title: 'Head of Growth', email: 'a.p••••@••••••••••.com.au', location: 'Sydney, NSW' },
    { company: 'Culture Amp', contact: 'Ben H.', title: 'CTO', email: 'b.h••••@••••••••.com.au', location: 'Melbourne, VIC' },
    { company: 'Buildkite', contact: 'Sophie C.', title: 'VP Sales', email: 's.c••••@••••••••.com.au', location: 'Melbourne, VIC' },
  ],
  Healthcare: [
    { company: 'Ramsay Health Care', contact: 'Mark S.', title: 'CIO', email: 'm.s••••@••••••.com.au', location: 'Sydney, NSW' },
    { company: 'Healius', contact: 'Karen L.', title: 'Head of Digital', email: 'k.l••••@••••••.com.au', location: 'Sydney, NSW' },
    { company: 'Pro Medicus', contact: 'Steven A.', title: 'VP of Technology', email: 's.a••••@••••••••.com.au', location: 'Melbourne, VIC' },
    { company: 'Nanosonics', contact: 'Rachel B.', title: 'Director of Operations', email: 'r.b••••@••••••••••.com.au', location: 'Sydney, NSW' },
    { company: 'Cochlear', contact: 'Peter J.', title: 'Head of Procurement', email: 'p.j••••@••••••••.com.au', location: 'Sydney, NSW' },
  ],
  Manufacturing: [
    { company: 'BlueScope Steel', contact: 'Tom F.', title: 'Operations Director', email: 't.f••••@••••••••.com.au', location: 'Wollongong, NSW' },
    { company: 'Boral Limited', contact: 'Jane C.', title: 'Head of Innovation', email: 'j.c••••@••••.com.au', location: 'Sydney, NSW' },
    { company: 'CSR Limited', contact: 'Andrew M.', title: 'CTO', email: 'a.m••••@•••.com.au', location: 'Sydney, NSW' },
    { company: 'Incitec Pivot', contact: 'Helen W.', title: 'VP Supply Chain', email: 'h.w••••@••••••••.com.au', location: 'Melbourne, VIC' },
    { company: 'Orora Group', contact: 'Chris D.', title: 'Plant Manager', email: 'c.d••••@••••••.com.au', location: 'Melbourne, VIC' },
  ],
  Education: [
    { company: 'University of Melbourne', contact: 'Robert K.', title: 'CIO', email: 'r.k••••@••••••••.edu.au', location: 'Melbourne, VIC' },
    { company: 'UNSW Sydney', contact: 'Maria G.', title: 'Head of EdTech', email: 'm.g••••@••••.edu.au', location: 'Sydney, NSW' },
    { company: 'Monash University', contact: 'Ian P.', title: 'Digital Learning Director', email: 'i.p••••@••••••.edu.au', location: 'Melbourne, VIC' },
    { company: 'ANU', contact: 'Susan T.', title: 'IT Director', email: 's.t••••@•••.edu.au', location: 'Canberra, ACT' },
    { company: 'Navitas', contact: 'Daniel B.', title: 'VP Technology', email: 'd.b••••@••••••.com.au', location: 'Perth, WA' },
  ],
  Government: [
    { company: 'Services Australia', contact: 'Paul H.', title: 'Deputy CIO', email: 'p.h••••@••••••••.gov.au', location: 'Canberra, ACT' },
    { company: 'ATO', contact: 'Michelle R.', title: 'Director of Digital', email: 'm.r••••@•••.gov.au', location: 'Canberra, ACT' },
    { company: 'NSW Digital', contact: 'Greg W.', title: 'CTO', email: 'g.w••••@•••.nsw.gov.au', location: 'Sydney, NSW' },
    { company: 'Defence ICT', contact: 'Amanda V.', title: 'Procurement Lead', email: 'a.v••••@••••••••.gov.au', location: 'Canberra, ACT' },
    { company: 'Vic Digital', contact: 'Nathan J.', title: 'Platform Director', email: 'n.j••••@•••.vic.gov.au', location: 'Melbourne, VIC' },
  ],
  Retail: [
    { company: 'Woolworths Group', contact: 'Kate L.', title: 'Head of E-Commerce', email: 'k.l••••@••••••••••.com.au', location: 'Sydney, NSW' },
    { company: 'JB Hi-Fi', contact: 'Simon P.', title: 'Digital Director', email: 's.p••••@••••••.com.au', location: 'Melbourne, VIC' },
    { company: 'Kogan.com', contact: 'Laura M.', title: 'VP of Growth', email: 'l.m••••@••••••.com.au', location: 'Melbourne, VIC' },
    { company: 'Temple & Webster', contact: 'Ryan S.', title: 'CTO', email: 'r.s••••@••••••••••.com.au', location: 'Sydney, NSW' },
    { company: 'Booktopia', contact: 'Fiona A.', title: 'Marketing Director', email: 'f.a••••@••••••••.com.au', location: 'Sydney, NSW' },
  ],
  Agriculture: [
    { company: 'Elders', contact: 'Bruce T.', title: 'Innovation Manager', email: 'b.t••••@••••••.com.au', location: 'Adelaide, SA' },
    { company: 'Nufarm', contact: 'Wendy K.', title: 'Operations Director', email: 'w.k••••@••••••.com.au', location: 'Melbourne, VIC' },
    { company: 'GrainCorp', contact: 'Colin H.', title: 'CTO', email: 'c.h••••@••••••••.com.au', location: 'Sydney, NSW' },
    { company: 'Agworld', contact: 'Tara M.', title: 'Head of Product', email: 't.m••••@••••••.com.au', location: 'Perth, WA' },
    { company: 'Flurosat', contact: 'Alex N.', title: 'VP Engineering', email: 'a.n••••@••••••••.com.au', location: 'Sydney, NSW' },
  ],
  Energy: [
    { company: 'BHP', contact: 'Richard P.', title: 'VP Technology', email: 'r.p••••@•••.com.au', location: 'Melbourne, VIC' },
    { company: 'Fortescue Metals', contact: 'Julie A.', title: 'Head of Innovation', email: 'j.a••••@•••.com.au', location: 'Perth, WA' },
    { company: 'Santos', contact: 'Gary W.', title: 'Digital Director', email: 'g.w••••@••••••.com.au', location: 'Adelaide, SA' },
    { company: 'Pilbara Minerals', contact: 'Diane C.', title: 'Operations Manager', email: 'd.c••••@••••••••.com.au', location: 'Perth, WA' },
    { company: 'Lynas Rare Earths', contact: 'Harry B.', title: 'CTO', email: 'h.b••••@••••••.com.au', location: 'Perth, WA' },
  ],
  Tourism: [
    { company: 'Flight Centre', contact: 'Natalie G.', title: 'CTO', email: 'n.g••••@••••••••••.com.au', location: 'Brisbane, QLD' },
    { company: 'Webjet', contact: 'Derek S.', title: 'VP Engineering', email: 'd.s••••@••••••.com.au', location: 'Melbourne, VIC' },
    { company: 'Accor Pacific', contact: 'Marie F.', title: 'Revenue Director', email: 'm.f••••@••••••.com.au', location: 'Sydney, NSW' },
    { company: 'Mantra Group', contact: 'Tim J.', title: 'Head of Technology', email: 't.j••••@••••••.com.au', location: 'Gold Coast, QLD' },
    { company: 'Tourism Australia', contact: 'Claire B.', title: 'Digital Lead', email: 'c.b••••@••••••••.gov.au', location: 'Sydney, NSW' },
  ],
};

// Default fallback data for sectors not specifically mapped
const DEFAULT_MOCK_DATA: MockPreviewRow[] = [
  { company: 'Acme Corp Australia', contact: 'John D.', title: 'Managing Director', email: 'j.d••••@••••.com.au', location: 'Sydney, NSW' },
  { company: 'Pacific Solutions', contact: 'Sarah W.', title: 'Head of Operations', email: 's.w••••@••••••••.com.au', location: 'Melbourne, VIC' },
  { company: 'Southern Cross Tech', contact: 'Michael R.', title: 'CTO', email: 'm.r••••@•••.com.au', location: 'Brisbane, QLD' },
  { company: 'Harbour Digital', contact: 'Emma L.', title: 'VP of Sales', email: 'e.l••••@••••••••.com.au', location: 'Perth, WA' },
  { company: 'Outback Innovations', contact: 'David K.', title: 'Director of Strategy', email: 'd.k••••@••••••••.com.au', location: 'Adelaide, SA' },
];

/**
 * Returns mock preview data for a given sector.
 * Falls back to generic Australian B2B data if sector is unmapped.
 */
export const getMockPreviewData = (sector: string | null): MockPreviewRow[] => {
  if (!sector) return DEFAULT_MOCK_DATA;
  return MOCK_DATA_BY_SECTOR[sector] || DEFAULT_MOCK_DATA;
};
