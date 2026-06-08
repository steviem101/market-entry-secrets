-- Workstream B1: anonymous chat conversations were visible to ALL anons because policies
-- included "user_id IS NULL" without further scoping. Add session_id, scope anon visibility
-- via the request-supplied x-session-id header.
--
-- Defensive: guarded so preview branches missing the chat tables don't fail.

-- current_chat_session_id helper is independent of the chat tables; create unconditionally.
CREATE OR REPLACE FUNCTION public.current_chat_session_id() RETURNS text
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT NULLIF(
    COALESCE(
      current_setting('request.headers', true)::json->>'x-session-id',
      ''
    ),
    ''
  );
$$;

DO $$ BEGIN IF to_regclass('public.ai_chat_conversations') IS NOT NULL THEN
  ALTER TABLE public.ai_chat_conversations ADD COLUMN IF NOT EXISTS session_id text;
  CREATE INDEX IF NOT EXISTS ai_chat_conversations_session_id_idx
    ON public.ai_chat_conversations(session_id) WHERE session_id IS NOT NULL;

  DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_chat_conversations;
  DROP POLICY IF EXISTS "Users can create conversations" ON public.ai_chat_conversations;
  DROP POLICY IF EXISTS "Users can update their own conversations" ON public.ai_chat_conversations;
  DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.ai_chat_conversations;

  CREATE POLICY "Users can view their own conversations" ON public.ai_chat_conversations
    FOR SELECT USING (
      auth.uid() = user_id
      OR (user_id IS NULL AND session_id IS NOT NULL AND session_id = public.current_chat_session_id())
    );
  CREATE POLICY "Users can create conversations" ON public.ai_chat_conversations
    FOR INSERT WITH CHECK (
      auth.uid() = user_id
      OR (user_id IS NULL AND session_id IS NOT NULL AND session_id = public.current_chat_session_id())
    );
  CREATE POLICY "Users can update their own conversations" ON public.ai_chat_conversations
    FOR UPDATE USING (
      auth.uid() = user_id
      OR (user_id IS NULL AND session_id IS NOT NULL AND session_id = public.current_chat_session_id())
    );
  CREATE POLICY "Users can delete their own conversations" ON public.ai_chat_conversations
    FOR DELETE USING (
      auth.uid() = user_id
      OR (user_id IS NULL AND session_id IS NOT NULL AND session_id = public.current_chat_session_id())
    );
END IF; END $$;

DO $$ BEGIN IF to_regclass('public.ai_chat_messages') IS NOT NULL
   AND to_regclass('public.ai_chat_conversations') IS NOT NULL THEN
  DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.ai_chat_messages;
  DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.ai_chat_messages;

  CREATE POLICY "Users can view messages from their conversations" ON public.ai_chat_messages
    FOR SELECT USING (
      conversation_id IN (
        SELECT id FROM public.ai_chat_conversations
        WHERE auth.uid() = user_id
           OR (user_id IS NULL AND session_id IS NOT NULL AND session_id = public.current_chat_session_id())
      )
    );
  CREATE POLICY "Users can create messages in their conversations" ON public.ai_chat_messages
    FOR INSERT WITH CHECK (
      conversation_id IN (
        SELECT id FROM public.ai_chat_conversations
        WHERE auth.uid() = user_id
           OR (user_id IS NULL AND session_id IS NOT NULL AND session_id = public.current_chat_session_id())
      )
    );
END IF; END $$;
