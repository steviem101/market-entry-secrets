
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export const useAIChat = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCallback(async (title?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('ai_chat_conversations')
        .insert({
          title: title || 'New Conversation',
          user_id: user?.id || null
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentConversation(data);
      setMessages([]);
      return data;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, conversationId?: string) => {
    try {
      setLoading(true);
      setError(null);

      let conversation = currentConversation;
      
      // Create a new conversation if none exists
      if (!conversation && !conversationId) {
        conversation = await createConversation();
        if (!conversation) return;
      }

      const targetConversationId = conversationId || conversation?.id;
      if (!targetConversationId) {
        throw new Error('No conversation available');
      }

      // Add user message
      const { data: userMessage, error: userError } = await supabase
        .from('ai_chat_messages')
        .insert({
          conversation_id: targetConversationId,
          role: 'user',
          content: content
        })
        .select()
        .single();

      if (userError) throw userError;

      setMessages(prev => [...prev, userMessage]);

      // TODO: This is where you'll integrate your custom GPT
      // For now, we'll add a placeholder assistant response
      const assistantResponse = "I'm ready to help! (Connect your custom GPT here)";
      
      const { data: assistantMessage, error: assistantError } = await supabase
        .from('ai_chat_messages')
        .insert({
          conversation_id: targetConversationId,
          role: 'assistant',
          content: assistantResponse,
          metadata: { isPlaceholder: true }
        })
        .select()
        .single();

      if (assistantError) throw assistantError;

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [currentConversation, createConversation]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Load conversation details
      const { data: conversation, error: convError } = await supabase
        .from('ai_chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      // Load messages
      const { data: messages, error: messagesError } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setCurrentConversation(conversation);
      setMessages(messages || []);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('ai_chat_conversations')
        .select('*')
        .eq('user_id', user?.id || null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    }
  }, []);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    createConversation,
    sendMessage,
    loadConversation,
    loadConversations,
    setCurrentConversation,
    setMessages,
    setError
  };
};
