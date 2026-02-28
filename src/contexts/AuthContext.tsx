
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '@/hooks/auth/types';
import { OnboardingDialog } from '@/components/auth/OnboardingDialog';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
  session: Session | null;
  loading: boolean;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthState();

  const showOnboarding = !authState.loading
    && authState.user !== null
    && authState.profile !== null
    && authState.profile.onboarding_completed === false;

  return (
    <AuthContext.Provider value={authState}>
      {children}
      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={() => {
          // Dialog closes when updateProfile sets onboarding_completed = true
        }}
      />
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
