
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h1>
          
          <div className="space-y-8">
            {/* General Questions */}
            <Card>
              <CardHeader>
                <CardTitle>General Questions</CardTitle>
                <CardDescription>Common questions about Market Entry Secrets</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is">
                    <AccordionTrigger>What is Market Entry Secrets?</AccordionTrigger>
                    <AccordionContent>
                      Market Entry Secrets is Australia's comprehensive platform for businesses looking to enter the Australian market. We connect international companies with local service providers, mentors, and resources to ensure successful market entry.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="who-for">
                    <AccordionTrigger>Who is this platform for?</AccordionTrigger>
                    <AccordionContent>
                      Our platform serves international businesses planning to enter Australia, local service providers specializing in market entry, mentors with Australian business expertise, and anyone involved in the market entry ecosystem.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="cost">
                    <AccordionTrigger>Is the platform free to use?</AccordionTrigger>
                    <AccordionContent>
                      Browsing our directory and accessing basic resources is completely free. Service providers pay a listing fee to be featured in our directory, and some premium content may require a subscription.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* For Businesses */}
            <Card>
              <CardHeader>
                <CardTitle>For Businesses Entering Australia</CardTitle>
                <CardDescription>Questions about using our services</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="getting-started">
                    <AccordionTrigger>How do I get started with my Australian market entry?</AccordionTrigger>
                    <AccordionContent>
                      Start by browsing our service providers directory to find specialists in your industry. You can also use our AI assistant to get personalized recommendations, attend our events, or connect with mentors who have experience in your sector.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="choosing-providers">
                    <AccordionTrigger>How do I choose the right service providers?</AccordionTrigger>
                    <AccordionContent>
                      Review provider profiles, check their expertise areas, read client testimonials, and consider their location. You can contact multiple providers to compare services and pricing. Our AI assistant can also help match you with suitable providers based on your specific needs.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="timeline">
                    <AccordionTrigger>How long does it typically take to enter the Australian market?</AccordionTrigger>
                    <AccordionContent>
                      Timeline varies by business type and complexity. Simple service businesses might take 3-6 months, while complex manufacturing or regulated industries can take 12-18 months. Our content library includes detailed timelines for different business types.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* For Service Providers */}
            <Card>
              <CardHeader>
                <CardTitle>For Service Providers</CardTitle>
                <CardDescription>Questions about listing your services</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="listing-process">
                    <AccordionTrigger>How do I list my services on the platform?</AccordionTrigger>
                    <AccordionContent>
                      Visit our "Partner with Us" page and fill out the service provider application. We review all applications to ensure quality and relevance. Once approved, your listing will be live and visible to potential clients.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="listing-cost">
                    <AccordionTrigger>What does it cost to list my services?</AccordionTrigger>
                    <AccordionContent>
                      We offer different listing packages starting from $99/month for basic listings up to $299/month for premium featured listings with enhanced visibility and lead generation tools.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="leads">
                    <AccordionTrigger>How will I receive leads?</AccordionTrigger>
                    <AccordionContent>
                      Leads are delivered through our platform messaging system and email notifications. Premium members also get access to our leads dashboard with advanced filtering and tracking capabilities.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Technical Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Technical & Support</CardTitle>
                <CardDescription>Technical help and support</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="ai-assistant">
                    <AccordionTrigger>How does the AI assistant work?</AccordionTrigger>
                    <AccordionContent>
                      Our AI assistant is trained on Australian market entry best practices and can provide personalized recommendations for service providers, answer regulatory questions, and guide you through the market entry process step by step.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="support">
                    <AccordionTrigger>How can I get support?</AccordionTrigger>
                    <AccordionContent>
                      You can contact our support team through the contact page, use the AI assistant for immediate help, or email us directly at hello@marketentrysecrets.com.au. We typically respond within 24 hours.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="mobile">
                    <AccordionTrigger>Is there a mobile app?</AccordionTrigger>
                    <AccordionContent>
                      Currently, our platform is web-based and fully responsive on mobile devices. A dedicated mobile app is planned for 2024. You can bookmark our site on your mobile device for quick access.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Still have questions */}
          <Card className="mt-8">
            <CardHeader className="text-center">
              <CardTitle>Still Have Questions?</CardTitle>
              <CardDescription>We're here to help with any other questions you might have</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-x-4">
                <Button asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/partner-with-us">Partner With Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FAQ;
