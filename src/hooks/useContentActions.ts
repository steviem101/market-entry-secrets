import { useState, useCallback } from "react";

const SAVED_STORIES_KEY = "mes_saved_stories";

const getSavedStories = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_STORIES_KEY) || "[]");
  } catch {
    return [];
  }
};

export const useContentActions = (contentId: string | undefined) => {
  const [savedStories, setSavedStories] = useState<string[]>(getSavedStories);
  const [copied, setCopied] = useState(false);

  const isSaved = contentId ? savedStories.includes(contentId) : false;

  const toggleSave = useCallback(() => {
    if (!contentId) return;

    setSavedStories(prev => {
      const next = prev.includes(contentId)
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId];
      localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(next));
      return next;
    });
  }, [contentId]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  }, []);

  return { savedStories, isSaved, toggleSave, handleShare, copied };
};
