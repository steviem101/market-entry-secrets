
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildCorsHeaders } from "../_shared/http.ts";

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { conversationId, message } = await req.json();

    // Validate inputs
    if (!conversationId || typeof conversationId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid conversationId', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (message.length > 10000) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 10000 characters)', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the conversation belongs to this user
    const { data: conversation, error: convError } = await supabaseClient
      .from('ai_chat_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get conversation context (last few messages)
    const { data: messages, error: messagesError } = await supabaseClient
      .from('ai_chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (messagesError) {
      throw new Error(`Failed to fetch messages: ${messagesError.message}`);
    }

    // Store the user's message in the database
    const { error: userMsgError } = await supabaseClient
      .from('ai_chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });

    if (userMsgError) {
      throw new Error(`Failed to store user message: ${userMsgError.message}`);
    }

    // TODO: Replace this with a real AI integration
    const aiResponse = `Thanks for your message. The AI chat feature is currently under development and not yet connected to a live model. Your message has been recorded and we'll notify you when this feature is fully available.`;

    // Store the AI response in the database
    const { data: responseMessage, error: insertError } = await supabaseClient
      .from('ai_chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: {
          source: 'placeholder',
          is_placeholder: true,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to store response: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        message: responseMessage,
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({
        error: 'An internal error occurred. Please try again.',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
