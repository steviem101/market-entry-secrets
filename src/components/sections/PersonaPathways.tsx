import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Rocket, ArrowRight } from "lucide-react";

const pathways = [
  {
    icon: Globe,
    title: "Entering Australia from overseas",
    body: "Get a step-by-step plan for landing in the ANZ market: entity setup, regulatory guidance, local partners, and go-to-market strategy.",
    cta: "Plan my market entry",
    href: "/planner?persona=international_entrant",
    color: "from-blue-500/10 to-primary/10",
    borderColor: "hover:border-blue-500/30",
  },
  {
    icon: Rocket,
    title: "Building a startup in Australia",
    body: "Get a growth plan tailored to your stage: funding sources, accelerators, hiring, customer acquisition, and the right mentors.",
    cta: "Plan my growth strategy",
    href: "/planner?persona=local_startup",
    color: "from-emerald-500/10 to-accent/10",
    borderColor: "hover:border-emerald-500/30",
  },
];

export const PersonaPathways = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {pathways.map((pathway) => {
              const Icon = pathway.icon;
              return (
                <Link key={pathway.title} to={pathway.href} className="group block">
                  <Card
                    className={`h-full border-2 border-border/50 ${pathway.borderColor} transition-all duration-300 hover:shadow-lg`}
                  >
                    <CardContent className="p-8">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pathway.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-7 h-7 text-primary" />
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {pathway.title}
                      </h3>

                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {pathway.body}
                      </p>

                      <Button
                        variant="outline"
                        className="gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
                      >
                        {pathway.cta}
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
