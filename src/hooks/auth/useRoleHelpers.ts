
import { UserRole } from './types';

export const useRoleHelpers = (roles: UserRole[]) => {
  const hasRole = (role: 'admin' | 'moderator' | 'user') => {
    return roles.some(r => r.role === role);
  };

  const isAdmin = () => hasRole('admin');
  const isModerator = () => hasRole('moderator') || hasRole('admin');

  return {
    hasRole,
    isAdmin,
    isModerator,
  };
};
