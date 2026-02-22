
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Company, ExperienceTile, ContactPerson } from "@/components/CompanyCard";
import { useSectors } from "@/hooks/useSectors";

type ServiceProvider = Tables<'service_providers'>;

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
  personaFilter?: string | null;
}

export const ServiceProvidersDataProvider = ({
  children,
  selectedLocations,
  searchTerm,
  selectedType,
  selectedSector,
  personaFilter
}: ServiceProvidersDataProviderProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: sectors } = useSectors();

  useEffect(() => {
    fetchServiceProviders();
  }, [personaFilter]);

  const fetchServiceProviders = async () => {
    try {
      let queryBuilder = supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (personaFilter && personaFilter !== 'all') {
        queryBuilder = queryBuilder.or(
          `serves_personas.cs.{${personaFilter}},serves_personas.eq.{}`
        );
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      const transformedData: Company[] = data.map((provider: ServiceProvider) => {
        // Type-safe conversion of JSON fields
        let experienceTiles: ExperienceTile[] = [];
        let contactPersons: ContactPerson[] = [];

        // Parse experience_tiles if it exists and is an array
        if (provider.experience_tiles && Array.isArray(provider.experience_tiles)) {
          experienceTiles = (provider.experience_tiles as any[]).filter(tile => 
            tile && typeof tile === 'object' && tile.id && tile.name
          ) as ExperienceTile[];
        }

        // Parse contact_persons if it exists and is an array
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
          experienceTiles,
          contactPersons
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
      // Extract type-like keywords from services
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

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));

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
    
    return matchesSearch && matchesLocation && matchesType && matchesSector;
  });

  // Calculate comprehensive counts
  const totalCompanies = companies.length;
  const uniqueLocations = [...new Set(companies.map(company => company.location))].length;
  const totalServices = [...new Set(companies.flatMap(company => company.services))].length;

  return <>{children({ 
    companies, 
    loading, 
    filteredCompanies, 
    uniqueTypes, 
    uniqueSectors,
    totalCompanies, 
    uniqueLocations,
    totalServices
  })}</>;
};
