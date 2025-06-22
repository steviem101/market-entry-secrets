
import PersonCard from "@/components/PersonCard";
import { FreemiumGate } from "@/components/FreemiumGate";
import SectorSection from "./SectorSection";
import { useSectorHandlers } from "@/hooks/useSectorHandlers";

interface CommunityMembersSectionProps {
  communityMembers: any[];
}

const CommunityMembersSection = ({ communityMembers }: CommunityMembersSectionProps) => {
  const { handleViewProfile, handleContact } = useSectorHandlers();

  if (communityMembers.length === 0) return null;

  return (
    <SectorSection
      title="Industry Experts & Mentors"
      viewAllLink="/mentors"
      viewAllText="View All Experts"
      isEmpty={false}
    >
      {communityMembers.slice(0, 6).map((member) => (
        <FreemiumGate
          key={member.id}
          contentType="community_members"
          itemId={member.id}
        >
          <PersonCard
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
              experienceTiles: member.experience_tiles ? (Array.isArray(member.experience_tiles) ? member.experience_tiles as any[] : []) : []
            }}
            onViewProfile={handleViewProfile}
            onContact={handleContact}
          />
        </FreemiumGate>
      ))}
    </SectorSection>
  );
};

export default CommunityMembersSection;
