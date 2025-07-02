import { ArrowRight, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const BeforeMESSection = () => {
  const problems = [
    "Manual Research",
    "Cold Outreach",
    "Expensive Consultants", 
    "Legal Risks",
    "Regulatory Maze",
    "Random Networking",
    "Cultural Missteps",
    "Guesswork Strategy",
    "Months of Delays",
    "Costly Mistakes",
    "Generic Advice",
    "Wasted Resources",
    "Trial & Error",
    "Missed Opportunities",
    "Wrong Partners",
    "Failed Market Entry"
  ];

  const Arrow = ({ direction = "right", className = "" }: { direction?: "right" | "down", className?: string }) => {
    const Icon = direction === "right" ? ArrowRight : ArrowDown;
    return (
      <div className={`flex items-center justify-center text-white/60 ${className}`}>
        <Icon className="w-6 h-6" />
      </div>
    );
  };

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-600/10 to-cyan-500/20" />
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-xl" />
      
      <div className="relative container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Before MES
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              The painful, expensive, and risky traditional approach to Australian market entry
            </p>
          </div>

          {/* Problems Flow - Desktop Grid */}
          <div className="hidden lg:block mb-16">
            <div className="grid grid-cols-5 gap-4 items-center">
              {/* Row 1 */}
              {problems.slice(0, 4).map((problem, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center hover:bg-white/15 transition-all duration-300">
                    <span className="text-white text-sm font-medium">{problem}</span>
                  </div>
                  {index < 3 && <Arrow />}
                </div>
              ))}
              <div></div>
              
              {/* Vertical arrow after row 1 */}
              <div className="col-start-5 flex justify-center">
                <Arrow direction="down" />
              </div>
              
              {/* Row 2 - Reverse direction */}
              {problems.slice(4, 8).reverse().map((problem, index) => (
                <div key={index + 4} className="flex items-center gap-4 flex-row-reverse">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center hover:bg-white/15 transition-all duration-300">
                    <span className="text-white text-sm font-medium">{problem}</span>
                  </div>
                  {index < 3 && (
                    <div className="flex items-center justify-center text-white/60 rotate-180">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Vertical arrow after row 2 */}
              <div className="col-start-1 flex justify-center">
                <Arrow direction="down" />
              </div>
              
              {/* Row 3 */}
              {problems.slice(8, 12).map((problem, index) => (
                <div key={index + 8} className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center hover:bg-white/15 transition-all duration-300">
                    <span className="text-white text-sm font-medium">{problem}</span>
                  </div>
                  {index < 3 && <Arrow />}
                </div>
              ))}
              <div></div>
              
              {/* Vertical arrow after row 3 */}
              <div className="col-start-5 flex justify-center">
                <Arrow direction="down" />
              </div>
              
              {/* Row 4 - Reverse direction */}
              {problems.slice(12, 16).reverse().map((problem, index) => (
                <div key={index + 12} className="flex items-center gap-4 flex-row-reverse">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center hover:bg-white/15 transition-all duration-300">
                    <span className="text-white text-sm font-medium">{problem}</span>
                  </div>
                  {index < 3 && (
                    <div className="flex items-center justify-center text-white/60 rotate-180">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Problems Flow - Mobile/Tablet */}
          <div className="lg:hidden mb-16">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {problems.map((problem, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center hover:bg-white/15 transition-all duration-300 w-full">
                    <span className="text-white text-sm font-medium">{problem}</span>
                  </div>
                  {index < problems.length - 1 && (
                    <Arrow direction="down" className="md:hidden" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Solution Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="h-px bg-white/30 w-16"></div>
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-8 py-4">
                <h3 className="text-2xl font-bold text-white mb-2">With MES</h3>
                <p className="text-white/80 text-lg">We take care of that</p>
              </div>
              <div className="h-px bg-white/30 w-16"></div>
            </div>
            
            <Arrow direction="down" className="mb-8" />
            
            <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-4">
                Seamless Australian Market Entry
              </h3>
              <p className="text-white/80 text-lg mb-6">
                Access 500+ vetted service providers, 200+ expert mentors, and proven strategies in one comprehensive platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild
                  className="bg-white text-blue-600 hover:bg-white/90 px-8 py-4 text-lg rounded-xl font-semibold"
                >
                  <Link to="/service-providers">
                    Start Your Market Entry
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl"
                >
                  <Link to="/content">
                    View Success Stories
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};