
import { ArrowRight, Database, Users, Building2, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const BeforeAfterSection = () => {
  const beforeItems = [
    {
      title: "Market Research",
      description: "Months of manual research, unreliable data sources",
      icon: Database
    },
    {
      title: "Lead Generation", 
      description: "Cold outreach, unqualified prospects, low conversion rates",
      icon: Users
    },
    {
      title: "TAM Analysis",
      description: "Expensive consulting, outdated market sizing, guesswork",
      icon: Globe
    },
    {
      title: "Legal Partners",
      description: "Endless networking, unvetted lawyers, costly mistakes",
      icon: Building2
    },
    {
      title: "Regulatory Maze",
      description: "Complex compliance, missed requirements, delays",
      icon: CheckCircle
    },
    {
      title: "Banking Setup",
      description: "Bureaucratic processes, wrong bank choices, hidden fees",
      icon: Building2
    },
    {
      title: "Cultural Gaps",
      description: "Trial and error, cultural missteps, lost opportunities",
      icon: Globe
    },
    {
      title: "Local Partnerships",
      description: "Cold outreach, trust issues, wrong partners",
      icon: Users
    },
    {
      title: "Marketing Localization",
      description: "Expensive testing, cultural misalignment, wasted budget",
      icon: Database
    },
    {
      title: "Talent Acquisition",
      description: "Unfamiliar processes, bad hires, compliance issues",
      icon: Users
    }
  ];

  const solutionHighlights = [
    "100+ Premium Lead Databases - Pre-qualified contact lists by industry/location",
    "TAM Maps & Market Intelligence - Real-time market sizing and opportunity analysis",
    "500+ Vetted Service Providers - Pre-screened legal, accounting, marketing partners",
    "Regulatory Playbooks - Step-by-step compliance guides and templates",
    "Cultural Intelligence Hub - Local insights and market entry strategies",
    "Proven Success Stories - 1,200+ case studies and lessons learned",
    "Expert Mentor Network - 200+ advisors who've done it before",
    "Monthly Market Events - 50+ networking and learning opportunities"
  ];

  return (
    <section className="relative py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            The Market Entry
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block mt-2">
              Transformation
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            See how we transform the complex, risky process of Australian market entry into a streamlined, proven system
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Before Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-2xl font-bold text-red-400 mb-2">Before Market Entry Secrets</h3>
              <p className="text-slate-400">The painful manual process most companies face</p>
            </div>

            <div className="grid gap-4">
              {beforeItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-slate-800/50 border border-red-900/20 hover:border-red-500/30 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-full shadow-2xl">
              <ArrowRight className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* After Section */}
          <div className="space-y-6">
            <div className="text-center lg:text-left mb-8">
              <h3 className="text-2xl font-bold text-green-400 mb-2">With Market Entry Secrets</h3>
              <p className="text-slate-400">We handle everything for you</p>
            </div>

            {/* Main Value Proposition */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 text-center mb-8">
              <h4 className="text-3xl font-bold text-white mb-4">
                WE TAKE CARE OF THAT
              </h4>
              <p className="text-slate-300 text-lg">
                Everything you need for successful Australian market entry, delivered through our proven system
              </p>
            </div>

            {/* Solution Highlights */}
            <div className="space-y-4">
              {solutionHighlights.map((highlight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300 text-sm leading-relaxed">{highlight}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold">
                <Link to="/leads">
                  <Database className="w-4 h-4 mr-2" />
                  Access Lead Database
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Link to="/service-providers">
                  <Building2 className="w-4 h-4 mr-2" />
                  Find Service Providers
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
