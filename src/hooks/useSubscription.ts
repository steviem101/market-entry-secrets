
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

// Database type mapping - extended to handle potential future tiers
type DatabaseSubscriptionTier = 'free' | 'premium' | 'scale' | 'concierge';

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
    case 'scale':
      return 'scale';
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
        } else if (data) {
          // Map the database subscription to our new type structure
          const mappedSubscription: UserSubscription = {
            id: data.id,
            user_id: data.user_id,
            tier: mapDatabaseTier(data.tier),
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
          setSubscription(mappedSubscription);
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
  };
};
