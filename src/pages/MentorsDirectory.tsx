import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMentors, useMentorCategories } from "@/hooks/useMentors";
import { useAuth } from "@/hooks/useAuth";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { PaywallModal } from "@/components/PaywallModal";
import { UsageBanner } from "@/components/UsageBanner";
import { MentorsHero } from "@/components/mentors/MentorsHero";
import MentorCard from "@/components/mentors/MentorCard";
import { MentorContactModal } from "@/components/mentors/MentorContactModal";
import {
  MentorFilters,
  useMentorFilters,
  useFilteredMentors,
} from "@/components/mentors/MentorFilters";
import type { Mentor } from "@/hooks/useMentors";

const MentorsDirectory = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const { user, loading: authLoading } = useAuth();
  const { hasReachedLimit } = useUsageTracking();
  const { data: mentors = [], isLoading, error } = useMentors();
  const { data: categories = [] } = useMentorCategories();
  const { filters, setFilters } = useMentorFilters();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contactMentor, setContactMentor] = useState<Mentor | null>(null);

  // Pre-filter by category from URL param
  useEffect(() => {
    if (categorySlug && filters.category !== categorySlug) {
      setFilters({ ...filters, category: categorySlug });
    }
  }, [categorySlug]);

  const filteredMentors = useFilteredMentors(mentors, filters);

  const allLocations = Array.from(new Set(mentors.map((m) => m.location))).sort();
  const currentCategory = categories.find((c) => c.slug === filters.category);

  const pageTitle = currentCategory
    ? `${currentCategory.name} Mentors | Market Entry Secrets`
    : "Market Entry Mentors & Experts | Market Entry Secrets";
  const pageDescription = currentCategory
    ? `Connect with ${currentCategory.name.toLowerCase()} experts helping companies enter the Australian and New Zealand markets.`
    : "Connect with experienced mentors and experts who help international companies enter the Australian and New Zealand markets.";

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
        </Helmet>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground mt-4">Loading mentors...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Error | Market Entry Secrets</title>
        </Helmet>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Error Loading Mentors</h2>
            <p className="text-muted-foreground mb-6">
              {(error as Error).message || "Failed to load mentors"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link
          rel="canonical"
          href={`https://marketentrysecrets.com/mentors${categorySlug ? `/${categorySlug}` : ""}`}
        />
      </Helmet>

      <MentorsHero
        totalExperts={mentors.length}
        totalLocations={allLocations.length}
      />

      <MentorFilters
        filters={filters}
        onFiltersChange={setFilters}
        mentors={mentors}
        categories={categories}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {/* Category breadcrumb */}
        {currentCategory && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{currentCategory.name}</span> mentors
              {" "}({filteredMentors.length} found)
            </p>
          </div>
        )}

        {/* Results */}
        {!authLoading && hasReachedLimit && !user ? (
          <PaywallModal contentType="community_members" />
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters to find more mentors.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onContact={setContactMentor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contact modal */}
      <MentorContactModal
        mentor={contactMentor}
        isOpen={!!contactMentor}
        onClose={() => setContactMentor(null)}
      />
    </>
  );
};

export default MentorsDirectory;
