
import { Building2, Users, MapPin } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface ServiceProvidersHeroProps {
  totalCompanies: number;
  uniqueLocations: number;
  totalServices: number;
}

export const ServiceProvidersHero = ({ 
  totalCompanies, 
  uniqueLocations, 
  totalServices 
}: ServiceProvidersHeroProps) => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Building2 className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find Expert <span className="text-blue-600">Service Providers</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with verified service providers who specialize in international market entry. From legal and accounting to marketing and logistics, find the expertise you need to succeed globally.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SubmissionButton submissionType="service_provider" variant="hero" size="lg" />
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalCompanies}</div>
              <div className="text-sm text-gray-600">Service Providers</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-green-600 mb-1">{uniqueLocations}</div>
              <div className="text-sm text-gray-600">Global Locations</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-purple-600 mb-1">{totalServices}</div>
              <div className="text-sm text-gray-600">Total Services</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
