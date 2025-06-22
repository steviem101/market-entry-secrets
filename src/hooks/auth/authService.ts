
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
      setTimeout(clearUsageTracking, 100);

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
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Clear usage tracking after successful sign up
      setTimeout(clearUsageTracking, 100);

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

  const signInWithProvider = async (provider: 'google' | 'github' | 'linkedin_oidc') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
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

  const updateProfile = async (updates: Partial<UserProfile>, user: any, setProfile: (profile: UserProfile | null) => void) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates })
        .select()
        .single();

      if (error) {
        toast({
          title: "Profile Update Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setProfile(data);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      return { data };
    } catch (error) {
      toast({
        title: "Profile Update Error",
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
    signOut,
    updateProfile,
    resetPassword,
  };
};
