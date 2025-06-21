
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const FREE_TIER_LIMIT = 3;

interface UsageTrackingHook {
  viewCount: number;
  canView: boolean;
  hasReachedLimit: boolean;
  remainingViews: number;
  trackView: (contentType: string, itemId: string) => Promise<void>;
  resetUsage: () => void;
}

export const useUsageTracking = (): UsageTrackingHook => {
  const { user } = useAuth();
  const [viewCount, setViewCount] = useState(0);
  const [sessionId] = useState(() => {
    // Generate or get existing session ID for anonymous users
    const existing = localStorage.getItem('session_id');
    if (existing) return existing;
    const newId = crypto.randomUUID();
    localStorage.setItem('session_id', newId);
    return newId;
  });

  // If user is signed in, they have unlimited views
  const canView = user ? true : viewCount < FREE_TIER_LIMIT;
  const hasReachedLimit = !user && viewCount >= FREE_TIER_LIMIT;
  const remainingViews = user ? Infinity : Math.max(0, FREE_TIER_LIMIT - viewCount);

  useEffect(() => {
    // Load existing view count for anonymous users
    if (!user) {
      const storedCount = localStorage.getItem('view_count');
      if (storedCount) {
        setViewCount(parseInt(storedCount, 10));
      }
    } else {
      // User is signed in, reset to unlimited
      setViewCount(0);
      localStorage.removeItem('view_count');
    }
  }, [user]);

  const trackView = async (contentType: string, itemId: string) => {
    // Don't track if user is signed in
    if (user) return;

    // Check if already viewed this item
    const viewKey = `viewed_${contentType}_${itemId}`;
    if (localStorage.getItem(viewKey)) return;

    try {
      // Track in database
      await supabase
        .from('user_usage')
        .insert({
          session_id: sessionId,
          content_type: contentType,
          item_id: itemId,
        });

      // Track locally
      localStorage.setItem(viewKey, 'true');
      const newCount = viewCount + 1;
      setViewCount(newCount);
      localStorage.setItem('view_count', newCount.toString());
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  const resetUsage = () => {
    // Clear all tracking data (used when user signs up)
    setViewCount(0);
    localStorage.removeItem('view_count');
    // Clear individual item tracking
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('viewed_')) {
        localStorage.removeItem(key);
      }
    });
  };

  return {
    viewCount,
    canView,
    hasReachedLimit,
    remainingViews,
    trackView,
    resetUsage,
  };
};
