
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const BeforeAfterCTA = () => {
  return (
    <div className="text-center mt-16">
      <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Market Entry?</h3>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
        Join 1,200+ companies that chose the smart path to Australian market success with our proven resources and expert network.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg" 
          asChild
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg rounded-xl"
        >
          <Link to="/service-providers">
            Start Your Market Entry
          </Link>
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          asChild
          className="border-primary/30 text-foreground hover:bg-primary/10 px-8 py-4 text-lg rounded-xl"
        >
          <Link to="/case-studies">
            View Success Stories
          </Link>
        </Button>
      </div>
    </div>
  );
};
