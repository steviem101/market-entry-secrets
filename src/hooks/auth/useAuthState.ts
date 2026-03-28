
import { useState, useEffect, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from './types';
import { fetchUserData } from './userDataService';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoadingState] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const setProfile = useCallback((p: UserProfile | null) => setProfileState(p), []);
  const setLoading = useCallback((l: boolean) => setLoadingState(l), []);
  
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
    let cancelled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (cancelled) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && session.user.id !== currentUserId.current) {
          currentUserId.current = session.user.id;
          // Defer to avoid Supabase auth callback deadlock.
          // Use a microtask so the fetch runs after the callback returns,
          // but check `cancelled` to avoid acting on stale events.
          const userId = session.user.id;
          queueMicrotask(async () => {
            if (cancelled || currentUserId.current !== userId) return;
            await fetchUserData(userId, {
              setProfile,
              setRoles,
              fetchingProfile,
              fetchingRoles
            });
            if (!cancelled) setLoading(false);
          });
          return; // Don't set loading false yet — microtask will do it after fetch
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

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
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
