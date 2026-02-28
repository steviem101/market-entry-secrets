import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useSectionPersona } from "@/hooks/useSectionPersona";
import { PERSONA_CONTENT } from "@/config/personaContent";

export const ValueSection = () => {
  const persona = useSectionPersona();
  const content = PERSONA_CONTENT[persona].value;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 transition-all duration-300">
              {content.sectionTitle}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed transition-all duration-300">
              {content.sectionSubtitle}
            </p>
          </div>

          {/* Value Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.items.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="group block transition-transform duration-300 hover:scale-105"
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-background/80 backdrop-blur-sm cursor-pointer">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 group-hover:scale-110 transition-transform duration-300">
                        <item.icon className={`w-8 h-8 ${item.color}`} />
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {item.badge}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
