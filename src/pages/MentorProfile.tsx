import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  MapPin,
  Globe,
  Linkedin,
  CheckCircle,
  Star,
  Clock,
  ChevronRight,
  ArrowLeft,
  Phone,
  DollarSign,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkButton } from "@/components/BookmarkButton";
import { MentorContactModal } from "@/components/mentors/MentorContactModal";
import {
  useMentorBySlug,
  useMentorExperience,
  useMentorTestimonials,
} from "@/hooks/useMentors";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const AvailabilityBadge = ({ availability }: { availability: string | null }) => {
  if (!availability) return null;
  const config: Record<string, { label: string; className: string }> = {
    available: { label: "Available", className: "bg-green-100 text-green-700 border-green-200" },
    limited: { label: "Limited Availability", className: "bg-amber-100 text-amber-700 border-amber-200" },
    unavailable: { label: "Unavailable", className: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const c = config[availability] || config.unavailable;
  return (
    <span className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full border ${c.className}`}>
      <span className="w-2 h-2 rounded-full bg-current mr-2" />
      {c.label}
    </span>
  );
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
        }`}
      />
    ))}
  </div>
);

const MentorProfile = () => {
  const { categorySlug, mentorSlug } = useParams<{
    categorySlug: string;
    mentorSlug: string;
  }>();
  const { data: mentor, isLoading, error } = useMentorBySlug(categorySlug, mentorSlug);
  const { data: experiences = [] } = useMentorExperience(mentor?.id);
  const { data: testimonials = [] } = useMentorTestimonials(mentor?.id);
  const [showContact, setShowContact] = useState(false);

  // Also check experience_tiles from JSONB as fallback
  const experienceTiles = mentor?.experience_tiles
    ? (Array.isArray(mentor.experience_tiles)
        ? (mentor.experience_tiles as { id?: string; name: string; logo?: string }[])
        : [])
    : [];

  const allExperiences =
    experiences.length > 0
      ? experiences
      : experienceTiles.map((t, i) => ({
          id: t.id || String(i),
          company_name: t.name,
          company_logo_url: t.logo || null,
          company_website: null,
          relationship_type: null,
          display_order: i,
        }));

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <>
        <Helmet>
          <title>Mentor Not Found | Market Entry Secrets</title>
        </Helmet>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Mentor Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The mentor profile you're looking for could not be found.
            </p>
            <Button asChild>
              <Link to="/mentors">Browse All Mentors</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  const metaTitle =
    mentor.meta_title ||
    `${mentor.name} | ${mentor.title} | Market Entry Secrets`;
  const metaDescription =
    mentor.meta_description ||
    mentor.tagline ||
    mentor.description.slice(0, 160);
  const canonicalUrl = `https://marketentrysecrets.com/mentors/${mentor.category_slug || "experts"}/${mentor.slug}`;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        {(mentor.avatar_url || mentor.image) && (
          <meta property="og:image" content={mentor.avatar_url || mentor.image || ""} />
        )}
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      {/* Cover strip */}
      <div
        className="h-40 md:h-52 bg-gradient-to-r from-primary/80 to-primary/40"
        style={
          mentor.cover_image_url
            ? { backgroundImage: `url(${mentor.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      />

      <div className="container mx-auto px-4 pb-12">
        {/* Breadcrumb */}
        <div className="mb-4 pt-4">
          <nav className="flex items-center text-sm text-muted-foreground gap-1">
            <Link to="/mentors" className="hover:text-primary flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Mentors
            </Link>
            {mentor.category_slug && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to={`/mentors/${mentor.category_slug}`} className="hover:text-primary capitalize">
                  {mentor.category_slug.replace(/-/g, " ")}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground">{mentor.name}</span>
          </nav>
        </div>

        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
          <div className="relative -mt-20 md:-mt-24">
            <Avatar className="w-24 h-24 md:w-28 md:h-28 border-4 border-background shadow-lg">
              <AvatarImage src={mentor.avatar_url || mentor.image || undefined} alt={mentor.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl md:text-3xl">
                {getInitials(mentor.name)}
              </AvatarFallback>
            </Avatar>
            {mentor.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                <CheckCircle className="w-6 h-6 text-primary fill-primary/10" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{mentor.name}</h1>
                  {mentor.is_featured && (
                    <Badge className="bg-amber-500 hover:bg-amber-500 text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-primary font-medium text-lg">{mentor.title}</p>
                {mentor.company && (
                  <p className="text-muted-foreground">{mentor.company}</p>
                )}
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {mentor.location_city && mentor.location_state
                      ? `${mentor.location_city}, ${mentor.location_state}`
                      : mentor.location}
                  </span>
                  <AvailabilityBadge availability={mentor.availability} />
                </div>
                {mentor.tagline && (
                  <p className="text-muted-foreground italic mt-2">{mentor.tagline}</p>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <BookmarkButton
                  contentType="community_member"
                  contentId={mentor.id}
                  title={mentor.name}
                  description={mentor.description}
                  metadata={{
                    title: mentor.title,
                    company: mentor.company,
                    location: mentor.location,
                    specialties: mentor.specialties,
                  }}
                  size="default"
                  variant="outline"
                />
                <Button onClick={() => setShowContact(true)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {mentor.bio_full || mentor.description}
              </p>
            </section>

            {/* Specialties */}
            {mentor.specialties.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.specialties.map((s) => (
                    <Badge key={s} variant="secondary" className="text-sm">
                      {s}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Experience</h2>
              <p className="text-muted-foreground leading-relaxed">
                {mentor.experience}
              </p>
              {mentor.years_experience && (
                <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{mentor.years_experience}+ years of experience</span>
                </div>
              )}
            </section>

            {/* Experience with */}
            {allExperiences.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Experience With</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {allExperiences.map((exp) => {
                    const initials = exp.company_name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <div
                        key={exp.id}
                        className="flex flex-col items-center p-4 bg-card border rounded-lg"
                      >
                        <div className="w-14 h-14 rounded-lg border bg-white flex items-center justify-center overflow-hidden mb-2">
                          {exp.company_logo_url ? (
                            <img
                              src={exp.company_logo_url}
                              alt={exp.company_name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement("span");
                                  fallback.className = "text-sm font-semibold text-primary";
                                  fallback.textContent = initials;
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <span className="text-sm font-semibold text-primary">
                              {initials}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-center font-medium">
                          {exp.company_name}
                        </span>
                        {exp.relationship_type && (
                          <span className="text-xs text-muted-foreground capitalize">
                            {exp.relationship_type}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Testimonials</h2>
                <div className="space-y-4">
                  {testimonials.map((t) => (
                    <Card key={t.id}>
                      <CardContent className="pt-6">
                        {t.rating && <StarRating rating={t.rating} />}
                        <blockquote className="text-muted-foreground italic mt-2 mb-3">
                          "{t.quote}"
                        </blockquote>
                        <div className="text-sm">
                          <span className="font-medium">{t.reviewer_name}</span>
                          {t.reviewer_title && (
                            <span className="text-muted-foreground">
                              , {t.reviewer_title}
                            </span>
                          )}
                          {t.reviewer_company && (
                            <span className="text-muted-foreground">
                              {" "}at {t.reviewer_company}
                            </span>
                          )}
                          {t.reviewer_country && (
                            <span className="text-muted-foreground">
                              {" "}({t.reviewer_country})
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Markets */}
                {mentor.markets_served && mentor.markets_served.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1.5">Markets</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.markets_served.map((m) => (
                        <Badge key={m} variant="outline" className="text-xs">
                          {m === "australia"
                            ? "🇦🇺 Australia"
                            : m === "new_zealand"
                            ? "🇳🇿 New Zealand"
                            : "🌏 Global"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sectors */}
                {mentor.sectors && mentor.sectors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1.5">Sectors</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.sectors.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {mentor.languages && mentor.languages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Languages className="w-3.5 h-3.5" />
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.languages.map((l) => (
                        <Badge key={l} variant="outline" className="text-xs capitalize">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement model */}
                {mentor.engagement_model && mentor.engagement_model.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1.5">Engagement</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.engagement_model.map((e) => (
                        <Badge key={e} variant="outline" className="text-xs capitalize">
                          {e.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rate */}
                {mentor.session_rate_aud !== null && mentor.session_rate_aud !== undefined && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      Rate
                    </h4>
                    <p className="text-sm">
                      {mentor.session_rate_aud > 0
                        ? `AUD $${mentor.session_rate_aud}/hr`
                        : "Pro Bono"}
                    </p>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-col gap-2 pt-2">
                  {mentor.linkedin_url && (
                    <a
                      href={mentor.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </a>
                  )}
                  {mentor.website && (
                    <a
                      href={mentor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Interested in connecting with {mentor.name}? Send a contact
                  request and they'll get back to you.
                </p>
                <Button className="w-full" onClick={() => setShowContact(true)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Send Contact Request
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact modal */}
      <MentorContactModal
        mentor={mentor}
        isOpen={showContact}
        onClose={() => setShowContact(false)}
      />
    </>
  );
};

export default MentorProfile;
