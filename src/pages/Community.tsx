
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users } from "lucide-react";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import PersonCard, { Person } from "@/components/PersonCard";
import PersonModal from "@/components/PersonModal";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useAuth } from "@/hooks/useAuth";
import { PaywallModal } from "@/components/PaywallModal";
import { UsageBanner } from "@/components/UsageBanner";
import { CommunityHero } from "@/components/community/CommunityHero";
import { StandardDirectoryFilters } from "@/components/common/StandardDirectoryFilters";
import { mapSpecialtiesToSectors, getStandardTypes, STANDARD_SECTORS } from "@/utils/sectorMapping";
import { PersonaFilter, type PersonaFilterValue } from "@/components/PersonaFilter";
import { usePersona } from "@/contexts/PersonaContext";

const Community = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();
  const { persona } = usePersona();
  const [personaFilterValue, setPersonaFilterValue] = useState<PersonaFilterValue>(
    (persona as PersonaFilterValue) ?? 'all'
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: members = [], isLoading, error } = useCommunityMembers(personaFilterValue);

  // Get all unique specialties, locations, types, and sectors
  const allSpecialties = Array.from(
    new Set(members.flatMap(member => member.specialties))
  ).sort();

  const allLocations = Array.from(
    new Set(members.map(member => member.location))
  ).sort();

  const allTypes = getStandardTypes.community;

  const allSectors = Array.from(
    new Set(members.flatMap(member => mapSpecialtiesToSectors(member.specialties)))
  ).sort();

  // Filter members based on search, specialty, location, type, and sector
  const filteredMembers = members.filter(member => {
    const matchesSearch = searchQuery === "" || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === null || 
      member.specialties.includes(selectedSpecialty);
    
    const matchesLocation = selectedLocation === "all" || 
      member.location === selectedLocation;

    // Map member specialties to type (using first specialty as primary type)
    const memberType = member.specialties[0] || 'Expert';
    const matchesType = selectedType === "all" || 
      memberType === selectedType || 
      member.specialties.includes(selectedType);

    // Map member specialties to sectors
    const memberSectors = mapSpecialtiesToSectors(member.specialties);
    const matchesSector = selectedSector === "all" || 
      memberSectors.includes(selectedSector);
    
    return matchesSearch && matchesSpecialty && matchesLocation && matchesType && matchesSector;
  });

  const hasActiveFilters = selectedSpecialty !== null || selectedLocation !== "all" || 
    selectedType !== "all" || selectedSector !== "all";

  const handleViewProfile = (member: Person) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleContact = (member: Person) => {
    console.log('Contact member:', member.name);
  };

  const handleClearFilters = () => {
    setSelectedSpecialty(null);
    setSelectedLocation("all");
    setSelectedType("all");
    setSelectedSector("all");
  };

  if (isLoading) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading community members...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Error Loading Community</h2>
            <p className="text-muted-foreground mb-6">
              {error.message || 'Failed to load community members'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      
      <CommunityHero 
        totalExperts={members.length}
        totalLocations={allLocations.length}
      />

      <StandardDirectoryFilters
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        locations={allLocations}
        types={allTypes}
        sectors={allSectors}
        searchPlaceholder="Search experts, specialties, or locations..."
      >
        {/* Advanced Filters - Specialties */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground">Specialty:</span>
          <Button
            variant={selectedSpecialty === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSpecialty(null)}
          >
            All Specialties
          </Button>
          {allSpecialties.map((specialty) => (
            <Button
              key={specialty}
              variant={selectedSpecialty === specialty ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpecialty(specialty)}
            >
              {specialty}
            </Button>
          ))}
        </div>
      </StandardDirectoryFilters>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {/* Persona Filter */}
        <div className="mb-6">
          <PersonaFilter value={personaFilterValue} onChange={setPersonaFilterValue} />
        </div>

        {/* Members Grid */}
        {!authLoading && hasReachedLimit && !user ? (
          <PaywallModal contentType="community_members" />
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No experts found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria to find more community members.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <PersonCard
                key={member.id}
                person={member}
                onViewProfile={handleViewProfile}
                onContact={handleContact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Member Modal */}
      {selectedMember && (
        <PersonModal
          person={selectedMember}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onContact={handleContact}
        />
      )}
      
    </>
  );
};

export default Community;
