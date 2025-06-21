
import { useState, useEffect, useCallback } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Generate session ID once and persist it
  const [sessionId] = useState(() => {
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

  // Initialize view count from localStorage
  useEffect(() => {
    if (!user) {
      const storedCount = localStorage.getItem('view_count');
      const count = storedCount ? parseInt(storedCount, 10) : 0;
      // Validate the stored count by checking viewed items
      const viewedItems = Object.keys(localStorage).filter(key => key.startsWith('viewed_')).length;
      const actualCount = Math.min(count, viewedItems); // Use the smaller of the two for safety
      setViewCount(actualCount);
    } else {
      // User is signed in, reset to unlimited
      setViewCount(0);
    }
    setIsInitialized(true);
  }, [user]);

  const trackView = useCallback(async (contentType: string, itemId: string) => {
    // Don't track if user is signed in or not initialized yet
    if (user || !isInitialized) return;

    // Check if already viewed this item
    const viewKey = `viewed_${contentType}_${itemId}`;
    if (localStorage.getItem(viewKey)) return;

    // Don't track if already at limit
    if (viewCount >= FREE_TIER_LIMIT) return;

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
  }, [user, isInitialized, viewCount, sessionId]);

  const resetUsage = useCallback(() => {
    // Clear all tracking data (used when user signs up)
    setViewCount(0);
    localStorage.removeItem('view_count');
    // Clear individual item tracking
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('viewed_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  return {
    viewCount,
    canView,
    hasReachedLimit,
    remainingViews,
    trackView,
    resetUsage,
  };
};
