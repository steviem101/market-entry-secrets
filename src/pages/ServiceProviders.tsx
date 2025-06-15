
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import CompanyModal from "@/components/CompanyModal";
import { useBookmarks } from "@/hooks/useBookmarks";
import { toast } from "sonner";
import { Company } from "@/components/CompanyCard";
import { ServiceProvidersHeader } from "@/components/service-providers/ServiceProvidersHeader";
import { ServiceProvidersFilters } from "@/components/service-providers/ServiceProvidersFilters";
import { ServiceProvidersList } from "@/components/service-providers/ServiceProvidersList";
import { ServiceProvidersLayout } from "@/components/service-providers/ServiceProvidersLayout";
import { ServiceProvidersDataProvider } from "@/components/service-providers/ServiceProvidersDataProvider";

const serviceCategories = [
  { id: "consulting", name: "Business Consulting", count: 15 },
  { id: "legal", name: "Legal Services", count: 12 },
  { id: "accounting", name: "Accounting & Finance", count: 8 },
  { id: "marketing", name: "Marketing & PR", count: 10 },
  { id: "technology", name: "Technology Services", count: 18 },
  { id: "hr", name: "Human Resources", count: 6 }
];

const categoryGroups = [
  {
    id: "professional",
    name: "Professional Services",
    totalCount: 35,
    categories: [
      { id: "legal", name: "Legal & Compliance", count: 12 },
      { id: "accounting", name: "Accounting & Tax", count: 8 },
      { id: "consulting", name: "Strategy Consulting", count: 15 }
    ]
  },
  {
    id: "business",
    name: "Business Support",
    totalCount: 28,
    categories: [
      { id: "marketing", name: "Marketing & Communications", count: 10 },
      { id: "hr", name: "HR & Recruitment", count: 6 },
      { id: "operations", name: "Operations Support", count: 12 }
    ]
  },
  {
    id: "technology",
    name: "Technology & Digital",
    totalCount: 25,
    categories: [
      { id: "software", name: "Software Development", count: 12 },
      { id: "cybersecurity", name: "Cybersecurity", count: 8 },
      { id: "digital", name: "Digital Transformation", count: 5 }
    ]
  }
];

const ServiceProviders = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const { fetchBookmarks } = useBookmarks();

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleViewProfile = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleContact = (company: Company) => {
    toast.success(`Contact request sent to ${company.name}!`);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <ServiceProvidersDataProvider
        selectedCategories={selectedCategories}
        selectedLocations={selectedLocations}
        searchTerm={searchTerm}
        serviceCategories={serviceCategories}
        categoryGroups={categoryGroups}
      >
        {({ companies, loading, filteredCompanies }) => {
          if (loading) {
            return (
              <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-muted-foreground">Loading service providers...</span>
                </div>
              </div>
            );
          }

          return (
            <>
              <ServiceProvidersHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                filteredCount={filteredCompanies.length}
              />

              <ServiceProvidersLayout
                filters={
                  <ServiceProvidersFilters
                    categories={serviceCategories}
                    categoryGroups={categoryGroups}
                    selectedCategories={selectedCategories}
                    onCategoryChange={setSelectedCategories}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedLocations={selectedLocations}
                    onLocationChange={setSelectedLocations}
                    showFilters={showFilters}
                  />
                }
                content={
                  <ServiceProvidersList
                    companies={filteredCompanies}
                    onViewProfile={handleViewProfile}
                    onContact={handleContact}
                  />
                }
              />
            </>
          );
        }}
      </ServiceProvidersDataProvider>

      <CompanyModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContact={handleContact}
      />
    </div>
  );
};

export default ServiceProviders;
