
import { 
  Search, 
  DollarSign, 
  Clock,
  AlertTriangle,
  TrendingDown
} from "lucide-react";
import { PainPoint } from "./types";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export const BeforeSection = () => {
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.2 });

  const painPoints: PainPoint[] = [
    {
      icon: Search,
      title: "Endless Research",
      description: "6-12 months of manual research across fragmented sources",
      metric: "500+ hours wasted",
      color: "text-red-500"
    },
    {
      icon: DollarSign,
      title: "Expensive Consultants",
      description: "Pay $50K+ for basic market analysis from big consulting firms",
      metric: "$50K+ per report",
      color: "text-orange-500"
    },
    {
      icon: AlertTriangle,
      title: "Compliance Risks",
      description: "Navigate complex regulations without local expertise",
      metric: "60% failure rate",
      color: "text-red-600"
    },
    {
      icon: Clock,
      title: "Slow Market Entry",
      description: "18-24 month timeline from decision to market presence",
      metric: "2+ years delayed",
      color: "text-orange-600"
    },
    {
      icon: TrendingDown,
      title: "Low Success Rate",
      description: "70% of international expansions fail within first 2 years",
      metric: "70% fail",
      color: "text-red-700"
    }
  ];

  return (
    <div ref={elementRef} className="space-y-8">
      <div className="text-center lg:text-left">
        <div className="inline-flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-6 py-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-2xl font-bold text-red-600">The Traditional Way</h3>
            <p className="text-red-500/80 text-sm">Complex, expensive, risky</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {painPoints.map((point, index) => (
          <div 
            key={index} 
            className={`
              bg-gradient-to-r from-red-50/80 to-orange-50/60 
              border border-red-200/40 rounded-2xl p-6 
              hover:border-red-300/60 transition-all duration-500
              ${isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'}
            `}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <point.icon className={`w-6 h-6 ${point.color}`} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{point.title}</h4>
                  {point.metric && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      {point.metric}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed">{point.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Impact Statement */}
      <div className="text-center mt-8 p-6 bg-gradient-to-r from-red-100/50 to-orange-100/50 rounded-2xl border border-red-200/30">
        <p className="text-lg font-medium text-red-800 mb-2">Result: Market Entry Failure</p>
        <p className="text-red-600/80">Most companies give up or fail within the first 18 months</p>
      </div>
    </div>
  );
};
