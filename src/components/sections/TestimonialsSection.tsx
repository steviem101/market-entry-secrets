
import { Star } from "lucide-react";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
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
      <section className="relative py-16 overflow-hidden">
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
    <section className="relative py-16 overflow-hidden">
      {/* Simplified background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/3" />
      <div className="absolute inset-0 gradient-overlay" />
      
      <div className="relative container mx-auto px-4">
        {/* Condensed section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/15 rounded-xl px-4 py-2 backdrop-blur-sm mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              4.9/5 from 247+ companies
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Companies That{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chose Success
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how businesses transformed their market entry with our proven resources
          </p>
        </div>
        
        {/* Streamlined Testimonials Carousel */}
        {displayTestimonials.length > 0 && (
          <div>
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
      </div>
    </section>
  );
};
