
import { useState, useEffect, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from './types';
import { fetchUserData } from './userDataService';
import { trackFunnelEvent } from '@/lib/analytics/intakeFunnel';

// "Genuine first signup" heuristic: the account was created within the last
// 24 hours. Wide enough to survive a delayed email confirmation, narrow
// enough that established users never trigger the welcome path on login.
const NEW_ACCOUNT_WINDOW_MS = 24 * 60 * 60 * 1000;
const isNewAccount = (createdAt: string | undefined): boolean => {
  if (!createdAt) return false;
  const created = Date.parse(createdAt);
  return Number.isFinite(created) && Date.now() - created < NEW_ACCOUNT_WINDOW_MS;
};

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

            // T5a (MES-191): a real auth session just started (fresh sign-in,
            // signup, or OAuth) — the completion counterpart to signup_started.
            // Gated on SIGNED_IN so a page reload that merely RESTORES an existing
            // session (INITIAL_SESSION / TOKEN_REFRESHED) never re-counts. Deferred
            // into the microtask to avoid the Supabase auth-callback deadlock. No PII.
            if (_event === 'SIGNED_IN') {
              trackFunnelEvent('session_established', { source: 'auth', user_id: userId });
            }

            await fetchUserData(userId, {
              setProfile,
              setRoles,
              fetchingProfile,
              fetchingRoles
            });
            if (!cancelled) setLoading(false);

            // Welcome email: supabase-js v2 emits no SIGNED_UP event, so this
            // has to hang off SIGNED_IN — but only for genuine first signups.
            // Two client-side gates keep it off the every-login hot path:
            //   1. account age < 24h (covers signup→confirm/OAuth delay)
            //   2. per-user localStorage marker (once per browser)
            // The send-email function's idempotency_key = "welcome:{userId}"
            // remains the cross-device guard — a duplicate can never send.
            if (_event === 'SIGNED_IN' && isNewAccount(session.user.created_at)) {
              const sentKey = `mes_welcome_sent_${userId}`;
              let alreadySent = false;
              try {
                alreadySent = !!localStorage.getItem(sentKey);
                if (!alreadySent) localStorage.setItem(sentKey, '1');
              } catch { /* storage unavailable — rely on server idempotency */ }
              if (!alreadySent) {
                supabase.functions.invoke('send-email', {
                  body: {
                    email_type: 'welcome',
                    recipient_email: session.user.email,
                    user_id: session.user.id,
                    // OAuth providers send full_name, not first_name — greet
                    // Google/Azure signups by their first token, not "there".
                    data: {
                      first_name:
                        session.user.user_metadata?.first_name ||
                        session.user.user_metadata?.full_name?.trim().split(/\s+/)[0] ||
                        'there',
                    },
                  },
                }).catch(() => {}); // fire-and-forget
              }
            }
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
