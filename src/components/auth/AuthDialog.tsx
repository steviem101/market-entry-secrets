
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { setAuthReturnPath } from '@/lib/authReturnPath';

const MicrosoftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'signin' | 'signup' | 'magiclink' | 'reset';
  /**
   * When set, renders the streamlined "answers saved" layout used by the report
   * intake flow: a green reassurance banner, SSO-first, email magic-link
   * secondary, and a bottom sheet on mobile. Omit for the standard tabbed UI.
   */
  reassurance?: { title: string; subtitle: string };
  /**
   * Path to navigate to after OAuth / magic-link auth completes via
   * /auth/callback. Defaults to the page the user is on (pathname + search)
   * so sign-in never dumps them on '/'. Must be a same-origin path beginning
   * with '/' (rejected otherwise — open-redirect safe).
   */
  returnTo?: string;
}

export const AuthDialog = ({ open, onOpenChange, defaultTab = 'signin', reassurance, returnTo }: AuthDialogProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  const { signInWithEmail, signUpWithEmail, signInWithProvider, signInWithMagicLink, resetPassword, loading } = useAuth();

  // Set the active tab to defaultTab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      setMagicLinkSent(false);
    }
  }, [open, defaultTab]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signInWithEmail(email, password);
    if (!error) {
      onOpenChange(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // The confirm-signup email link also lands on /auth/callback — return the
    // user to the page they signed up from, not '/'.
    setAuthReturnPath(resolveReturnTo());
    const { error } = await signUpWithEmail(email, password, {
      first_name: firstName,
      last_name: lastName,
    });
    if (!error) {
      onOpenChange(false);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(resetEmail);
    setResetEmail('');
  };

  // Explicit returnTo wins; otherwise return to the page the dialog was
  // opened on. Resolved at click time so it reflects the live location.
  const resolveReturnTo = () =>
    returnTo ?? (typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : undefined);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    // Persist the desired post-auth destination so /auth/callback can navigate
    // back to the calling page (e.g. /report-creator?v2=1) instead of '/'.
    setAuthReturnPath(resolveReturnTo());
    const result = await signInWithMagicLink(magicLinkEmail);
    if (!result.error) {
      setMagicLinkSent(true);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'azure') => {
    setAuthReturnPath(resolveReturnTo());
    await signInWithProvider(provider);
  };

  const handleTabChange = (value: string) => {
    if (value === 'signin' || value === 'signup' || value === 'reset' || value === 'magiclink') {
      setActiveTab(value);
    }
  };

  // Streamlined report-intake layout: reassurance banner + SSO-first + magic link.
  if (reassurance) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-4 sm:max-w-[400px] max-sm:bottom-0 max-sm:top-auto max-sm:left-0 max-sm:right-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:max-w-full max-sm:rounded-b-none max-sm:rounded-t-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Create your free account</DialogTitle>
          </DialogHeader>

          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-900">{reassurance.title}</p>
              <p className="text-[13px] leading-snug text-emerald-700">{reassurance.subtitle}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <Button variant="outline" className="h-11 w-full" onClick={() => handleSocialSignIn('google')} disabled={loading}>
              <Mail className="mr-2 h-4 w-4" /> Continue with Google
            </Button>
            <Button variant="outline" className="h-11 w-full" onClick={() => handleSocialSignIn('azure')} disabled={loading}>
              <MicrosoftIcon className="mr-2 h-4 w-4" /> Continue with Microsoft
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or email</span>
            </div>
          </div>

          {magicLinkSent ? (
            <div className="space-y-3 py-2 text-center">
              <Mail className="mx-auto h-10 w-10 text-primary" />
              <h3 className="font-medium">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We sent a sign-in link to <strong>{magicLinkEmail}</strong>. Click it to see your report.
              </p>
              <Button variant="outline" size="sm" onClick={() => setMagicLinkSent(false)}>Try another email</Button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-2.5">
              <Input
                id="reassure-magic-email"
                type="email"
                value={magicLinkEmail}
                onChange={(e) => setMagicLinkEmail(e.target.value)}
                placeholder="you@company.com"
                aria-label="Email"
                required
              />
              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Email me a magic link'}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground">No password needed · takes 10 seconds</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Access Your Account</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="magiclink">Magic Link</TabsTrigger>
            <TabsTrigger value="reset">Reset</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignIn('google')}
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignIn('azure')}
                disabled={loading}
              >
                <MicrosoftIcon className="mr-2 h-4 w-4" />
                Continue with Microsoft
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignIn('google')}
                disabled={loading}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignIn('azure')}
                disabled={loading}
              >
                <MicrosoftIcon className="mr-2 h-4 w-4" />
                Continue with Microsoft
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 8 characters)"
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magiclink" className="space-y-4">
            {magicLinkSent ? (
              <div className="text-center space-y-3 py-4">
                <Mail className="h-12 w-12 mx-auto text-primary" />
                <h3 className="font-medium">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  We sent a magic link to <strong>{magicLinkEmail}</strong>. Click the link to sign in.
                </p>
                <Button variant="outline" size="sm" onClick={() => setMagicLinkSent(false)}>
                  Try another email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a sign-in link. No password needed.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="magiclink-email">Email</Label>
                  <Input
                    id="magiclink-email"
                    type="email"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="reset" className="space-y-4">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
