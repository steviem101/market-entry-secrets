
import { useParams } from "react-router-dom";
import { getSectorConfig } from "@/config/sectors";
import Navigation from "@/components/Navigation";
import { useSectorServiceProviders, useSectorEvents, useSectorLeads, useSectorCommunityMembers } from "@/hooks/useSectorData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building2, Calendar, Database, Users } from "lucide-react";
import CompanyCard from "@/components/CompanyCard";
import EventCard from "@/components/EventCard";
import LeadCard from "@/components/LeadCard";
import PersonCard from "@/components/PersonCard";
import NotFound from "./NotFound";

const SectorPage = () => {
  const { sectorId } = useParams<{ sectorId: string }>();
  const sectorConfig = getSectorConfig(sectorId || '');

  const { data: serviceProviders = [], isLoading: providersLoading } = useSectorServiceProviders(sectorId || '');
  const { data: events = [], isLoading: eventsLoading } = useSectorEvents(sectorId || '');
  const { data: leads = [], isLoading: leadsLoading } = useSectorLeads(sectorId || '');
  const { data: communityMembers = [], isLoading: communityLoading } = useSectorCommunityMembers(sectorId || '');

  if (!sectorConfig) {
    return <NotFound />;
  }

  const isLoading = providersLoading || eventsLoading || leadsLoading || communityLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {sectorConfig.heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {sectorConfig.heroDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviceProviders.length}</div>
              <p className="text-xs text-muted-foreground">
                Specialized providers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">
                Industry events
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Leads</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
              <p className="text-xs text-muted-foreground">
                Data opportunities
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expert Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{communityMembers.length}</div>
              <p className="text-xs text-muted-foreground">
                Industry experts
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading sector data...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Service Providers Section */}
            {serviceProviders.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Specialized Service Providers</h2>
                  <Link to="/service-providers">
                    <Button variant="outline">View All Providers</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceProviders.slice(0, 6).map((provider) => (
                    <CompanyCard
                      key={provider.id}
                      company={{
                        id: provider.id,
                        name: provider.name,
                        description: provider.description,
                        location: provider.location,
                        founded: provider.founded,
                        employees: provider.employees,
                        services: provider.services || [],
                        website: provider.website,
                        contact: provider.contact,
                        logo: provider.logo,
                        experienceTiles: provider.experience_tiles ? (Array.isArray(provider.experience_tiles) ? provider.experience_tiles as any[] : []) : [],
                        contactPersons: provider.contact_persons ? (Array.isArray(provider.contact_persons) ? provider.contact_persons as any[] : []) : []
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Events Section */}
            {events.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Upcoming Industry Events</h2>
                  <Link to="/events">
                    <Button variant="outline">View All Events</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.slice(0, 6).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Leads Section */}
            {leads.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Available Market Data</h2>
                  <Link to="/leads">
                    <Button variant="outline">View All Leads</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {leads.slice(0, 6).map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              </section>
            )}

            {/* Community Members Section */}
            {communityMembers.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Industry Experts & Mentors</h2>
                  <Link to="/mentors">
                    <Button variant="outline">View All Experts</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        experienceTiles: member.experience_tiles ? (Array.isArray(member.experience_tiles) ? member.experience_tiles as any[] : []) : []
                      }}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* No Data Message */}
            {serviceProviders.length === 0 && events.length === 0 && leads.length === 0 && communityMembers.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">No {sectorConfig.name} Data Available</h3>
                <p className="text-muted-foreground mb-6">
                  We're currently building our {sectorConfig.name} ecosystem. Check back soon for updates!
                </p>
                <Link to="/">
                  <Button>Explore Other Sectors</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectorPage;
