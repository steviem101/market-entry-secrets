
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Company, ExperienceTile, ContactPerson } from "@/components/CompanyCard";
import { useSectors } from "@/hooks/useSectors";

interface ServiceProvidersDataProviderProps {
  children: (data: {
    companies: Company[];
    loading: boolean;
    filteredCompanies: Company[];
    uniqueTypes: string[];
    uniqueSectors: string[];
    totalCompanies: number;
    uniqueLocations: number;
    totalServices: number;
  }) => React.ReactNode;
  selectedLocations: string[];
  searchTerm: string;
  selectedType: string;
  selectedSector: string;
  selectedCategory?: string;
  verifiedOnly?: boolean;
  sortBy?: string;
  personaFilter?: string;
}

export const ServiceProvidersDataProvider = ({
  children,
  selectedLocations,
  searchTerm,
  selectedType,
  selectedSector,
  selectedCategory = "all",
  verifiedOnly = false,
  sortBy = "name",
  personaFilter = 'all',
}: ServiceProvidersDataProviderProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: sectors } = useSectors();

  useEffect(() => {
    fetchServiceProviders();
  }, []);

  const fetchServiceProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (error) throw error;

      // Fetch categories for name mapping
      const { data: categories } = await (supabase as any)
        .from('service_provider_categories')
        .select('slug, name');
      const categoryMap = new Map<string, string>();
      (categories || []).forEach((c: any) => categoryMap.set(c.slug, c.name));

      const transformedData: Company[] = data.map((provider: any) => {
        let experienceTiles: ExperienceTile[] = [];
        let contactPersons: ContactPerson[] = [];

        if (provider.experience_tiles && Array.isArray(provider.experience_tiles)) {
          experienceTiles = (provider.experience_tiles as any[]).filter(tile =>
            tile && typeof tile === 'object' && tile.id && tile.name
          ) as ExperienceTile[];
        }

        if (provider.contact_persons && Array.isArray(provider.contact_persons)) {
          contactPersons = (provider.contact_persons as any[]).filter(person =>
            person && typeof person === 'object' && person.id && person.name
          ) as ContactPerson[];
        }

        return {
          id: provider.id,
          name: provider.name,
          description: provider.description,
          location: provider.location,
          founded: provider.founded,
          employees: provider.employees,
          services: provider.services || [],
          website: provider.website || undefined,
          contact: provider.contact || undefined,
          logo: provider.logo || undefined,
          basic_info: provider.basic_info || undefined,
          why_work_with_us: provider.why_work_with_us || undefined,
          experienceTiles,
          contactPersons,
          serves_personas: provider.serves_personas || [],
          // New fields
          slug: provider.slug || undefined,
          tagline: provider.tagline || undefined,
          logo_url: provider.logo_url || undefined,
          cover_image_url: provider.cover_image_url || undefined,
          website_url: provider.website_url || undefined,
          founded_year: provider.founded_year || undefined,
          team_size_range: provider.team_size_range || undefined,
          is_verified: provider.is_verified || false,
          is_featured: provider.is_featured || false,
          is_active: provider.is_active !== false,
          markets_served: provider.markets_served || [],
          support_types: provider.support_types || [],
          sectors: provider.sectors || [],
          engagement_model: provider.engagement_model || [],
          company_size_focus: provider.company_size_focus || [],
          price_range: provider.price_range || undefined,
          contact_email: provider.contact_email || undefined,
          contact_phone: provider.contact_phone || undefined,
          linkedin_url: provider.linkedin_url || undefined,
          location_city: provider.location_city || undefined,
          location_state: provider.location_state || undefined,
          location_country: provider.location_country || undefined,
          category_slug: provider.category_slug || undefined,
          category_name: provider.category_slug ? categoryMap.get(provider.category_slug) || undefined : undefined,
          meta_title: provider.meta_title || undefined,
          meta_description: provider.meta_description || undefined,
          view_count: provider.view_count || 0,
        };
      });

      setCompanies(transformedData);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      toast.error('Failed to load service providers');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique types from services
  const uniqueTypes = [...new Set(companies.flatMap(company =>
    company.services.map(service => {
      const typeKeywords = ['Consulting', 'Advisory', 'Implementation', 'Support', 'Training', 'Development', 'Management', 'Strategy', 'Analysis', 'Design'];
      const foundType = typeKeywords.find(keyword => service.toLowerCase().includes(keyword.toLowerCase()));
      return foundType || 'Service';
    })
  ))].filter(Boolean);

  // Extract unique sectors by matching services with sector keywords
  const uniqueSectors = sectors ? sectors
    .filter(sector =>
      companies.some(company =>
        company.services.some(service =>
          sector.service_keywords.some(keyword =>
            service.toLowerCase().includes(keyword.toLowerCase())
          )
        )
      )
    )
    .map(sector => sector.name) : [];

  const filteredCompanies = useMemo(() => {
    let filtered = companies.filter(company => {
      if (company.is_active === false) return false;

      const matchesSearch = searchTerm === "" ||
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.tagline && company.tagline.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLocation = selectedLocations.length === 0 ||
        selectedLocations.includes(company.location);

      const matchesType = selectedType === "all" ||
        company.services.some(service => service.toLowerCase().includes(selectedType.toLowerCase()));

      const matchesSector = selectedSector === "all" ||
        (sectors && sectors.some(sector =>
          sector.name === selectedSector &&
          company.services.some(service =>
            sector.service_keywords.some(keyword =>
              service.toLowerCase().includes(keyword.toLowerCase())
            )
          )
        ));

      const matchesCategory = selectedCategory === "all" ||
        company.category_slug === selectedCategory;

      const matchesVerified = !verifiedOnly || company.is_verified;

      const matchesPersona = personaFilter === 'all' ||
        !company.serves_personas?.length ||
        company.serves_personas.includes(personaFilter);

      return matchesSearch && matchesLocation && matchesType && matchesSector &&
        matchesCategory && matchesVerified && matchesPersona;
    });

    // Sort
    switch (sortBy) {
      case "featured":
        filtered = [...filtered].sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          if (a.is_verified && !b.is_verified) return -1;
          if (!a.is_verified && b.is_verified) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
      case "views":
        filtered = [...filtered].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case "name":
      default:
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [companies, searchTerm, selectedLocations, selectedType, selectedSector, selectedCategory, verifiedOnly, sortBy, personaFilter, sectors]);

  // Calculate comprehensive counts
  const totalCompanies = companies.length;
  const uniqueLocationsCount = [...new Set(companies.map(company => company.location))].length;
  const totalServices = [...new Set(companies.flatMap(company => company.services))].length;

  return <>{children({
    companies,
    loading,
    filteredCompanies,
    uniqueTypes,
    uniqueSectors,
    totalCompanies,
    uniqueLocations: uniqueLocationsCount,
    totalServices
  })}</>;
};
