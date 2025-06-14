
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Bookmark {
  id: string;
  content_type: 'event' | 'community_member' | 'content';
  content_id: string;
  content_title: string;
  content_description: string | null;
  content_metadata: Record<string, any> | null;
  created_at: string;
}

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to handle the database response
      const typedBookmarks = (data || []).map(item => ({
        ...item,
        content_type: item.content_type as 'event' | 'community_member' | 'content'
      })) as Bookmark[];
      
      setBookmarks(typedBookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast({
        title: "Error",
        description: "Failed to load bookmarks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addBookmark = useCallback(async (
    contentType: 'event' | 'community_member' | 'content',
    contentId: string,
    title: string,
    description?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to bookmark items",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          content_title: title,
          content_description: description || null,
          content_metadata: metadata || null,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already bookmarked",
            description: "This item is already in your bookmarks",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Bookmarked!",
        description: `${title} has been added to your bookmarks`,
      });
      
      fetchBookmarks(); // Refresh bookmarks
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to add bookmark",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchBookmarks]);

  const removeBookmark = useCallback(async (contentType: string, contentId: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      if (error) throw error;

      toast({
        title: "Removed",
        description: "Bookmark has been removed",
      });
      
      fetchBookmarks(); // Refresh bookmarks
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchBookmarks]);

  const isBookmarked = useCallback((contentType: string, contentId: string) => {
    return bookmarks.some(b => b.content_type === contentType && b.content_id === contentId);
  }, [bookmarks]);

  return {
    bookmarks,
    loading,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
  };
};
