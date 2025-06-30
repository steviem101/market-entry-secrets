import { 
  Search, 
  Phone, 
  DollarSign, 
  AlertTriangle,
  Clock,
  Target,
  FileText,
  TrendingUp
} from "lucide-react";

export const BeforeSection = () => {
  const beforeItems = [
    {
      icon: Search,
      title: "Manual Research",
      description: "Months of Google searches and outdated reports",
      color: "text-red-400"
    },
    {
      icon: Phone,
      title: "Cold Outreach",
      description: "Spray and pray to unvetted service providers, advisors and partners",
      color: "text-orange-400"
    },
    {
      icon: DollarSign,
      title: "Expensive Consulting",
      description: "$50K+ for basic market analysis and TAM reports",
      color: "text-red-400"
    },
    {
      icon: AlertTriangle,
      title: "Legal Risks",
      description: "Hiring untested lawyers, compliance mistakes",
      color: "text-orange-400"
    },
    {
      icon: Clock,
      title: "Regulatory Maze",
      description: "Complex compliance, missed requirements, delays",
      color: "text-red-400"
    },
    {
      icon: Target,
      title: "Random Networking",
      description: "Trial and error finding the right connections",
      color: "text-orange-400"
    },
    {
      icon: FileText,
      title: "Cultural Missteps",
      description: "Expensive mistakes from lack of local knowledge",
      color: "text-red-400"
    },
    {
      icon: TrendingUp,
      title: "Guesswork Strategy",
      description: "No proven playbook, making it up as you go",
      color: "text-orange-400"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left mb-8">
        <h3 className="text-2xl font-bold text-red-400 mb-2 flex items-center justify-center lg:justify-start gap-2">
          <AlertTriangle className="w-6 h-6" />
          Before Market Entry Secrets
        </h3>
        <p className="text-muted-foreground">The painful traditional approach</p>
      </div>

      <div className="grid gap-4">
        {beforeItems.map((item, index) => (
          <div key={index} className="bg-background/60 backdrop-blur-sm border border-red-200/20 rounded-xl p-4 hover:border-red-300/30 transition-all duration-300">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
