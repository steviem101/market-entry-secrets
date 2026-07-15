
import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '@/hooks/auth/types';

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
  const { user, profile, roles, session, loading, setProfile, setLoading } = useAuthState();

  const value = useMemo(() => ({
    user, profile, roles, session, loading, setProfile, setLoading
  }), [user, profile, roles, session, loading, setProfile, setLoading]);

  // The onboarding modal is rendered by <OnboardingGate> inside the Router
  // (MES-187 A2) so it can be route-aware — AuthProvider sits above BrowserRouter
  // and can't read the location.
  return (
    <AuthContext.Provider value={value}>
      {children}
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
