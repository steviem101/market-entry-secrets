
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthDialog } from './auth/AuthDialog';
import { Lock, Eye, Users, FileText, Database, TrendingUp } from 'lucide-react';

interface PaywallModalProps {
  contentType: string;
  contentTitle?: string;
  contentDescription?: string;
}

const contentTypeInfo = {
  content: { icon: FileText, label: 'Content Articles', description: 'success stories and guides' },
  service_providers: { icon: Users, label: 'Service Providers', description: 'professional services' },
  community_members: { icon: Users, label: 'Community Members', description: 'mentors and experts' },
  leads: { icon: Database, label: 'Lead Databases', description: 'premium databases and market intelligence' },
  events: { icon: TrendingUp, label: 'Industry Events', description: 'networking opportunities' },
  trade_investment_agencies: { icon: Users, label: 'Trade & Investment Agencies', description: 'government agencies and chambers' },
  innovation_ecosystem: { icon: Users, label: 'Innovation Ecosystem', description: 'accelerators, incubators, and funding partners' },
};

export const PaywallModal = ({ contentType, contentTitle, contentDescription }: PaywallModalProps) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const info = contentTypeInfo[contentType as keyof typeof contentTypeInfo] || contentTypeInfo.content;
  const Icon = info.icon;

  return (
    <>
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Sign Up to Continue</CardTitle>
            <CardDescription>
              You've reached your limit of 3 free views. Sign up to get unlimited access to all {info.description}.
            </CardDescription>
            
            {/* Show specific content being blocked */}
            {(contentTitle || contentDescription) && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">You're trying to view:</span>
                </div>
                {contentTitle && (
                  <h4 className="text-sm font-semibold mb-1">{contentTitle}</h4>
                )}
                {contentDescription && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{contentDescription}</p>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-medium">What you get with a free account:</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Unlimited access to all content
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Browse all service providers and mentors
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Save and bookmark your favorites
                </li>
              </ul>
            </div>
            <Button 
              onClick={() => setShowAuthDialog(true)}
              className="w-full"
              size="lg"
            >
              Sign Up for Free
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Already have an account? Sign in to continue
            </p>
          </CardContent>
        </Card>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
};
