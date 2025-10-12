
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Terms of Service</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Last Updated: June 15, 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Welcome to Market Entry Secrets. These Terms of Service ("Terms") govern your 
                use of our platform and services. By accessing or using our platform, you agree 
                to be bound by these Terms.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  By accessing and using Market Entry Secrets, you accept and agree to be bound 
                  by the terms and provision of this agreement. If you do not agree to abide by 
                  the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Description of Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Market Entry Secrets is a platform that connects businesses entering the 
                  Australian market with local service providers, mentors, and resources. 
                  We facilitate connections but are not responsible for the quality or 
                  outcome of services provided by third parties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. User Accounts and Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Account Creation</h3>
                  <p className="text-muted-foreground">
                    You may need to create an account to access certain features. You are 
                    responsible for maintaining the confidentiality of your account credentials.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Accurate Information</h3>
                  <p className="text-muted-foreground">
                    You agree to provide accurate, current, and complete information during 
                    registration and to update such information to keep it accurate and current.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Acceptable Use</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You agree not to use the platform for any unlawful purpose or in any way that 
                  could damage, disable, or impair the service. Prohibited activities include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Providing false or misleading information</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Uploading harmful or malicious content</li>
                  <li>Spamming or sending unsolicited communications</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Infringing on intellectual property rights</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Service Provider Listings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Third-Party Services</h3>
                  <p className="text-muted-foreground">
                    Service providers listed on our platform are independent third parties. 
                    We do not endorse, guarantee, or take responsibility for their services, 
                    qualifications, or business practices.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Due Diligence</h3>
                  <p className="text-muted-foreground">
                    Users are responsible for conducting their own due diligence when 
                    selecting service providers, including verifying credentials, 
                    licenses, and references.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Payment and Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Platform Fees</h3>
                  <p className="text-muted-foreground">
                    Service provider listing fees are non-refundable unless otherwise stated. 
                    Fees may change with 30 days' notice.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Third-Party Payments</h3>
                  <p className="text-muted-foreground">
                    All payments between users and service providers are handled directly 
                    between the parties. We are not responsible for payment disputes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The content, features, and functionality of Market Entry Secrets are owned 
                  by us and are protected by copyright, trademark, and other intellectual 
                  property laws. You may not reproduce, distribute, or create derivative 
                  works without our written permission.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Please review our Privacy Policy, which 
                  governs how we collect, use, and protect your personal information. By using 
                  our platform, you consent to our privacy practices.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Disclaimers and Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Service Disclaimer</h3>
                  <p className="text-muted-foreground">
                    Our platform is provided "as is" without warranties of any kind. We do not 
                    guarantee the accuracy, completeness, or reliability of any content or services.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                  <p className="text-muted-foreground">
                    To the maximum extent permitted by law, we shall not be liable for any 
                    indirect, incidental, special, or consequential damages arising from your 
                    use of the platform.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We reserve the right to terminate or suspend your account at any time for 
                  violations of these Terms or for any other reason. You may also terminate 
                  your account at any time by contacting us.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  These Terms are governed by the laws of New South Wales, Australia. Any 
                  disputes shall be resolved in the courts of New South Wales.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms at any time. Changes will be 
                  effective immediately upon posting. Your continued use of the platform 
                  constitutes acceptance of the modified Terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>13. Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p>Email: legal@marketentrysecrets.com.au</p>
                  <p>Address: Sydney, NSW, Australia</p>
                  <p>Phone: +61 2 9000 0000</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
