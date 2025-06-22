
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from './types';

interface UserDataSetters {
  setProfile: (profile: UserProfile | null) => void;
  setRoles: (roles: UserRole[]) => void;
  fetchingProfile: React.MutableRefObject<boolean>;
  fetchingRoles: React.MutableRefObject<boolean>;
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
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
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
      console.error('Error fetching roles:', error);
      return;
    }

    setRoles(data || []);
  } catch (error) {
    console.error('Error fetching roles:', error);
  } finally {
    fetchingRoles.current = false;
  }
};
