
import PersonCard from "@/components/PersonCard";
import { ListingPageGate } from "@/components/ListingPageGate";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface CommunityMembersSectionProps {
  communityMembers: any[];
}

const CommunityMembersSection = ({ communityMembers }: CommunityMembersSectionProps) => {
  const { handleViewProfile, handleContact } = useSectorHandlers();

  if (communityMembers.length === 0) return null;

  return (
    <ListingPageGate contentType="community_members">
      <SectorSection
        title="Industry Experts & Mentors"
        viewAllLink="/mentors"
        viewAllText="View All Experts"
        isEmpty={false}
      >
        {communityMembers.slice(0, 6).map((member) => (
          <PersonCard
            key={member.id}
            person={{
              id: member.id,
              name: member.name,
              title: member.title,
              description: member.description,
              location: member.location,
              experience: member.experience,
              specialties: member.specialties || [],
              website: member.website,
              contact: member.contact,
              image: member.image,
              company: member.company,
              isAnonymous: member.is_anonymous,
              experienceTiles: Array.isArray(member.experience_tiles) ? member.experience_tiles : []
            }}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
          />
        ))}
      </SectorSection>
    </ListingPageGate>
  );
};

export default CommunityMembersSection;
