
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
        kicker="Mentors"
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
              experienceTiles: Array.isArray(member.experience_tiles) ? member.experience_tiles : [],
              slug: member.slug,
              // Canonical mentor URL is /mentors/experts/<slug> (matches the
              // sitemap + directory); category_slug is null on every row, so
              // PersonCard defaults the segment to "experts".
              categorySlug: member.category_slug || undefined
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
