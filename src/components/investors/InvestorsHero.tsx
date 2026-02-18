import { Landmark } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface InvestorsHeroProps {
  investorCount: number;
  typeCounts: Record<string, number>;
}

const TYPE_LABELS: Record<string, string> = {
  vc: "VCs",
  angel: "Angels",
  venture_debt: "Venture Debt",
  accelerator: "Accelerators",
  grant: "Grants",
  other: "Other",
};

export const InvestorsHero = ({ investorCount, typeCounts }: InvestorsHeroProps) => {
  return (
    <section className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-violet-100 p-4 rounded-full">
              <Landmark className="w-12 h-12 text-violet-600" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Australian <span className="text-violet-600">Investors</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find venture capital firms, angel investors, accelerators, grants, and venture debt providers
            to fund your expansion into the Australian market.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SubmissionButton submissionType="service_provider" variant="hero" size="lg" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-violet-600 mb-1">{investorCount}</div>
              <div className="text-sm text-gray-600">Total Investors</div>
            </div>
            {Object.entries(typeCounts).map(([type, count]) => (
              count > 0 && (
                <div key={type} className="bg-white/80 backdrop-blur-sm rounded-lg px-5 py-4 shadow-sm border">
                  <div className="text-2xl font-bold text-violet-600 mb-1">{count}</div>
                  <div className="text-sm text-gray-600">{TYPE_LABELS[type] || type}</div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
