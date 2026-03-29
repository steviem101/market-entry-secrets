import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/common/CardGridSkeleton";
import { useMentors, useMentorCategories } from "@/hooks/useMentors";
import { ListingPageGate } from "@/components/ListingPageGate";
import { UsageBanner } from "@/components/UsageBanner";
import { MentorsHero } from "@/components/mentors/MentorsHero";
import MentorCard from "@/components/mentors/MentorCard";
import { MentorContactModal } from "@/components/mentors/MentorContactModal";
import { ListPagination } from "@/components/common/ListPagination";
import { EmptyState } from "@/components/common/EmptyState";
import {
  MentorFilters,
  useMentorFilters,
  useFilteredMentors,
} from "@/components/mentors/MentorFilters";
import type { Mentor } from "@/hooks/useMentors";

const PAGE_SIZE = 12;

const MentorsDirectory = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const { data: mentors = [], isLoading, error } = useMentors();
  const { data: categories = [] } = useMentorCategories();
  const { filters, setFilters } = useMentorFilters();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contactMentor, setContactMentor] = useState<Mentor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Pre-filter by category from URL param on mount or when param changes
  useEffect(() => {
    if (categorySlug && categorySlug !== filters.category) {
      setFilters({ ...filters, category: categorySlug });
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  const filteredMentors = useFilteredMentors(mentors, filters);

  const totalPages = Math.ceil(filteredMentors.length / PAGE_SIZE);
  const paginatedMentors = filteredMentors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
          <CardGridSkeleton count={6} />
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

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link
          rel="canonical"
          href={`https://market-entry-secrets.lovable.app/mentors${categorySlug ? `/${categorySlug}` : ""}`}
        />
      </Helmet>

      <MentorsHero
        totalExperts={mentors.length}
        totalLocations={allLocations.length}
      />

      <MentorFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        mentors={mentors}
        categories={categories}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
      />

      <div className="container mx-auto px-4 py-8">
        <UsageBanner />

        {/* Category breadcrumb + count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {currentCategory && (
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{currentCategory.name}</span> mentors
            </p>
          )}
          <p className="text-muted-foreground text-sm">
            Showing {paginatedMentors.length} of {filteredMentors.length} mentors
          </p>
        </div>

        {/* Results */}
        {filteredMentors.length === 0 ? (
          <EmptyState
            icon={<Users className="w-16 h-16" />}
            title="No mentors found"
            description="Try adjusting your search criteria or filters to find more mentors."
          />
        ) : (
          <>
            <ListingPageGate contentType="community_members">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onContact={setContactMentor}
                  />
                ))}
              </div>
            </ListingPageGate>
            <ListPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
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
