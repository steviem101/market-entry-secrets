
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from './types';

export const useAuthService = () => {
  const { toast } = useToast();

  const clearUsageTracking = () => {
    // Clear usage tracking when user signs in/up
    localStorage.removeItem('view_count');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('viewed_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Clear usage tracking after successful sign in
      clearUsageTracking();

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return { data };
    } catch (error) {
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Don't confirm whether an email is registered (account enumeration).
        // Show the same neutral guidance an unknown email would get; the
        // dialog stays open so an existing user can switch to Sign In.
        const alreadyRegistered =
          (error as { code?: string }).code === 'user_already_exists' ||
          /already (been )?registered|already exists/i.test(error.message);
        if (alreadyRegistered) {
          toast({
            title: "Check your email",
            description: "If this email isn't already registered, you'll receive a confirmation link shortly. Already have an account? Sign in instead.",
          });
          return { error };
        }
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Clear usage tracking after successful sign up
      clearUsageTracking();

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });

      return { data };
    } catch (error) {
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'azure' | 'linkedin_oidc') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: "Social Sign In Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { data };
    } catch (error) {
      toast({
        title: "Social Sign In Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Sign Out Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateProfile = async (
    updates: Partial<UserProfile>,
    user: any,
    setProfile: (profile: UserProfile | null) => void,
    // Silent updates skip the success/error toasts — used when we derive the
    // profile in the background (e.g. from the report intake, MES-187 A1) and a
    // "Profile Updated" toast mid-generation would be noise.
    silent = false,
  ) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Never let the client write server-managed columns. `stripe_customer_id`
      // is set only by create-checkout (service role); the DB also enforces this
      // via the SEC-05 trigger, but stripping here avoids surfacing that error to
      // legitimate users and keeps the write payload to user-editable fields.
      const safeUpdates = { ...updates } as Record<string, unknown>;
      for (const k of ['id', 'stripe_customer_id', 'created_at', 'updated_at']) {
        delete safeUpdates[k];
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...safeUpdates })
        .select()
        .single();

      if (error) {
        if (!silent) {
          toast({
            title: "Profile Update Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      setProfile(data);
      if (!silent) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      }

      return { data };
    } catch (error) {
      if (!silent) {
        toast({
          title: "Profile Update Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
      return { error };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: "Magic Link Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Magic Link Sent!",
        description: "Check your email for a sign-in link.",
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Magic Link Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Password Reset Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });

      return { success: true };
    } catch (error) {
      toast({
        title: "Password Reset Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    signInWithMagicLink,
    signOut,
    updateProfile,
    resetPassword,
  };
};
