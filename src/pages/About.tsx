
import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">About Market Entry Secrets</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              Market Entry Secrets is Australia's premier directory for market entry service providers, 
              connecting businesses with expert consultants across the country.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To simplify the process of finding and connecting with market entry specialists 
                  who can help businesses successfully expand into new markets across Australia.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
                <p className="text-muted-foreground">
                  We carefully curate our directory to include only verified, experienced professionals 
                  with proven track records in market entry and business expansion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
