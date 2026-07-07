import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { useTestimonials } from "@/hooks/useTestimonials";
import { PERSONA_CONTENT } from "@/config/personaContent";

export const TestimonialsSection = () => {
  const { data: testimonials = [], isLoading } = useTestimonials();
  const content = PERSONA_CONTENT.default.testimonials;

  // Use DB testimonials when available, otherwise fallbacks. Show at most
  // three — a static grid, not a carousel, keeps the section scannable.
  const displayTestimonials = (
    testimonials.length > 0 ? testimonials : content.fallbackTestimonials
  ).slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (displayTestimonials.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {content.heading}
            <span className="text-primary">{content.headingAccent}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </div>

        {/* Static three-up grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {displayTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              name={testimonial.name}
              title={testimonial.title}
              company={testimonial.company}
              countryFlag={testimonial.country_flag}
              countryName={testimonial.country_name}
              testimonial={testimonial.testimonial}
              outcome={testimonial.outcome}
              avatar={testimonial.avatar}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
