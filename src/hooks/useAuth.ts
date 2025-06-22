
import { useAuthState } from './auth/useAuthState';
import { useAuthService } from './auth/authService';
import { useRoleHelpers } from './auth/useRoleHelpers';

export const useAuth = () => {
  const {
    user,
    profile,
    roles,
    session,
    loading,
    setProfile,
    setLoading
  } = useAuthState();

  const {
    signInWithEmail: serviceSignInWithEmail,
    signUpWithEmail: serviceSignUpWithEmail,
    signInWithProvider,
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

  const updateProfile = async (updates: any) => {
    setLoading(true);
    try {
      return await serviceUpdateProfile(updates, user, setProfile);
    } finally {
      setLoading(false);
    }
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
    signOut,
    updateProfile,
    resetPassword,
    hasRole,
    isAdmin,
    isModerator,
  };
};

// Re-export types for backward compatibility
export type { UserProfile, UserRole } from './auth/types';
