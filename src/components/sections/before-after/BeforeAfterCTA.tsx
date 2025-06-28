
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

export const BeforeAfterCTA = () => {
  return (
    <div className="text-center mt-16 relative">
      {/* Success Metrics Bar */}
      <div className="flex flex-wrap justify-center gap-8 mb-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/20">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">94%</div>
          <div className="text-sm text-muted-foreground">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">6 Months</div>
          <div className="text-sm text-muted-foreground">Avg. Market Entry</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">1,200+</div>
          <div className="text-sm text-muted-foreground">Success Stories</div>
        </div>
      </div>

      <h3 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
        Ready to Transform Your 
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block mt-1">
          Market Entry Journey?
        </span>
      </h3>
      
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
        Join the companies who chose the smart path to Australian market success. 
        Get access to our complete ecosystem of vetted experts and proven strategies.
      </p>

      {/* Star Rating */}
      <div className="flex justify-center items-center gap-2 mb-8">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <span className="text-sm text-muted-foreground ml-2">4.9/5 from 200+ reviews</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg" 
          asChild
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all group"
        >
          <Link to="/service-providers" className="flex items-center gap-2">
            Start Your Transformation
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          asChild
          className="border-primary/30 text-foreground hover:bg-primary/10 px-8 py-4 text-lg rounded-xl group"
        >
          <Link to="/case-studies" className="flex items-center gap-2">
            View Success Stories
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
