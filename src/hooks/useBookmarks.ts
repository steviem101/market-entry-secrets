
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Bookmark {
  id: string;
  content_type: string;
  content_id: string;
  content_title: string;
  content_description: string | null;
  content_metadata: Record<string, any> | null;
  created_at: string;
}

const BOOKMARKS_KEY = ['bookmarks'];

export const useBookmarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookmarks = [], isLoading: loading, refetch } = useQuery({
    queryKey: BOOKMARKS_KEY,
    queryFn: async (): Promise<Bookmark[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        content_type: item.content_type as Bookmark['content_type'],
      })) as Bookmark[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: async (params: {
      contentType: string;
      contentId: string;
      title: string;
      description?: string;
      metadata?: Record<string, any>;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          content_type: params.contentType,
          content_id: params.contentId,
          content_title: params.title,
          content_description: params.description || null,
          content_metadata: params.metadata || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast({ title: "Already bookmarked", description: "This item is already in your bookmarks" });
          return false;
        }
        throw error;
      }
      return true;
    },
    onSuccess: (added, params) => {
      if (added) {
        toast({ title: "Bookmarked!", description: `${params.title} has been added to your bookmarks` });
      }
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_KEY });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add bookmark", variant: "destructive" });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (params: { contentType: string; contentId: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('content_type', params.contentType)
        .eq('content_id', params.contentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Removed", description: "Bookmark has been removed" });
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_KEY });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove bookmark", variant: "destructive" });
    },
  });

  const addBookmark = useCallback(async (
    contentType: string,
    contentId: string,
    title: string,
    description?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please log in to bookmark items", variant: "destructive" });
      return false;
    }
    try {
      const result = await addMutation.mutateAsync({ contentType, contentId, title, description, metadata });
      return result;
    } catch {
      return false;
    }
  }, [user, toast, addMutation]);

  const removeBookmark = useCallback(async (contentType: string, contentId: string) => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please log in to manage bookmarks", variant: "destructive" });
      return false;
    }
    try {
      await removeMutation.mutateAsync({ contentType, contentId });
      return true;
    } catch {
      return false;
    }
  }, [user, toast, removeMutation]);

  const isBookmarked = useCallback((contentType: string, contentId: string) => {
    return bookmarks.some(b => b.content_type === contentType && b.content_id === contentId);
  }, [bookmarks]);

  return {
    bookmarks,
    loading,
    fetchBookmarks: refetch,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
};
