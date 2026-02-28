import { Users, TrendingUp } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface MentorsHeroProps {
  totalExperts: number;
  totalLocations: number;
}

export const MentorsHero = ({ totalExperts, totalLocations }: MentorsHeroProps) => {
  return (
    <section className="bg-gradient-to-br from-[hsl(var(--primary)/0.05)] via-[hsl(var(--primary)/0.02)] to-background py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Users className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Connect with Market Entry{" "}
            <span className="text-primary">Experts</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get personalized guidance from experienced professionals who have
            successfully navigated international markets. Connect with mentors,
            advisors, and industry experts ready to help you succeed in Australia
            and New Zealand.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <SubmissionButton submissionType="mentor" variant="hero" size="lg" />
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="bg-card backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-primary mb-1">{totalExperts}</div>
              <div className="text-sm text-muted-foreground">Expert Mentors</div>
            </div>
            <div className="bg-card backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-primary mb-1">{totalLocations}</div>
              <div className="text-sm text-muted-foreground">Global Locations</div>
            </div>
            <div className="bg-card backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
              <div className="text-3xl font-bold text-primary mb-1">
                <TrendingUp className="w-8 h-8 inline-block" />
              </div>
              <div className="text-sm text-muted-foreground">Growing Network</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
