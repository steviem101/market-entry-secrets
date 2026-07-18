
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialCardProps {
  name: string;
  title: string;
  company: string;
  countryFlag: string;
  countryName: string;
  testimonial: string;
  outcome: string;
  avatar?: string;
}

export const TestimonialCard = ({
  name,
  title,
  company,
  countryFlag,
  countryName,
  testimonial,
  outcome,
  avatar
}: TestimonialCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-500 border-border/40 bg-card/60 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 hover:-translate-y-2">
      <CardContent className="p-6">
        {/* No star row: the testimonials table has no rating column, so a
            hardcoded 5-star render was an unverifiable claim (same class as
            the removed "4.9/5" hero badge — MES-162 rule: ratings only if
            real ratings exist). */}

        {/* Testimonial quote */}
        <blockquote className="text-muted-foreground mb-6 leading-relaxed">
          "{testimonial}"
        </blockquote>

        {/* Outcome highlight */}
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 mb-6">
          <p className="text-sm font-medium text-primary">
            📈 {outcome}
          </p>
        </div>

        {/* Client details */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">{name}</h4>
              <span className="text-2xl" title={`From ${countryName}`}>
                {countryFlag}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {title} at {company}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
