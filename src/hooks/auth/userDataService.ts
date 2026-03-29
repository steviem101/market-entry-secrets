
import type { MutableRefObject } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from './types';

interface UserDataSetters {
  setProfile: (profile: UserProfile | null) => void;
  setRoles: (roles: UserRole[]) => void;
  fetchingProfile: MutableRefObject<boolean>;
  fetchingRoles: MutableRefObject<boolean>;
}

export const fetchUserData = async (userId: string, setters: UserDataSetters) => {
  // Fetch profile and roles concurrently but prevent duplicates
  await Promise.all([
    fetchUserProfile(userId, setters),
    fetchUserRoles(userId, setters)
  ]);
};

const fetchUserProfile = async (userId: string, { setProfile, fetchingProfile }: UserDataSetters) => {
  // Prevent duplicate calls
  if (fetchingProfile.current) return;
  fetchingProfile.current = true;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return;
    }

    setProfile(data);
  } catch {
    // Profile fetch failed
  } finally {
    fetchingProfile.current = false;
  }
};

const fetchUserRoles = async (userId: string, { setRoles, fetchingRoles }: UserDataSetters) => {
  // Prevent duplicate calls
  if (fetchingRoles.current) return;
  fetchingRoles.current = true;

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return;
    }

    setRoles(data || []);
  } catch {
    // Roles fetch failed
  } finally {
    fetchingRoles.current = false;
  }
};
