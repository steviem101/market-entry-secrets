
import { TrendingUp, Database, Map } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface LeadsHeroProps {
  csvListsCount: number;
  tamMapsCount: number;
}

export const LeadsHero = ({ csvListsCount, tamMapsCount }: LeadsHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <TrendingUp className="w-12 h-12 text-purple-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Sales Leads & <span className="text-purple-600">Market Intelligence</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Access premium databases and Total Addressable Market (TAM) maps to accelerate your market entry and sales strategy
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <SubmissionButton submissionType="data_request" variant="hero" size="lg" />
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
            <div className="text-3xl font-bold text-purple-600 mb-1">{csvListsCount}</div>
            <div className="text-sm text-gray-600">Lead Databases</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
            <div className="text-3xl font-bold text-violet-600 mb-1">{tamMapsCount}</div>
            <div className="text-sm text-gray-600">TAM Maps</div>
          </div>
        </div>
      </div>
    </section>
  );
};
