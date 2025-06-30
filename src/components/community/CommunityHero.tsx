
import { Users } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface CommunityHeroProps {
  totalExperts: number;
  totalLocations: number;
}

export const CommunityHero = ({ totalExperts, totalLocations }: CommunityHeroProps) => {
  return (
    <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-100 p-4 rounded-full">
              <Users className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Connect with Market Entry <span className="text-purple-600">Experts</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get personalized guidance from experienced professionals who have successfully navigated international markets. Connect with mentors, advisors, and industry experts ready to help you succeed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SubmissionButton submissionType="mentor" variant="hero" size="lg" />
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-blue-600 mb-1">{totalLocations}</div>
              <div className="text-sm text-gray-600">Global Locations</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-green-600 mb-1">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
