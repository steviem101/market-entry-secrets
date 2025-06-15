
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serviceCategories } from "@/data/mockData";

export const CategoriesSection = () => {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Popular Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the most sought-after market entry services from our trusted network
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceCategories.slice(0, 8).map((category, index) => (
            <Card 
              key={category.id} 
              className="group hover:shadow-xl transition-all duration-500 cursor-pointer border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center pb-3">
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Professional {category.name.toLowerCase()} services for seamless market entry
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
