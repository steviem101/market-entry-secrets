import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { COUNTRY_OPTIONS, TARGET_MARKET_OPTIONS } from '@/components/report-creator/intakeSchema';

const USE_CASE_OPTIONS = [
  { value: 'founder', label: 'Founder / Startup' },
  { value: 'corporate', label: 'Corporate / Enterprise' },
  { value: 'trade_agency', label: 'Trade / Investment Agency' },
  { value: 'advisor', label: 'Advisor / Consultant' },
  { value: 'other', label: 'Other' },
] as const;

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OnboardingDialog = ({ open, onOpenChange }: OnboardingDialogProps) => {
  const { updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    company_name: '',
    country: '',
    target_market: '',
    use_case: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile({
      ...formData,
      onboarding_completed: true,
    });
    if (!result.error) {
      onOpenChange(false);
    }
  };

  const handleSkip = async () => {
    const result = await updateProfile({ onboarding_completed: true });
    if (!result.error) {
      onOpenChange(false);
    }
  };

  const isValid = formData.company_name && formData.country && formData.target_market && formData.use_case;

  return (
    <Dialog open={open} onOpenChange={() => { /* prevent closing without completing */ }}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Market Entry Secrets</DialogTitle>
          <DialogDescription>
            Tell us a bit about yourself so we can personalise your experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="onboard-company">Company Name</Label>
            <Input
              id="onboard-company"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Your company name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-country">Country / Region</Label>
            <Select value={formData.country} onValueChange={(val) => setFormData(prev => ({ ...prev, country: val }))}>
              <SelectTrigger id="onboard-country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-target">Target Market</Label>
            <Select value={formData.target_market} onValueChange={(val) => setFormData(prev => ({ ...prev, target_market: val }))}>
              <SelectTrigger id="onboard-target">
                <SelectValue placeholder="Select target market" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_MARKET_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-usecase">How will you use the platform?</Label>
            <Select value={formData.use_case} onValueChange={(val) => setFormData(prev => ({ ...prev, use_case: val }))}>
              <SelectTrigger id="onboard-usecase">
                <SelectValue placeholder="Select your use case" />
              </SelectTrigger>
              <SelectContent>
                {USE_CASE_OPTIONS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSkip}
            >
              Skip for now
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? 'Saving...' : 'Get Started'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
