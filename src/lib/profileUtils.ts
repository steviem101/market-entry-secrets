/**
 * Shared profile utility functions.
 * Eliminates duplication across Dashboard, MemberHub, UserDropdown, ProfileDialog.
 */

interface ProfileLike {
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
}

interface UserLike {
  email?: string | null;
}

export const getInitials = (profile?: ProfileLike | null): string => {
  if (!profile) return '??';
  const firstName = profile.first_name || '';
  const lastName = profile.last_name || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  return initials || '??';
};

export const getDisplayName = (profile?: ProfileLike | null, user?: UserLike | null): string => {
  if (profile?.first_name && profile?.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  return profile?.username || user?.email?.split('@')[0] || 'Member';
};
