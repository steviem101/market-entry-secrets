import { useState } from "react";
import { ArrowRight, Users, Building2, TrendingUp, Calendar, Award, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyCard, { Company } from "@/components/CompanyCard";
import SearchFilters from "@/components/SearchFilters";
import CompanyModal from "@/components/CompanyModal";
import Navigation from "@/components/Navigation";
import { MasterSearch } from "@/components/MasterSearch";
import { AIChatSearch } from "@/components/AIChatSearch";
import { BookmarksSection } from "@/components/BookmarksSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { companies, serviceCategories, categoryGroups } from "@/data/mockData";

const Index = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'database' | 'ai'>('database');

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategories = selectedCategories.length === 0 || 
                             company.services.some(service => 
                               selectedCategories.some(catId => {
                                 const category = serviceCategories.find(c => c.id === catId) ||
                                                categoryGroups.flatMap(g => g.categories).find(c => c.id === catId);
                                 return category && service.toLowerCase().includes(category.name.toLowerCase());
                               })
                             );

    const matchesLocation = selectedLocations.length === 0 || 
                           selectedLocations.includes(company.location);
    
    return matchesSearch && matchesCategories && matchesLocation;
  });

  const handleViewProfile = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleContact = (company: Company) => {
    toast.success(`Contact request sent to ${company.name}!`);
    setIsModalOpen(false);
  };

  const featuredStats = [
    { icon: Building2, label: "Service Providers", value: "500+", link: "/service-providers" },
    { icon: Users, label: "Success Stories", value: "1,200+", link: "/mentors" },
    { icon: TrendingUp, label: "Market Entry Rate", value: "94%", link: "/about" },
    { icon: Calendar, label: "Monthly Events", value: "50+", link: "/events" },
    { icon: Award, label: "Expert Mentors", value: "200+", link: "/mentors" },
    { icon: Rocket, label: "Innovation Hubs", value: "25+", link: "/innovation-ecosystem" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Gateway to the
              <span className="text-primary block">Australian Market</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Connect with vetted service providers, learn from success stories, and accelerate your market entry with expert guidance.
            </p>
            
            {/* Unified Search Interface */}
            <div className="max-w-3xl mx-auto mb-12">
              <Tabs value={searchMode} onValueChange={(value) => setSearchMode(value as 'database' | 'ai')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/50 backdrop-blur-sm">
                  <TabsTrigger value="database" className="text-sm font-medium">
                    🔍 Search Database
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="text-sm font-medium">
                    🤖 Ask AI Assistant
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="database" className="space-y-2">
                  <MasterSearch placeholder="Search for legal, accounting, marketing services..." />
                  <p className="text-sm text-muted-foreground">
                    Search through our curated database of service providers and resources
                  </p>
                </TabsContent>
                
                <TabsContent value="ai" className="space-y-2">
                  <AIChatSearch placeholder="Ask me anything about entering the Australian market..." />
                  <p className="text-sm text-muted-foreground">
                    Get personalized guidance from our AI assistant trained on market entry expertise
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
              {featuredStats.map((stat, index) => (
                <Link key={index} to={stat.link} className="group">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
                      <stat.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bookmarks Section */}
      <BookmarksSection />

      {/* Featured Categories */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Services</h2>
            <p className="text-muted-foreground">Explore the most sought-after market entry services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.slice(0, 8).map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Professional {category.name.toLowerCase()} services for market entry
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Providers Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Featured Service Providers</h2>
              <p className="text-muted-foreground">
                {filteredCompanies.length} providers ready to help you succeed
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              Filters
            </Button>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <aside className="w-80 flex-shrink-0">
                <SearchFilters
                  categories={serviceCategories}
                  categoryGroups={categoryGroups}
                  selectedCategories={selectedCategories}
                  onCategoryChange={setSelectedCategories}
                  searchTerm=""
                  onSearchChange={() => {}}
                  selectedLocations={selectedLocations}
                  onLocationChange={setSelectedLocations}
                />
              </aside>
            )}

            {/* Main Content */}
            <main className="flex-1">
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No providers found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search criteria to find more providers.
                  </p>
                  <Button onClick={() => {
                    setSearchTerm("");
                    setSelectedCategories([]);
                    setSelectedLocations([]);
                  }}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredCompanies.slice(0, 9).map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      onViewProfile={handleViewProfile}
                      onContact={handleContact}
                    />
                  ))}
                </div>
              )}
              
              {filteredCompanies.length > 9 && (
                <div className="text-center mt-12">
                  <Button size="lg" className="group">
                    View All Providers
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Enter the Australian Market?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful businesses who've made Australia their new home
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Schedule Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Company Modal */}
      <CompanyModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContact={handleContact}
      />
    </div>
  );
};

export default Index;
