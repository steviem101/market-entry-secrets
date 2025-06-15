
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serviceCategories } from "@/data/mockData";

export const CategoriesSection = () => {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Popular Services</h2>
          <p className="text-muted-foreground">Explore the most sought-after market entry services</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {serviceCategories.slice(0, 8).map((category) => (
            <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Professional {category.name.toLowerCase()} services for market entry
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
