import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { COUNTRY_OPTIONS } from '@/components/report-creator/intakeSchema';
import { corporateWebsiteFromEmail } from '@/lib/corporateDomain';
import { prefillFromWebsite } from '@/components/report-creator/v2/prefillWebsite';
import { trackFunnelEvent } from '@/lib/analytics/intakeFunnel';
import {
  buildOnboardingProfile,
  buildSkippedOnboardingProfile,
  isOnboardingComplete,
  normaliseWebsite,
} from '@/lib/onboardingProfile';

// Persona is the highest-signal question, so it leads (MES-187 A3). Target
// Market is intentionally gone — MES only serves the Australian/ANZ corridor,
// so it's always Australia (stamped at the write path, not asked).
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
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    use_case: '',
    website: '',
    company_name: '',
    country: '',
  });
  const [deriving, setDeriving] = useState(false);
  const derivedForRef = useRef<string | null>(null);

  // Fire the shown event once per open, and prefill the website from the user's
  // corporate email domain (free-mail returns null → field starts empty).
  const shownRef = useRef(false);
  useEffect(() => {
    if (!open) {
      shownRef.current = false;
      return;
    }
    if (shownRef.current) return;
    shownRef.current = true;
    trackFunnelEvent('onboarding_modal_shown', { source: 'onboarding', user_id: user?.id ?? null });
    const guessed = corporateWebsiteFromEmail(user?.email);
    if (guessed) setFormData((prev) => (prev.website ? prev : { ...prev, website: guessed }));
  }, [open, user]);

  // Derive the company name from the website via the existing scrape-company
  // seam. Non-blocking and silent: on failure/empty the manual name field is the
  // graceful fallback, and completion is never gated on this.
  const deriveFromWebsite = async () => {
    const website = normaliseWebsite(formData.website);
    if (!website || derivedForRef.current === website) return;
    derivedForRef.current = website;
    setDeriving(true);
    try {
      const prefill = await prefillFromWebsite(website);
      if (prefill?.company_name) {
        setFormData((prev) => (prev.company_name ? prev : { ...prev, company_name: prefill.company_name! }));
      }
    } catch {
      /* silent — manual name field remains */
    } finally {
      setDeriving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile(buildOnboardingProfile(formData));
    if (!result.error) {
      trackFunnelEvent('onboarding_modal_completed', {
        source: 'onboarding',
        user_id: user?.id ?? null,
        persona: formData.use_case || null,
      });
      onOpenChange(false);
    }
  };

  const handleSkip = async () => {
    const result = await updateProfile(buildSkippedOnboardingProfile());
    if (!result.error) {
      trackFunnelEvent('onboarding_modal_skipped', { source: 'onboarding', user_id: user?.id ?? null });
      onOpenChange(false);
    }
  };

  const isValid = isOnboardingComplete(formData);

  return (
    <Dialog open={open} onOpenChange={() => { /* prevent closing without completing */ }}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Market Entry Secrets</DialogTitle>
          <DialogDescription>
            A few quick details (about 20 seconds) so we can match you with the right providers,
            mentors and build your Australia market-entry plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="onboard-website">Company website</Label>
            <Input
              id="onboard-website"
              type="url"
              inputMode="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              onBlur={deriveFromWebsite}
              placeholder="yourcompany.com"
            />
            <p className="text-xs text-muted-foreground">
              We&rsquo;ll read it to personalise your setup. No website? Just add your company name below.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboard-company" className="flex items-center gap-2">
              Company name
              {deriving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </Label>
            <Input
              id="onboard-company"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder={deriving ? 'Reading your website…' : 'Your company name'}
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

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={loading}
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
