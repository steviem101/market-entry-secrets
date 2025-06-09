
import Navigation from "@/components/Navigation";

const Content = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Content Hub</h1>
          <p className="text-lg text-muted-foreground">
            Coming soon - Market entry resources and insights
          </p>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground">
            This section will feature case studies, guides, and expert insights to help you navigate the Australian market entry process.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Content;
