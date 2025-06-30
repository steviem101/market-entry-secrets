import { useState, useEffect, useRef } from "react";
import { RotatingText } from "@/components/RotatingText";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { SocialProofAvatars } from "@/components/SocialProofAvatars";
import { Star } from "lucide-react";
interface HeroSectionProps {
  totalResources: number;
}
export const HeroSection = ({
  totalResources
}: HeroSectionProps) => {
  const [count, setCount] = useState(0);
  const animationRef = useRef<ReturnType<typeof setTimeout>>();

  // Count Up Animation Effect - starts immediately on mount
  useEffect(() => {
    if (totalResources === 0) {
      console.log('No resources to count');
      return;
    }
    console.log('Starting count animation to:', totalResources);
    let currentCount = 0;
    const duration = 2500;
    const steps = 60;
    const increment = totalResources / steps;
    const stepDuration = duration / steps;
    const animate = () => {
      currentCount += increment;
      if (currentCount >= totalResources) {
        console.log('Animation completed at:', totalResources);
        setCount(totalResources);
        return;
      }
      setCount(Math.floor(currentCount));
      animationRef.current = setTimeout(animate, stepDuration);
    };
    animationRef.current = setTimeout(animate, stepDuration);
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [totalResources]);
  const rotatingWords = ["Leads", "Mentors", "Vendors", "Events", "Communities", "Content", "Case Studies", "Ecosystem's", "Supports", "Accelerators", "Investors", "Partners"];
  const handleEmailSubmit = async (email: string) => {
    // Handle email submission - can integrate with existing lead generation system
    console.log('Processing email submission:', email);

    // Add any additional logic here like:
    // - API calls to save the email
    // - Analytics tracking
    // - Integration with email marketing services
  };
  return <section className="relative overflow-hidden min-h-screen flex items-center">
      {/* Enhanced Background with light blue tinge */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/60 via-sky-25/40 to-background" />
      <div className="absolute inset-0 gradient-overlay" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/5 rounded-full blur-xl animate-pulse delay-1000" />
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Enhanced Social Proof with Avatars */}
          <div className="mb-8">
            <SocialProofAvatars className="mb-4" />
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <span className="text-sm font-medium text-muted-foreground">Trusted by 1,200+ companies entering Australia</span>
              </div>
            </div>
          </div>

          {/* Dynamic Headline with Rotating Text */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            <span className="text-foreground">Unlock the </span>
            <RotatingText words={rotatingWords} className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" duration={2000} />
            <span className="text-foreground"> to</span>
            <br />
            <span className="text-foreground">Australian Market Success</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-4xl mx-auto">
            Skip months of research and costly mistakes. Access vetted service providers, expert mentors, and proven strategies in one comprehensive platform.
          </p>

          {/* Supporting Text for Email Capture */}
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Uncover our database of <span className="font-semibold text-primary">{count.toLocaleString()}+ resources</span> and community of successful founders entering the Australian market
          </p>
          
          {/* Email Capture Form - Primary CTA */}
          <EmailCaptureForm onSubmit={handleEmailSubmit} className="mb-8 max-w-lg mx-auto" />

          {/* Trust indicators */}
          <p className="text-sm text-muted-foreground">Free access • Vendor Discounts • Join 1,200+ companies</p>
        </div>
      </div>
    </section>;
};