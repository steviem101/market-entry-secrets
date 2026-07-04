
-- Create a table for AI chat conversations
CREATE TABLE public.ai_chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for AI chat messages
CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ai_chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) for conversations
ALTER TABLE public.ai_chat_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.ai_chat_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create conversations" 
  ON public.ai_chat_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own conversations" 
  ON public.ai_chat_conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own conversations" 
  ON public.ai_chat_conversations 
  FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Add Row Level Security (RLS) for messages
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view messages from their conversations" 
  ON public.ai_chat_messages 
  FOR SELECT 
  USING (
    conversation_id IN (
      SELECT id FROM public.ai_chat_conversations 
      WHERE auth.uid() = user_id OR user_id IS NULL
    )
  );

CREATE POLICY "Users can create messages in their conversations" 
  ON public.ai_chat_messages 
  FOR INSERT 
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.ai_chat_conversations 
      WHERE auth.uid() = user_id OR user_id IS NULL
    )
  );

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_ai_chat_conversations_updated_at
  BEFORE UPDATE ON public.ai_chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
