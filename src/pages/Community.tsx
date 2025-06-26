
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, MapPin, Globe, AlertCircle } from "lucide-react";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import PersonCard, { Person } from "@/components/PersonCard";
import PersonModal from "@/components/PersonModal";
import { FreemiumGate } from "@/components/FreemiumGate";
import { UsageBanner } from "@/components/UsageBanner";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Person | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: members = [], isLoading, error } = useCommunityMembers();

  // Get all unique specialties
  const allSpecialties = Array.from(
    new Set(members.flatMap(member => member.specialties))
  ).sort();

  // Filter members based on search and specialty
  const filteredMembers = members.filter(member => {
    const matchesSearch = searchQuery === "" || 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === null || 
      member.specialties.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  const handleViewProfile = (member: Person) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleContact = (member: Person) => {
    console.log('Contact member:', member.name);
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
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Market Entry <span className="text-primary">Experts</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Learn from real businesses that successfully entered the Australian market. 
            Get actionable insights, proven strategies, and expert guidance.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search success stories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />
        
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Specialty Filter */}
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No members found</h3>
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
