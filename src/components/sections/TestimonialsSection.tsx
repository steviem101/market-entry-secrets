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
import { useSectionPersona } from "@/hooks/useSectionPersona";
import { PERSONA_CONTENT } from "@/config/personaContent";

export const TestimonialsSection = () => {
  const { data: testimonials = [], isLoading, error } = useTestimonials();
  const persona = useSectionPersona();
  const content = PERSONA_CONTENT[persona].testimonials;

  // Use DB testimonials when available, otherwise persona-specific fallbacks
  const displayTestimonials =
    testimonials.length > 0 ? testimonials : content.fallbackTestimonials;

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
    console.error("Error loading testimonials:", error);
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
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {content.socialProof}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 transition-all duration-300">
            {content.heading}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {content.headingAccent}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-300">
            {content.subtitle}
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
                  <CarouselItem
                    key={testimonial.id}
                    className="pl-2 md:pl-4 md:basis-1/3"
                  >
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
