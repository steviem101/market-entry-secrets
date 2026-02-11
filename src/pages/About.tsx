
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, TrendingUp, Shield, Target, Lightbulb } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Trusted Expertise",
      description: "We carefully curate and verify every service provider to ensure you get access to proven market entry specialists."
    },
    {
      icon: Target,
      title: "Targeted Solutions",
      description: "Our platform connects you with specialists who understand your specific industry and market entry challenges."
    },
    {
      icon: Lightbulb,
      title: "Insider Knowledge",
      description: "Access the hidden strategies and insider tips that successful companies use to enter the Australian market."
    }
  ];

  const stats = [
    { icon: Building2, number: "500+", label: "Verified Service Providers" },
    { icon: Users, number: "1,200+", label: "Successful Market Entries" },
    { icon: TrendingUp, number: "94%", label: "Success Rate" }
  ];

  return (
    <>
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Unlock the Secrets to
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block mt-2">
                Australian Market Success
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              We're Australia's premier directory connecting businesses with the insider knowledge, 
              vetted experts, and proven strategies needed to successfully enter and thrive in the Australian market.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  To democratize access to the insider knowledge and expert connections that make 
                  Australian market entry successful. We believe every business deserves to know 
                  the secrets that industry leaders use to thrive in Australia.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  By curating the best service providers, mentors, and resources, we're creating 
                  a transparent ecosystem where success strategies are shared, not hidden.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8 soft-shadow">
                  <h3 className="text-xl font-semibold text-foreground mb-4">What Makes Us Different</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Every provider is personally vetted and verified</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Access to insider strategies not found elsewhere</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Transparent success rates and real testimonials</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>Comprehensive ecosystem covering all market entry needs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-section">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Core Values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do and ensure you get the best possible 
                market entry experience.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-border/50 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 soft-shadow">
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-4 mx-auto">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-muted-foreground leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Uncover Your Market Entry Secrets?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of businesses who have successfully entered the Australian market 
              using our insider knowledge and expert network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/" 
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Start Exploring Secrets
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-3 border border-border bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>
      
    </>
  );
};

export default About;
