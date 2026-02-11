
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8 text-center">Privacy Policy</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Last Updated: June 15, 2025</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-muted-foreground mb-6">
                Market Entry Secrets ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our platform.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p className="text-muted-foreground">
                    We collect information you provide directly, including name, email address, 
                    company details, phone number, and business requirements when you register, 
                    submit forms, or contact us.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Usage Information</h3>
                  <p className="text-muted-foreground">
                    We automatically collect information about your interactions with our platform, 
                    including pages visited, time spent, search queries, and device information.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Cookies and Tracking</h3>
                  <p className="text-muted-foreground">
                    We use cookies and similar technologies to enhance your experience, 
                    analyze usage patterns, and provide personalized content.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide and maintain our services</li>
                  <li>Connect you with relevant service providers and mentors</li>
                  <li>Send you updates about services, events, and content</li>
                  <li>Improve our platform and user experience</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Comply with legal obligations and protect our rights</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Service Providers</h3>
                  <p className="text-muted-foreground">
                    We may share your contact information with relevant service providers 
                    when you express interest in their services or request to be contacted.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Business Partners</h3>
                  <p className="text-muted-foreground">
                    We may share aggregated, non-personally identifiable information 
                    with business partners for analytics and improvement purposes.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Legal Requirements</h3>
                  <p className="text-muted-foreground">
                    We may disclose information when required by law or to protect 
                    our rights, safety, and the rights of others.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational security measures to protect 
                  your personal information against unauthorized access, alteration, disclosure, or 
                  destruction. However, no internet transmission is completely secure.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Access and update your personal information</li>
                  <li>Request deletion of your account and personal data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Control cookie preferences through your browser settings</li>
                  <li>Request a copy of your personal data</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than 
                  Australia. We ensure appropriate safeguards are in place to protect your 
                  information in accordance with applicable privacy laws.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our services are not intended for children under 18. We do not knowingly 
                  collect personal information from children under 18.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Changes to This Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you 
                  of significant changes by posting the new policy on our platform and 
                  updating the "Last Updated" date.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy or our privacy practices, 
                  please contact us:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p>Email: privacy@marketentrysecrets.com.au</p>
                  <p>Address: Sydney, NSW, Australia</p>
                  <p>Phone: +61 2 9000 0000</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default PrivacyPolicy;
