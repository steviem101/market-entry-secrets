
import { Button } from "@/components/ui/button";

const EventsHero = () => {
  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-primary via-blue-500 to-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Your Gateway to the</h1>
            <h2 className="text-5xl font-bold mb-6 text-primary-foreground">Australian Market</h2>
            <p className="text-xl mb-8 opacity-90">
              Connect with vetted service providers, learn from success stories, and accelerate your market entry with expert guidance.
            </p>
            <div className="flex justify-center">
              <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg">
                Submit Event
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsHero;
