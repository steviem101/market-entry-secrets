import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw, Share2 } from 'lucide-react';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface PlanResultProps {
  plan: string;
  metadata: {
    persona: string;
    sector: string;
    stage: string;
    goals: string[];
    providers_matched: number;
    events_matched: number;
    mentors_matched: number;
  };
  onRestart: () => void;
}

export const PlanResult = ({ plan, metadata, onRestart }: PlanResultProps) => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    toast({
      title: 'Plan saved',
      description: 'Your plan has been saved to your account.',
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Plan link copied to clipboard.',
      });
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Metadata summary */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
          {metadata.providers_matched} providers matched
        </span>
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
          {metadata.events_matched} upcoming events
        </span>
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
          {metadata.mentors_matched} mentors matched
        </span>
      </div>

      {/* Plan content */}
      <Card className="border-border/50 shadow-lg mb-8">
        <CardContent className="p-8 md:p-12">
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown>{plan}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          onClick={handleSave}
          className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          <Save className="w-5 h-5" />
          {user ? 'Save My Plan' : 'Save My Plan (Sign Up)'}
        </Button>
        <Button size="lg" variant="outline" onClick={handleShare} className="gap-2">
          <Share2 className="w-5 h-5" />
          Share
        </Button>
        <Button size="lg" variant="outline" onClick={onRestart} className="gap-2">
          <RefreshCw className="w-5 h-5" />
          Start Over
        </Button>
      </div>

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} defaultTab="signup" />
    </div>
  );
};
