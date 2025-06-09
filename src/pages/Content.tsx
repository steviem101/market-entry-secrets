import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  description: string;
  monthlyRevenue: string;
  startupCosts: string;
  businessType: string;
  niche: string;
  country: string;
  continent: string;
  readBy: string;
  founderImage?: string;
  founderName: string;
  outcome: "successful" | "unsuccessful";
}

const mockCaseStudies: CaseStudy[] = [
  {
    id: "1",
    slug: "us-tech-startup-success",
    title: "How This US Tech Startup Successfully Entered Australia And Reached $2M ARR",
    description: "A Silicon Valley SaaS company shares their 18-month journey entering the Australian market, including regulatory hurdles, local partnerships, and the marketing strategies that led to rapid growth in Sydney and Melbourne.",
    monthlyRevenue: "$167K",
    startupCosts: "$75K",
    businessType: "SaaS",
    niche: "Software & Technology",
    country: "United States",
    continent: "North America",
    readBy: "45,234 founders",
    founderName: "Marcus Chen",
    outcome: "successful"
  },
  {
    id: "2",
    slug: "uk-ecommerce-failure",
    title: "Why Our £2M UK E-commerce Brand Failed In Australia (And What We Learned)",
    description: "The founder of a successful UK fashion brand shares the costly mistakes that led to their Australian market entry failure, including underestimating logistics costs, cultural differences, and regulatory compliance issues.",
    monthlyRevenue: "$0",
    startupCosts: "$120K",
    businessType: "E-commerce",
    niche: "Fashion & Retail",
    country: "United Kingdom",
    continent: "Europe",
    readBy: "67,891 founders",
    founderName: "Sarah Williams",
    outcome: "unsuccessful"
  },
  {
    id: "3",
    slug: "german-manufacturing-success",
    title: "How We Built A $5M Manufacturing Business In Australia From Germany",
    description: "A German automotive parts manufacturer details their successful 3-year expansion into Australia, covering supplier relationships, compliance with Australian standards, and building a local team that now serves the entire APAC region.",
    monthlyRevenue: "$417K",
    startupCosts: "$200K",
    businessType: "Manufacturing",
    niche: "Automotive & Industrial",
    country: "Germany",
    continent: "Europe",
    readBy: "32,156 founders",
    founderName: "Klaus Mueller",
    outcome: "successful"
  },
  {
    id: "4",
    slug: "canadian-fintech-struggle",
    title: "Our Canadian FinTech's Rocky Road To Australian Market Entry",
    description: "A Toronto-based payment processing company shares their challenging but ultimately successful journey entering Australia's highly regulated financial services market, including APRA licensing and partnership strategies.",
    monthlyRevenue: "$83K",
    startupCosts: "$95K",
    businessType: "FinTech",
    niche: "Financial Services",
    country: "Canada",
    continent: "North America",
    readBy: "28,945 founders",
    founderName: "Jennifer Liu",
    outcome: "successful"
  },
  {
    id: "5",
    slug: "japanese-food-failure",
    title: "How Cultural Misunderstanding Killed Our Japanese Restaurant Chain In Australia",
    description: "The story of a successful Japanese restaurant chain's failed expansion to Australia, highlighting the importance of cultural adaptation, local market research, and understanding Australian dining preferences.",
    monthlyRevenue: "$0",
    startupCosts: "$180K",
    businessType: "Food & Beverage",
    niche: "Hospitality",
    country: "Japan",
    continent: "Asia",
    readBy: "41,723 founders",
    founderName: "Hiroshi Tanaka",
    outcome: "unsuccessful"
  },
  {
    id: "6",
    slug: "singapore-logistics-success",
    title: "From Singapore To Sydney: Building A $10M Logistics Empire",
    description: "How a Singapore-based logistics company successfully expanded to Australia by leveraging existing Asian trade routes, understanding local regulations, and building strategic partnerships with Australian ports and warehouses.",
    monthlyRevenue: "$833K",
    startupCosts: "$150K",
    businessType: "Logistics",
    niche: "Supply Chain",
    country: "Singapore",
    continent: "Asia",
    readBy: "56,234 founders",
    founderName: "Wei Zhang",
    outcome: "successful"
  }
];

const Content = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [revenueFilter, setRevenueFilter] = useState("any");
  const [costsFilter, setCostsFilter] = useState("any");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("any");
  const [nicheFilter, setNicheFilter] = useState("any");
  const [countryFilter, setCountryFilter] = useState("any");
  const [continentFilter, setContinentFilter] = useState("any");
  const [startedAtFilter, setStartedAtFilter] = useState("any");
  const [growthMethodFilter, setGrowthMethodFilter] = useState("any");
  const [businessModelFilter, setBusinessModelFilter] = useState("any");
  const [foundersFilter, setFoundersFilter] = useState("any");
  const [employeesFilter, setEmployeesFilter] = useState("any");
  const [fundingFilter, setFundingFilter] = useState("any");
  const [customerFilter, setCustomerFilter] = useState("any");
  const [icpFilter, setIcpFilter] = useState("any");

  const filteredCaseStudies = mockCaseStudies.filter(caseStudy => {
    const matchesSearch = caseStudy.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         caseStudy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRevenue = revenueFilter === "any" || true; // Add revenue filtering logic
    const matchesCosts = costsFilter === "any" || true; // Add costs filtering logic
    const matchesBusinessType = businessTypeFilter === "any" || caseStudy.businessType === businessTypeFilter;
    const matchesNiche = nicheFilter === "any" || caseStudy.niche === nicheFilter;
    const matchesCountry = countryFilter === "any" || caseStudy.country === countryFilter;
    const matchesContinent = continentFilter === "any" || caseStudy.continent === continentFilter;
    
    return matchesSearch && matchesRevenue && matchesCosts && matchesBusinessType && 
           matchesNiche && matchesCountry && matchesContinent;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Australian Market Entry Content</h1>
              <p className="text-lg text-muted-foreground mb-4">
                Real stories from international businesses entering the Australian market - their successes, failures, and lessons learned.
              </p>
              <div className="flex gap-6 text-sm">
                <button className="text-foreground font-medium border-b-2 border-primary pb-1">All Content</button>
                <button className="text-muted-foreground hover:text-foreground">Success Stories</button>
                <button className="text-muted-foreground hover:text-foreground">Failure Stories</button>
                <button className="text-muted-foreground hover:text-foreground">Lessons Learned</button>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground">{mockCaseStudies.length} Stories</Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Try 'SaaS market entry' or 'regulatory compliance'" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10 py-3 text-base" 
            />
          </div>
          
          <p className="text-muted-foreground mt-4">
            Showing {filteredCaseStudies.length} market entry stories
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Revenue</label>
                <Select value={revenueFilter} onValueChange={setRevenueFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Amount</SelectItem>
                    <SelectItem value="0-10k">$0 - $10K</SelectItem>
                    <SelectItem value="10k-50k">$10K - $50K</SelectItem>
                    <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                    <SelectItem value="100k+">$100K+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Starting Costs</label>
                <Select value={costsFilter} onValueChange={setCostsFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Amount</SelectItem>
                    <SelectItem value="0-1k">$0 - $1K</SelectItem>
                    <SelectItem value="1k-5k">$1K - $5K</SelectItem>
                    <SelectItem value="5k-10k">$5K - $10K</SelectItem>
                    <SelectItem value="10k+">$10K+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Business Type</label>
                <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Niche</label>
                <Select value={nicheFilter} onValueChange={setNicheFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Category</SelectItem>
                    <SelectItem value="Software & Technology">Software & Technology</SelectItem>
                    <SelectItem value="Fashion & Retail">Fashion & Retail</SelectItem>
                    <SelectItem value="Automotive & Industrial">Automotive & Industrial</SelectItem>
                    <SelectItem value="Financial Services">Financial Services</SelectItem>
                    <SelectItem value="Hospitality">Hospitality</SelectItem>
                    <SelectItem value="Supply Chain">Supply Chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Origin Country</label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Country</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="Singapore">Singapore</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Origin Continent</label>
                <Select value={continentFilter} onValueChange={setContinentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Continent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Continent</SelectItem>
                    <SelectItem value="North America">North America</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="Asia">Asia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Started At</label>
                <Select value={startedAtFilter} onValueChange={setStartedAtFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="2020-2024">2020-2024</SelectItem>
                    <SelectItem value="2015-2019">2015-2019</SelectItem>
                    <SelectItem value="2010-2014">2010-2014</SelectItem>
                    <SelectItem value="before-2010">Before 2010</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Growth Method</label>
                <Select value={growthMethodFilter} onValueChange={setGrowthMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="organic">Organic</SelectItem>
                    <SelectItem value="paid-ads">Paid Advertising</SelectItem>
                    <SelectItem value="viral">Viral Marketing</SelectItem>
                    <SelectItem value="partnerships">Partnerships</SelectItem>
                    <SelectItem value="content">Content Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Business Model</label>
                <Select value={businessModelFilter} onValueChange={setBusinessModelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="one-time">One-time Purchase</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="advertising">Advertising</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Founders</label>
                <Select value={foundersFilter} onValueChange={setFoundersFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="solo">Solo Founder</SelectItem>
                    <SelectItem value="2-founders">2 Founders</SelectItem>
                    <SelectItem value="3-founders">3 Founders</SelectItem>
                    <SelectItem value="4+-founders">4+ Founders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Employees</label>
                <Select value={employeesFilter} onValueChange={setEmployeesFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">Just Founder</SelectItem>
                    <SelectItem value="2-10">2-10 Employees</SelectItem>
                    <SelectItem value="11-50">11-50 Employees</SelectItem>
                    <SelectItem value="51+">51+ Employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Funding</label>
                <Select value={fundingFilter} onValueChange={setFundingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                    <SelectItem value="seed">Seed Funding</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b+">Series B+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Customer</label>
                <Select value={customerFilter} onValueChange={setCustomerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="b2b">B2B</SelectItem>
                    <SelectItem value="b2c">B2C</SelectItem>
                    <SelectItem value="b2b2c">B2B2C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">ICP</label>
                <Select value={icpFilter} onValueChange={setIcpFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="startups">Startups</SelectItem>
                    <SelectItem value="sme">SME</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="consumers">Consumers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Content List */}
          <main className="flex-1">
            <div className="space-y-6">
              {filteredCaseStudies.map((caseStudy) => (
                <Link key={caseStudy.id} to={`/content/${caseStudy.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={caseStudy.founderImage} alt={caseStudy.founderName} />
                          <AvatarFallback>
                            {caseStudy.founderName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl hover:text-primary transition-colors">
                              {caseStudy.title}
                            </CardTitle>
                            <Badge variant={caseStudy.outcome === "successful" ? "default" : "destructive"}>
                              {caseStudy.outcome === "successful" ? "Success" : "Failure"}
                            </Badge>
                          </div>
                          <CardDescription className="text-base leading-relaxed">
                            {caseStudy.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div>
                            <span className="text-2xl font-bold text-foreground">{caseStudy.monthlyRevenue}</span>
                            <span className="text-muted-foreground ml-1">Monthly Revenue</span>
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-foreground">{caseStudy.startupCosts}</span>
                            <span className="text-muted-foreground ml-1">Entry Costs</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                              <Avatar key={i} className="w-6 h-6 border-2 border-background">
                                <AvatarFallback className="text-xs bg-muted">
                                  {i}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Read by <strong>{caseStudy.readBy}</strong>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Content;
