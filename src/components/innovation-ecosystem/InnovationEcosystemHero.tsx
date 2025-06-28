
import { Lightbulb, Building, Users } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface InnovationEcosystemHeroProps {
  organizationCount: number;
  locationCount: number;
}

export const InnovationEcosystemHero = ({ 
  organizationCount, 
  locationCount 
}: InnovationEcosystemHeroProps) => {
  return (
    <section className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full">
              <Lightbulb className="w-12 h-12 text-orange-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Innovation <span className="text-orange-600">Ecosystem</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover incubators, accelerators, innovation hubs, and startup ecosystems worldwide. Find the right partners to help scale your business and access global markets through established innovation networks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SubmissionButton submissionType="innovation_organization" variant="hero" size="lg" />
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-orange-600 mb-1">{organizationCount}</div>
              <div className="text-sm text-gray-600">Innovation Organizations</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-blue-600 mb-1">{locationCount}</div>
              <div className="text-sm text-gray-600">Global Locations</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-green-600 mb-1">500+</div>
              <div className="text-sm text-gray-600">Startups Supported</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
