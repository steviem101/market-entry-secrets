import { Globe } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface TradeInvestmentAgenciesHeroProps {
  agencyCount: number;
  locationCount: number;
  categories?: any[];
  agencies?: any[];
}

export const TradeInvestmentAgenciesHero = ({
  agencyCount,
  locationCount,
  categories = [],
  agencies = []
}: TradeInvestmentAgenciesHeroProps) => {
  const govCount = agencies.filter((a: any) =>
    a.is_government_funded || ['federal_agency', 'state_body', 'nz_government'].includes(a.organisation_type)
  ).length;
  const industryCount = agencies.filter((a: any) =>
    ['industry_association', 'bilateral', 'chamber'].includes(a.organisation_type)
  ).length;
  const categoryCount = new Set(agencies.map((a: any) => a.category_slug).filter(Boolean)).size;

  return (
    <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <Globe className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Government & Industry <span className="text-green-600">Support</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with government agencies, industry associations, chambers of commerce, and bilateral trade organisations that support international business expansion into Australia and New Zealand.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SubmissionButton submissionType="trade_agency" variant="hero" size="lg" />
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-green-600 mb-1">{agencyCount}</div>
              <div className="text-sm text-gray-600">Organisations</div>
            </div>
            {govCount > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
                <div className="text-3xl font-bold text-blue-600 mb-1">{govCount}</div>
                <div className="text-sm text-gray-600">Government Bodies</div>
              </div>
            )}
            {industryCount > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
                <div className="text-3xl font-bold text-purple-600 mb-1">{industryCount}</div>
                <div className="text-sm text-gray-600">Industry & Bilateral</div>
              </div>
            )}
            {categoryCount > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
                <div className="text-3xl font-bold text-amber-600 mb-1">{categoryCount}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
