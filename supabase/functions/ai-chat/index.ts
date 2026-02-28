
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { buildCorsHeaders } from "../_shared/http.ts";

serve(async (req) => {
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

    // TODO: Replace this with your custom GPT integration
    // This is a placeholder response
    const aiResponse = `Thank you for your message: "${message}".

I'm an AI assistant specialized in Australian market entry. I can help you with:
- Business registration and compliance
- Finding the right service providers
- Understanding local market dynamics
- Connecting with mentors and advisors

Your custom GPT integration will replace this placeholder response.

Previous messages in this conversation: ${messages?.length || 0}`;

    // Store the AI response in the database
    const { data: responseMessage, error: insertError } = await supabaseClient
      .from('ai_chat_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: {
          source: 'placeholder',
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
        error: error instanceof Error ? error.message : String(error),
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
