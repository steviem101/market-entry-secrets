
import { useState } from "react";
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
}

const mockCaseStudies: CaseStudy[] = [
  {
    id: "1",
    title: "How I Turned A Crappy Idea Into A $3M/Year Business",
    description: "Starter Story grew to 1.4 million monthly visitors and millions in annual revenue by sharing the stories of entrepreneurs. Pat breaks down the early days and how he grew the business into something that changed his life.",
    monthlyRevenue: "$100K",
    startupCosts: "$100",
    businessType: "Content Platform",
    niche: "Media & Publishing",
    country: "United States",
    continent: "North America",
    readBy: "111,111 founders",
    founderName: "Pat Walls"
  },
  {
    id: "2",
    title: "I Grew A Drinkware Brand To $1.1M/Month At 23 Years Old",
    description: "BruMate is a successful insulated drinkware brand focused on the adult beverage community, with a flagship product that generated $2.1M in sales in 2017 and is now doing over $1.1M per month in sales, with plans to do $20M this year.",
    monthlyRevenue: "$12M",
    startupCosts: "$5K",
    businessType: "E-commerce",
    niche: "Consumer Products",
    country: "United States",
    continent: "North America",
    readBy: "128,235 founders",
    founderName: "Dylan Jacob"
  },
  {
    id: "3",
    title: "My SaaS Templates Make $40K/Month",
    description: "Building and selling SaaS templates and components that help other entrepreneurs launch their products faster. Started as a side project and grew into a substantial monthly recurring revenue stream.",
    monthlyRevenue: "$40K",
    startupCosts: "$500",
    businessType: "SaaS",
    niche: "Software & Technology",
    country: "Canada",
    continent: "North America",
    readBy: "89,432 founders",
    founderName: "Alex Chen"
  },
  {
    id: "4",
    title: "How I Built A $2M/Year Marketing Agency",
    description: "Started a digital marketing agency focused on helping Australian businesses enter international markets. Grew from a one-person operation to a team of 15 specialists serving clients across multiple continents.",
    monthlyRevenue: "$167K",
    startupCosts: "$2K",
    businessType: "Service",
    niche: "Marketing & Advertising",
    country: "Australia",
    continent: "Oceania",
    readBy: "75,621 founders",
    founderName: "Sarah Mitchell"
  },
  {
    id: "5",
    title: "I Created A $500K/Year Online Course Business",
    description: "Teaching entrepreneurs how to enter the Australian market through comprehensive online courses and coaching programs. Built a community of over 10,000 students worldwide.",
    monthlyRevenue: "$42K",
    startupCosts: "$1K",
    businessType: "Education",
    niche: "Online Education",
    country: "Australia",
    continent: "Oceania",
    readBy: "56,789 founders",
    founderName: "James Rodriguez"
  },
  {
    id: "6",
    title: "My Food Delivery App Reaches $300K/Month",
    description: "Built a specialized food delivery platform for healthy meal options in major Australian cities. Focused on connecting health-conscious consumers with local organic restaurants and meal prep services.",
    monthlyRevenue: "$300K",
    startupCosts: "$15K",
    businessType: "Marketplace",
    niche: "Food & Beverage",
    country: "Australia",
    continent: "Oceania",
    readBy: "92,156 founders",
    founderName: "Emma Thompson"
  }
];

const CaseStudies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [revenueFilter, setRevenueFilter] = useState("any");
  const [costsFilter, setCostsFilter] = useState("any");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("any");
  const [nicheFilter, setNicheFilter] = useState("any");
  const [countryFilter, setCountryFilter] = useState("any");
  const [continentFilter, setContinentFilter] = useState("any");

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
              <h1 className="text-4xl font-bold text-foreground mb-4">Full Case Studies Database</h1>
              <div className="flex gap-6 text-sm">
                <button className="text-foreground font-medium border-b-2 border-primary pb-1">All Case Studies</button>
                <button className="text-muted-foreground hover:text-foreground">My Favorites</button>
                <button className="text-muted-foreground hover:text-foreground">New Case Studies</button>
                <button className="text-muted-foreground hover:text-foreground">Random</button>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground">
              4,418 Founder Case Studies
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Try 'newsletter' or 'productized service'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-base"
            />
          </div>
          
          <p className="text-muted-foreground mt-4">
            Showing {filteredCaseStudies.length} of many case studies
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
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Content Platform">Content Platform</SelectItem>
                    <SelectItem value="Marketplace">Marketplace</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
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
                    <SelectItem value="Media & Publishing">Media & Publishing</SelectItem>
                    <SelectItem value="Consumer Products">Consumer Products</SelectItem>
                    <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
                    <SelectItem value="Online Education">Online Education</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Country</label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Country</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Continent</label>
                <Select value={continentFilter} onValueChange={setContinentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Continent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Continent</SelectItem>
                    <SelectItem value="North America">North America</SelectItem>
                    <SelectItem value="Oceania">Oceania</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="Asia">Asia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </aside>

          {/* Case Studies List */}
          <main className="flex-1">
            <div className="space-y-6">
              {filteredCaseStudies.map((caseStudy) => (
                <Card key={caseStudy.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={caseStudy.founderImage} alt={caseStudy.founderName} />
                        <AvatarFallback>
                          {caseStudy.founderName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 hover:text-primary transition-colors">
                          {caseStudy.title}
                        </CardTitle>
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
                          <span className="text-muted-foreground ml-1">Startup Costs</span>
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
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CaseStudies;
