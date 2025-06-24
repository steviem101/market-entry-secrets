
import { Star } from "lucide-react";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Sarah Chen",
    title: "CEO",
    company: "TechFlow Solutions",
    countryFlag: "🇸🇬",
    countryName: "Singapore",
    testimonial: "The market entry secrets revealed exactly which regulatory hurdles we'd face and connected us with the right legal partners. What would have taken us 18 months took just 6 months.",
    outcome: "Reduced market entry time by 12 months, saved $200K in consulting fees",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Marcus Weber",
    title: "Founder",
    company: "GreenTech Industries",
    countryFlag: "🇩🇪",
    countryName: "Germany",
    testimonial: "The insider knowledge about Australian energy regulations and the vetted supplier network was game-changing. We avoided costly mistakes and found our key partners within weeks.",
    outcome: "Secured 3 major partnerships, achieved 40% faster revenue growth",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Priya Sharma",
    title: "International Director",
    company: "DataBridge Analytics",
    countryFlag: "🇮🇳",
    countryName: "India",
    testimonial: "The hidden strategies for navigating Australian procurement processes were invaluable. We won our first government contract within 4 months of entering the market.",
    outcome: "Won $2.3M government contract, established market presence 60% faster",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "James Mitchell",
    title: "VP of Expansion",
    company: "FinanceFlow",
    countryFlag: "🇺🇸",
    countryName: "United States",
    testimonial: "The exclusive access to Australian banking relationships and compliance shortcuts saved us months of research. The ROI on this knowledge was immediate.",
    outcome: "Launched operations 8 months ahead of schedule, 25% under budget",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Emma Thompson",
    title: "Co-founder",
    company: "EcoPackaging Solutions",
    countryFlag: "🇬🇧",
    countryName: "United Kingdom",
    testimonial: "The sustainability sector insights and pre-vetted manufacturing contacts were exactly what we needed. We went from zero to profitable in our first year in Australia.",
    outcome: "Achieved profitability in year 1, built distribution network 3x faster",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Hiroshi Tanaka",
    title: "Managing Director",
    company: "Precision Robotics",
    countryFlag: "🇯🇵",
    countryName: "Japan",
    testimonial: "The manufacturing sector secrets and supplier verification process helped us avoid unreliable partners. Our Australian operations now generate 30% of our global revenue.",
    outcome: "30% of global revenue from Australia, zero supplier failures"
  }
];

export const TestimonialsSection = () => {
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
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              {...testimonial}
            />
          ))}
        </div>

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
