
import { Link } from "react-router-dom";
import { 
  Building2,
  Users, 
  Database, 
  Calendar, 
  CheckCircle,
  Zap,
  ArrowRight
} from "lucide-react";
import { Solution } from "./types";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export const AfterSection = () => {
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.2 });

  const solutions: Solution[] = [
    {
      icon: Building2,
      title: "Vetted Service Network",
      description: "500+ pre-screened legal, accounting, and marketing partners ready to work",
      metric: "< 48 hrs to connect",
      testimonial: "Found our perfect legal partner in 2 days",
      link: "/service-providers"
    },
    {
      icon: Database,
      title: "Market Intelligence Hub",
      description: "Real-time TAM analysis, lead databases, and market sizing tools",
      metric: "90% faster research",
      testimonial: "Cut our market research from 6 months to 2 weeks",
      link: "/leads"
    },
    {
      icon: Users,
      title: "Expert Mentor Network",
      description: "200+ successful market entry advisors who've done it before",
      metric: "1-on-1 guidance",
      testimonial: "Our mentor saved us from 3 major compliance mistakes",
      link: "/mentors"
    },
    {
      icon: CheckCircle,
      title: "Proven Success Framework",
      description: "1,200+ documented success stories with step-by-step playbooks",
      metric: "94% success rate",
      testimonial: "Generated $2M ARR in first 12 months",
      link: "/case-studies"
    },
    {
      icon: Calendar,
      title: "Active Community",
      description: "50+ monthly events and direct access to market entry specialists",
      metric: "Weekly support",
      testimonial: "The community connections became our biggest customers",
      link: "/events"
    }
  ];

  return (
    <div ref={elementRef} className="space-y-8 relative">
      {/* Transformation Badge */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-gradient-to-r from-primary via-accent to-primary text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl animate-pulse">
          ✨ TRANSFORMATION
        </div>
      </div>

      <div className="text-center lg:text-left pt-4">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-xl px-6 py-3 mb-6">
          <Zap className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              The Market Entry Secrets Way
            </h3>
            <p className="text-primary/70 text-sm">Fast, proven, supported</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {solutions.map((solution, index) => (
          <Link 
            key={index} 
            to={solution.link}
            className={`
              group block bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 
              border border-primary/20 rounded-2xl p-6 
              hover:from-primary/10 hover:via-accent/10 hover:to-primary/10 
              hover:border-primary/40 hover:shadow-xl
              transition-all duration-500 hover:-translate-y-1
              ${isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'}
            `}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <solution.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {solution.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {solution.metric}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-3 group-hover:text-gray-700 transition-colors">
                  {solution.description}
                </p>
                {solution.testimonial && (
                  <p className="text-sm italic text-primary/80 border-l-2 border-primary/30 pl-3">
                    "{solution.testimonial}"
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Success Statement */}
      <div className="text-center mt-8 p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl border border-primary/30">
        <p className="text-lg font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Result: Accelerated Market Success
        </p>
        <p className="text-primary/70">Join 1,200+ companies achieving 6-12 month market entry</p>
      </div>
    </div>
  );
};
