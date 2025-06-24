
import { Star } from "lucide-react";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTestimonials } from "@/hooks/useTestimonials";

export const TestimonialsSection = () => {
  const { data: testimonials = [], isLoading, error } = useTestimonials();

  if (isLoading) {
    return (
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 gradient-overlay" />
        
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error loading testimonials:', error);
    return null;
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute inset-0 gradient-overlay" />
      
      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Success Stories from Market Entry
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block mt-2">
              Secret Users
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Real companies, real results. See how our exclusive market entry intelligence helped these businesses thrive in Australia.
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/8 to-accent/8 border border-primary/15 rounded-xl px-6 py-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              4.9/5 from 247+ successful market entries
            </span>
          </div>
        </div>
        
        {/* Testimonials Carousel */}
        {testimonials.length > 0 && (
          <div className="mb-16">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {testimonials.map((testimonial) => (
                  <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/3">
                    <TestimonialCard
                      name={testimonial.name}
                      title={testimonial.title}
                      company={testimonial.company}
                      countryFlag={testimonial.country_flag}
                      countryName={testimonial.country_name}
                      testimonial={testimonial.testimonial}
                      outcome={testimonial.outcome}
                      avatar={testimonial.avatar}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Join These Success Stories?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get access to the same market entry secrets that helped these companies succeed in Australia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              Unlock Market Entry Secrets
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-background/60 backdrop-blur-sm border-primary/30 text-foreground hover:bg-background/80 hover:border-primary/50 px-8 py-4 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              View All Success Stories
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
