
import { BookOpen, FileText, Users } from "lucide-react";
import { SubmissionButton } from "@/components/directory-submissions/SubmissionButton";

interface ContentHeroProps {
  totalContent: number;
  totalCategories: number;
}

export const ContentHero = ({ 
  totalContent, 
  totalCategories 
}: ContentHeroProps) => {
  return (
    <section className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-teal-500/20 rounded-full">
            <BookOpen className="w-12 h-12 text-teal-600" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Market Entry <span className="text-teal-600">Success Stories</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Learn from real businesses that successfully entered the Australian market. 
          Get actionable insights, proven strategies, and expert guidance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <SubmissionButton submissionType="content" variant="hero" size="lg" />
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
            <div className="text-3xl font-bold text-teal-600 mb-1">{totalContent}</div>
            <div className="text-sm text-gray-600">Success Stories</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-4 shadow-sm border">
            <div className="text-3xl font-bold text-cyan-600 mb-1">{totalCategories}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
        </div>
      </div>
    </section>
  );
};
