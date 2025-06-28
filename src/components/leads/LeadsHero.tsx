
import { TrendingUp, Database, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            {csvListsCount} Lead Databases
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            {tamMapsCount} TAM Maps
          </Badge>
        </div>
      </div>
    </section>
  );
};
