
import { useAuthContext } from '@/contexts/AuthContext';
import { useAuthService } from './auth/authService';
import { useRoleHelpers } from './auth/useRoleHelpers';
import type { UserProfile } from './auth/types';

export const useAuth = () => {
  const {
    user,
    profile,
    roles,
    session,
    loading,
    setProfile,
    setLoading
  } = useAuthContext();

  const {
    signInWithEmail: serviceSignInWithEmail,
    signUpWithEmail: serviceSignUpWithEmail,
    signInWithProvider,
    signInWithMagicLink: serviceSignInWithMagicLink,
    signOut: serviceSignOut,
    updateProfile: serviceUpdateProfile,
    resetPassword,
  } = useAuthService();

  const { hasRole, isAdmin, isModerator } = useRoleHelpers(roles);

  // Wrapper methods that handle loading state
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      return await serviceSignInWithEmail(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    try {
      return await serviceSignUpWithEmail(email, password, metadata);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      return await serviceSignOut();
    } finally {
      setLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    setLoading(true);
    try {
      return await serviceSignInWithMagicLink(email);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    setLoading(true);
    try {
      return await serviceUpdateProfile(updates, user, setProfile);
    } finally {
      setLoading(false);
    }
  };

  // Silent, background profile derivation (MES-187 A1). Unlike updateProfile it
  // does NOT toggle global auth loading (which would flicker the report/auth UI
  // mid-generation) and shows no toast. Best-effort — callers ignore failures.
  const deriveProfileFromIntake = async (updates: Partial<UserProfile>) => {
    return await serviceUpdateProfile(updates, user, setProfile, true);
  };

  return {
    user,
    profile,
    roles,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithProvider,
    signInWithMagicLink,
    signOut,
    updateProfile,
    deriveProfileFromIntake,
    resetPassword,
    hasRole,
    isAdmin,
    isModerator,
  };
};

// Re-export types for backward compatibility
export type { UserProfile, UserRole } from './auth/types';
