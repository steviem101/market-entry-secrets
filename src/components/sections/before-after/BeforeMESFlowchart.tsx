import { AlertTriangle, Search, Phone, DollarSign, Clock, Target, FileText, TrendingUp, Users, MapPin, Building, Zap } from "lucide-react";

export const BeforeMESFlowchart = () => {
  const painPoints = [
    { icon: Search, title: "Manual Research", description: "Months of Google searches", position: "top-left" },
    { icon: Phone, title: "Cold Outreach", description: "Spray & pray approach", position: "top-center" },
    { icon: DollarSign, title: "Expensive Consultants", description: "$000's for generic reports", position: "top-right" },
    { icon: AlertTriangle, title: "Legal Risks", description: "Untested lawyers", position: "middle-left" },
    { icon: Clock, title: "Regulatory Maze", description: "Complex compliance", position: "middle-center" },
    { icon: Target, title: "Random Networking", description: "Trial & error connections", position: "middle-right" },
    { icon: FileText, title: "Cultural Missteps", description: "Expensive mistakes", position: "bottom-left" },
    { icon: TrendingUp, title: "Guesswork Strategy", description: "No proven playbook", position: "bottom-center" },
    { icon: Users, title: "Wrong Partners", description: "Unvetted service providers", position: "flow-left" },
    { icon: MapPin, title: "Market Blind Spots", description: "Missing local insights", position: "flow-center" },
    { icon: Building, title: "Regulatory Delays", description: "Missed requirements", position: "flow-right" },
    { icon: Zap, title: "Wasted Resources", description: "Time, money, opportunities", position: "flow-bottom" }
  ];

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-red-400 mb-4 flex items-center justify-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          Before MES
        </h3>
        <p className="text-lg text-muted-foreground">The chaotic path to market entry</p>
      </div>

      {/* Flowchart Container */}
      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-3xl p-8 border border-blue-200/50 dark:border-blue-800/30 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,theme(colors.blue.500)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
        </div>

        {/* Pain Points Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {painPoints.slice(0, 9).map((point, index) => (
            <div 
              key={index}
              className="group relative bg-white/80 dark:bg-blue-900/40 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connecting Lines */}
              {index < 8 && (
                <div className="hidden md:block absolute -right-3 top-1/2 w-6 h-0.5 bg-gradient-to-r from-red-400 to-orange-400 opacity-60"></div>
              )}
              {index % 3 < 2 && index < 6 && (
                <div className="hidden md:block absolute left-1/2 -bottom-3 w-0.5 h-6 bg-gradient-to-b from-red-400 to-orange-400 opacity-60"></div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:scale-110 transition-transform">
                  <point.icon className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1 text-sm">{point.title}</h4>
                  <p className="text-xs text-muted-foreground">{point.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Flow Section */}
        <div className="relative mt-8 pt-6 border-t border-blue-200/50 dark:border-blue-700/50">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">The Result</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {painPoints.slice(9).map((point, index) => (
              <div 
                key={index + 9}
                className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200/50 dark:border-red-800/30 text-center animate-fade-in"
                style={{ animationDelay: `${(index + 9) * 100}ms` }}
              >
                <point.icon className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-1">{point.title}</h4>
                <p className="text-xs text-red-500/80">{point.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-float"></div>
        </div>
        <div className="absolute bottom-4 left-4 opacity-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-orange-400 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};