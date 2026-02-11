
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from './types';
import { fetchUserData } from './userDataService';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  
  // Add refs to prevent duplicate API calls
  const fetchingProfile = useRef(false);
  const fetchingRoles = useRef(false);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    // Get initial session and wait for profile/roles before clearing loading
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user && session.user.id !== currentUserId.current) {
        currentUserId.current = session.user.id;
        await fetchUserData(session.user.id, {
          setProfile,
          setRoles,
          fetchingProfile,
          fetchingRoles
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && session.user.id !== currentUserId.current) {
          currentUserId.current = session.user.id;
          // Defer to avoid Supabase auth callback deadlock, but await the result
          setTimeout(async () => {
            await fetchUserData(session.user.id, {
              setProfile,
              setRoles,
              fetchingProfile,
              fetchingRoles
            });
            setLoading(false);
          }, 0);
          return; // Don't set loading false yet — setTimeout will do it after fetch
        } else if (!session) {
          currentUserId.current = null;
          setProfile(null);
          setRoles([]);
          fetchingProfile.current = false;
          fetchingRoles.current = false;
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    profile,
    roles,
    session,
    loading,
    setProfile,
    setLoading
  };
};
