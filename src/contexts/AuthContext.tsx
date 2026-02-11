
import React, { createContext, useContext, ReactNode } from 'react';
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
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>
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
