
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SubscriptionTier = 'free' | 'growth' | 'scale' | 'enterprise';

interface UserSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const isPremium = () => {
    return subscription?.tier === 'growth' || subscription?.tier === 'scale' || subscription?.tier === 'enterprise';
  };

  const isScale = () => {
    return subscription?.tier === 'scale' || subscription?.tier === 'enterprise';
  };

  const isEnterprise = () => {
    return subscription?.tier === 'enterprise';
  };

  return {
    subscription,
    loading,
    isPremium,
    isScale,
    isEnterprise,
  };
};
