
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user && session.user.id !== currentUserId.current) {
        currentUserId.current = session.user.id;
        // Use setTimeout to avoid blocking the auth state update
        setTimeout(() => {
          fetchUserData(session.user.id, {
            setProfile,
            setRoles,
            fetchingProfile,
            fetchingRoles
          });
        }, 0);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && session.user.id !== currentUserId.current) {
          currentUserId.current = session.user.id;
          // Use setTimeout to defer Supabase calls and prevent deadlocks
          setTimeout(() => {
            fetchUserData(session.user.id, {
              setProfile,
              setRoles,
              fetchingProfile,
              fetchingRoles
            });
          }, 0);
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
