
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Calendar, Handshake, ArrowRight } from "lucide-react";

const PartnerWithUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Partner With Us</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join Australia's leading market entry ecosystem. Whether you're a service provider, mentor, 
              event organizer, or industry expert, we'd love to have you in our network.
            </p>
          </div>

          {/* Partnership Options Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Service Provider Listing */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>List Your Services</CardTitle>
                    <CardDescription>Join our directory of market entry service providers</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="Your Company Name" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service-category">Service Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="legal">Legal Services</SelectItem>
                        <SelectItem value="accounting">Accounting & Tax</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="consulting">Business Consulting</SelectItem>
                        <SelectItem value="marketing">Marketing & PR</SelectItem>
                        <SelectItem value="tech">Technology Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-description">Service Description</Label>
                    <Textarea id="company-description" placeholder="Describe your services..." rows={3} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input id="contact-email" type="email" placeholder="contact@yourcompany.com" />
                  </div>
                </div>
                
                <Button className="w-full">
                  Submit Service Listing <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Mentor Application */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>Become a Mentor</CardTitle>
                    <CardDescription>Share your expertise with businesses entering Australia</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mentor-first-name">First Name</Label>
                      <Input id="mentor-first-name" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mentor-last-name">Last Name</Label>
                      <Input id="mentor-last-name" placeholder="Smith" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expertise-area">Area of Expertise</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your expertise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market-entry">Market Entry Strategy</SelectItem>
                        <SelectItem value="regulatory">Regulatory Compliance</SelectItem>
                        <SelectItem value="finance">Finance & Investment</SelectItem>
                        <SelectItem value="operations">Operations Setup</SelectItem>
                        <SelectItem value="technology">Technology & Innovation</SelectItem>
                        <SelectItem value="sales">Sales & Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input id="experience" type="number" placeholder="10" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mentor-bio">Bio</Label>
                    <Textarea id="mentor-bio" placeholder="Tell us about your background..." rows={3} />
                  </div>
                </div>
                
                <Button className="w-full">
                  Apply to Mentor <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Event Submission */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>Submit an Event</CardTitle>
                    <CardDescription>Add your market entry event to our calendar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input id="event-title" placeholder="Australian Market Entry Workshop" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Date</Label>
                      <Input id="event-date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-time">Time</Label>
                      <Input id="event-time" type="time" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-location">Location/Format</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="sydney">Sydney</SelectItem>
                        <SelectItem value="melbourne">Melbourne</SelectItem>
                        <SelectItem value="brisbane">Brisbane</SelectItem>
                        <SelectItem value="perth">Perth</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description">Event Description</Label>
                    <Textarea id="event-description" placeholder="Describe your event..." rows={3} />
                  </div>
                </div>
                
                <Button className="w-full">
                  Submit Event <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Referral Program */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Handshake className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle>Referral Program</CardTitle>
                    <CardDescription>Refer businesses and earn rewards</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Badge variant="secondary" className="mb-2">Step 1</Badge>
                      <p className="text-sm">Refer a business</p>
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-2">Step 2</Badge>
                      <p className="text-sm">They use our services</p>
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-2">Step 3</Badge>
                      <p className="text-sm">You earn rewards</p>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Referral Benefits:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• $500 for successful service provider connections</li>
                      <li>• $200 for mentor matches</li>
                      <li>• $100 for event attendee referrals</li>
                      <li>• Bonus rewards for multiple referrals</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referrer-email">Your Email</Label>
                    <Input id="referrer-email" type="email" placeholder="your@email.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referred-company">Company to Refer</Label>
                    <Input id="referred-company" placeholder="Company name or contact" />
                  </div>
                </div>
                
                <Button className="w-full">
                  Join Referral Program <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Why Partner With Market Entry Secrets?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Extensive Network</h3>
                  <p className="text-sm text-muted-foreground">Connect with hundreds of businesses looking to enter the Australian market</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Qualified Leads</h3>
                  <p className="text-sm text-muted-foreground">Access pre-qualified businesses actively seeking market entry support</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Trusted Platform</h3>
                  <p className="text-sm text-muted-foreground">Join Australia's most trusted market entry resource platform</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PartnerWithUs;
