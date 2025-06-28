
import { Star, Quote } from "lucide-react";
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

  // Fallback testimonials if database is empty
  const fallbackTestimonials = [
    {
      id: 'fallback-1',
      name: 'Sarah Chen',
      title: 'CEO',
      company: 'TechStart Solutions',
      country_flag: '🇺🇸',
      country_name: 'United States',
      testimonial: 'Market Entry Secrets cut our Australian market research time from 6 months to 2 weeks. The vetted service providers were exactly what we needed.',
      outcome: 'Launched in Sydney 89% faster than projected',
      avatar: undefined,
      is_featured: true,
      sort_order: 1
    },
    {
      id: 'fallback-2',
      name: 'Marcus Weber',
      title: 'Founder',
      company: 'Alpine Innovations',
      country_flag: '🇩🇪',
      country_name: 'Germany',
      testimonial: 'The mentor network was invaluable. Speaking with someone who had already navigated German to Australian expansion saved us countless mistakes.',
      outcome: 'Avoided $50K+ in compliance mistakes',
      avatar: undefined,
      is_featured: true,
      sort_order: 2
    },
    {
      id: 'fallback-3',
      name: 'Priya Patel',
      title: 'Head of Expansion',
      company: 'Mumbai Digital',
      country_flag: '🇮🇳',
      country_name: 'India',
      testimonial: 'The lead databases were incredibly targeted. We closed our first Australian client within 30 days of launch using their premium lists.',
      outcome: 'First client signed in 30 days',
      avatar: undefined,
      is_featured: true,
      sort_order: 3
    }
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  if (isLoading) {
    return (
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
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
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Enhanced background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-primary/3 to-background" />
      <div className="absolute inset-0 gradient-overlay" />
      
      {/* Decorative quote marks */}
      <div className="absolute top-20 left-10 opacity-10">
        <Quote className="w-32 h-32 text-primary" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 rotate-180">
        <Quote className="w-24 h-24 text-accent" />
      </div>
      
      <div className="relative container mx-auto px-4">
        {/* Enhanced section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/15 rounded-xl px-6 py-3 backdrop-blur-sm mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              4.9/5 from 247+ successful market entries
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join Companies That{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chose Success
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how businesses like yours transformed their market entry experience with our proven resources and expert guidance
          </p>
        </div>
        
        {/* Enhanced Testimonials Carousel */}
        {displayTestimonials.length > 0 && (
          <div className="mb-16">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {displayTestimonials.map((testimonial) => (
                  <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/3">
                    <div className="h-full">
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
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-background/80 backdrop-blur-sm border-primary/20" />
              <CarouselNext className="right-2 bg-background/80 backdrop-blur-sm border-primary/20" />
            </Carousel>
          </div>
        )}

        {/* Enhanced CTA */}
        <div className="text-center bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-2xl p-12 backdrop-blur-sm">
          <h3 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
            Join 1,200+ companies that chose the proven path to Australian market success with our comprehensive resources and expert network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-xl soft-shadow hover:shadow-lg transition-all duration-300"
            >
              Start Your Success Story
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
