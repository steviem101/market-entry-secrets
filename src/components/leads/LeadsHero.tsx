import { TrendingUp, Database, Map, BarChart3, Users } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface LeadsHeroProps {
  totalDatabases: number;
  totalRecords: number;
  countsByType: Record<string, number>;
}

export const LeadsHero = ({ totalDatabases, totalRecords, countsByType }: LeadsHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <TrendingUp className="w-12 h-12 text-purple-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Find Your First <span className="text-purple-600">500 Customers</span> in Australia
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Pre-verified B2B contact lists for the sectors you're entering — updated monthly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <SubmissionButton submissionType="data_request" variant="hero" size="lg" />
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
            <div className="text-3xl font-bold text-purple-600 mb-1">{totalDatabases}</div>
            <div className="text-sm text-gray-600">Total Databases</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
            <div className="text-3xl font-bold text-violet-600 mb-1">{totalRecords.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
          {(countsByType['Lead Database'] || 0) > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="text-3xl font-bold text-blue-600">{countsByType['Lead Database']}</span>
              </div>
              <div className="text-sm text-gray-600">Lead Databases</div>
            </div>
          )}
          {(countsByType['Market Data'] || 0) > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="flex items-center gap-2 justify-center mb-1">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="text-3xl font-bold text-purple-600">{countsByType['Market Data']}</span>
              </div>
              <div className="text-sm text-gray-600">Market Data</div>
            </div>
          )}
          {(countsByType['TAM Map'] || 0) > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Map className="w-5 h-5 text-green-600" />
                <span className="text-3xl font-bold text-green-600">{countsByType['TAM Map']}</span>
              </div>
              <div className="text-sm text-gray-600">TAM Maps</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
