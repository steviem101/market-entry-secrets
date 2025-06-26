
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import PersonCard, { Person } from "@/components/PersonCard";
import PersonModal from "@/components/PersonModal";
import { FreemiumGate } from "@/components/FreemiumGate";
import { UsageBanner } from "@/components/UsageBanner";
import { CommunityHero } from "@/components/community/CommunityHero";
import { CommunityFilters } from "@/components/community/CommunityFilters";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { data: members = [], isLoading, error } = useCommunityMembers();

  // Get all unique specialties and locations
  const allSpecialties = Array.from(
    new Set(members.flatMap(member => member.specialties))
  ).sort();

  const allLocations = Array.from(
    new Set(members.map(member => member.location))
  ).sort();

  // Filter members based on search, specialty, and location
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
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const hasActiveFilters = selectedSpecialty !== null || selectedLocation !== "all";

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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading community members...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <CommunityHero 
        totalExperts={members.length}
        totalLocations={allLocations.length}
      />

      <CommunityFilters
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocation={selectedLocation}
        selectedSpecialty={selectedSpecialty}
        onLocationChange={setSelectedLocation}
        onSpecialtyChange={setSelectedSpecialty}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        locations={allLocations}
        specialties={allSpecialties}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
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
              <FreemiumGate
                key={member.id}
                contentType="community_members"
                itemId={member.id}
                contentTitle={member.name}
                contentDescription={member.description}
              >
                <PersonCard
                  person={member}
                  onViewProfile={handleViewProfile}
                  onContact={handleContact}
                />
              </FreemiumGate>
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
    </div>
  );
};

export default Community;
