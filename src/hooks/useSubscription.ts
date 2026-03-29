
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

// Map database tiers to our new tier structure
const mapDatabaseTier = (dbTier: DatabaseSubscriptionTier): SubscriptionTier => {
  switch (dbTier) {
    case 'free':
      return 'free';
    case 'premium':
    case 'growth':
      return 'growth';
    case 'scale':
      return 'scale';
    case 'enterprise':
    case 'concierge':
      return 'enterprise';
    default:
      return 'free';
  }
};

const fetchSubscriptionData = async (userId: string): Promise<UserSubscription | null> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    tier: mapDatabaseTier(data.tier),
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription = null, isLoading: loading } = useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: () => fetchSubscriptionData(user!.id),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // refetch that returns the tier — used by ReportView for Stripe polling
  const refetch = useCallback(async (): Promise<SubscriptionTier> => {
    if (!user) return 'free';
    try {
      const fresh = await fetchSubscriptionData(user.id);
      queryClient.setQueryData(['user-subscription', user.id], fresh);
      return fresh?.tier ?? 'free';
    } catch {
      return 'free';
    }
  }, [user, queryClient]);

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

    if (currentTierIndex === -1 || requiredTierIndex === -1) return false;

    return currentTierIndex >= requiredTierIndex;
  };

  return {
    subscription,
    loading,
    isPremium,
    isScale,
    isEnterprise,
    canAccessFeature,
    refetch,
  };
};
