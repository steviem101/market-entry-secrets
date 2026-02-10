
import { useState, useEffect, useCallback } from 'react';
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

// Database type mapping - extended to handle potential future tiers
type DatabaseSubscriptionTier = 'free' | 'premium' | 'concierge' | 'growth' | 'scale' | 'enterprise';

interface DatabaseUserSubscription {
  id: string;
  user_id: string;
  tier: DatabaseSubscriptionTier;
  created_at: string;
  updated_at: string;
}

// Map database tiers to our new tier structure
const mapDatabaseTier = (dbTier: DatabaseSubscriptionTier): SubscriptionTier => {
  switch (dbTier) {
    case 'free':
      return 'free';
    case 'premium':
      return 'growth';
    case 'growth':
      return 'growth';
    case 'scale':
      return 'scale';
    case 'enterprise':
      return 'enterprise';
    case 'concierge':
      return 'enterprise';
    default:
      console.warn(`Unknown database tier: ${dbTier}, defaulting to free`);
      return 'free';
  }
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async (): Promise<SubscriptionTier> => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return 'free';
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      } else if (data) {
        const mappedTier = mapDatabaseTier(data.tier);
        const mappedSubscription: UserSubscription = {
          id: data.id,
          user_id: data.user_id,
          tier: mappedTier,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        setSubscription(mappedSubscription);
        return mappedTier;
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
    return 'free';
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isPremium = () => {
    return subscription?.tier === 'growth' || subscription?.tier === 'scale' || subscription?.tier === 'enterprise';
  };

  const isScale = () => {
    return subscription?.tier === 'scale' || subscription?.tier === 'enterprise';
  };

  const isEnterprise = () => {
    return subscription?.tier === 'enterprise';
  };

  const canAccessFeature = (feature: 'basic' | 'premium' | 'scale' | 'enterprise') => {
    if (!subscription) return feature === 'basic';
    
    const tierHierarchy = ['free', 'growth', 'scale', 'enterprise'];
    const currentTierIndex = tierHierarchy.indexOf(subscription.tier);
    const requiredTierIndex = tierHierarchy.indexOf(feature === 'basic' ? 'free' : feature);
    
    return currentTierIndex >= requiredTierIndex;
  };

  return {
    subscription,
    loading,
    isPremium,
    isScale,
    isEnterprise,
    canAccessFeature,
    refetch: fetchSubscription,
  };
};
