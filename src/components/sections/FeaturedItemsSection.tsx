
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedItemCard } from "@/components/featured-items/FeaturedItemCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useFeaturedItems, FeaturedItem } from "@/hooks/useFeaturedItems";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const FeaturedItemsSection = () => {
  const { data: featuredItems = [], isLoading, error } = useFeaturedItems();

  const handleViewDetails = (item: FeaturedItem) => {
    // Navigate to appropriate page based on item type
    switch (item.type) {
      case 'service_provider':
        window.location.href = '/service-providers';
        break;
      case 'event':
        window.location.href = '/events';
        break;
      case 'innovation_hub':
        window.location.href = '/innovation-ecosystem';
        break;
      case 'trade_agency':
        window.location.href = '/trade-investment-agencies';
        break;
      default:
        toast.info(`View details for ${item.name}`);
    }
  };

  if (isLoading) {
    return (
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error loading featured items:', error);
  }

  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Directory</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover handpicked service providers, events, innovation hubs, and trade agencies to accelerate your market entry
          </p>
        </div>

        {/* Featured Items Carousel */}
        {featuredItems.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredItems.map((item) => (
                  <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/3">
                    <div className="h-full">
                      <FeaturedItemCard
                        item={item}
                        onViewDetails={handleViewDetails}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm border-primary/20" />
              <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm border-primary/20" />
            </Carousel>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8 py-3 text-lg"
            onClick={() => window.location.href = '/service-providers'}
          >
            Explore All Directories
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
