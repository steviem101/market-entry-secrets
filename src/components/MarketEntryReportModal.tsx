import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ArrowRight, CheckCircle, Building, User, Target } from "lucide-react";

interface MarketEntryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // Company Info
  companyName: string;
  industry: string;
  companySize: string;
  currentRevenue: string;
  website: string;
  
  // Contact Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  
  // Market Entry Details
  targetMarket: string;
  entryTimeline: string;
  budget: string;
  challenges: string;
  experience: string;
  priorities: string;
}

const initialFormData: FormData = {
  companyName: "",
  industry: "",
  companySize: "",
  currentRevenue: "",
  website: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  targetMarket: "",
  entryTimeline: "",
  budget: "",
  challenges: "",
  experience: "",
  priorities: ""
};

const steps = [
  { id: 1, title: "Company Info", icon: Building },
  { id: 2, title: "Contact Details", icon: User },
  { id: 3, title: "Market Specifics", icon: Target }
];

export const MarketEntryReportModal = ({ isOpen, onClose }: MarketEntryReportModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.industry && formData.companySize;
      case 2:
        return formData.firstName && formData.lastName && formData.email && formData.position;
      case 3:
        return formData.targetMarket && formData.entryTimeline && formData.challenges;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const reportData = {
        user_id: user?.id || null,
        title: `Market Entry Report - ${formData.companyName}`,
        description: `Market entry analysis for ${formData.companyName} in ${formData.targetMarket}`,
        report_type: 'market_analysis',
        metadata: {
          company_info: {
            name: formData.companyName,
            industry: formData.industry,
            size: formData.companySize,
            revenue: formData.currentRevenue,
            website: formData.website
          },
          contact_info: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            position: formData.position
          },
          market_entry: {
            targetMarket: formData.targetMarket,
            timeline: formData.entryTimeline,
            budget: formData.budget,
            challenges: formData.challenges,
            experience: formData.experience,
            priorities: formData.priorities
          },
          submitted_at: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('market_entry_reports')
        .insert(reportData);

      if (error) throw error;

      toast({
        title: "Thanks for submitting.",
        description: "We will be in touch soon to discuss your market entry report",
      });

      setFormData(initialFormData);
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter your company name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size *</Label>
                <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentRevenue">Annual Revenue</Label>
                <Select value={formData.currentRevenue} onValueChange={(value) => handleInputChange('currentRevenue', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-1m">Under $1M</SelectItem>
                    <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                    <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                    <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                    <SelectItem value="50m+">$50M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Company Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.yourcompany.com"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@company.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Your Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="CEO, Founder, Director, etc."
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="targetMarket">Target Australian Market *</Label>
              <Select value={formData.targetMarket} onValueChange={(value) => handleInputChange('targetMarket', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your target market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sydney">Sydney, NSW</SelectItem>
                  <SelectItem value="melbourne">Melbourne, VIC</SelectItem>
                  <SelectItem value="brisbane">Brisbane, QLD</SelectItem>
                  <SelectItem value="perth">Perth, WA</SelectItem>
                  <SelectItem value="adelaide">Adelaide, SA</SelectItem>
                  <SelectItem value="national">National (All Australia)</SelectItem>
                  <SelectItem value="other">Other/Specific Region</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryTimeline">Entry Timeline *</Label>
                <Select value={formData.entryTimeline} onValueChange={(value) => handleInputChange('entryTimeline', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you plan to enter?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-6months">0-6 months</SelectItem>
                    <SelectItem value="6-12months">6-12 months</SelectItem>
                    <SelectItem value="1-2years">1-2 years</SelectItem>
                    <SelectItem value="2+years">2+ years</SelectItem>
                    <SelectItem value="exploring">Just exploring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Entry Budget</Label>
                <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-50k">Under $50K</SelectItem>
                    <SelectItem value="50k-200k">$50K - $200K</SelectItem>
                    <SelectItem value="200k-500k">$200K - $500K</SelectItem>
                    <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                    <SelectItem value="1m+">$1M+</SelectItem>
                    <SelectItem value="tbd">To be determined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Key Challenges & Concerns *</Label>
              <Textarea
                id="challenges"
                value={formData.challenges}
                onChange={(e) => handleInputChange('challenges', e.target.value)}
                placeholder="What are your main concerns about entering the Australian market? (e.g., regulations, competition, local partnerships, etc.)"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">International Experience</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="Describe any previous international expansion experience (optional)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priorities">Key Priorities</Label>
              <Textarea
                id="priorities"
                value={formData.priorities}
                onChange={(e) => handleInputChange('priorities', e.target.value)}
                placeholder="What are your top 3 priorities for this market entry? (e.g., finding distributors, understanding regulations, market sizing, etc.)"
                rows={2}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl border-0 p-0" aria-describedby="market-entry-description">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8">
          <DialogHeader>
            <div className="flex items-center justify-end mb-4">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                        ${isActive 
                          ? 'bg-white text-orange-500 border-white' 
                          : isCompleted
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-transparent text-white border-white/50'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-white/30'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <DialogTitle className="text-3xl font-bold mb-2">
              Get Your Custom Market Entry Report
            </DialogTitle>
            <p className="text-lg text-white/90">
              Step {currentStep} of 3: {steps[currentStep - 1].title}
            </p>
          </DialogHeader>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button 
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                {!isSubmitting && <CheckCircle className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>

          {/* Report Info */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">What you'll receive:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Comprehensive market analysis for your specific industry</li>
              <li>• Regulatory requirements and compliance guidelines</li>
              <li>• Market entry strategies and recommendations</li>
              <li>• Key contact information for local partners and agencies</li>
              <li>• Timeline and budget estimates for market entry</li>
            </ul>
            <p className="text-xs text-blue-700 mt-3">
              <strong>Delivery:</strong> 3-5 business days • <strong>Format:</strong> PDF Report • <strong>Follow-up:</strong> 30-minute consultation call included
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};