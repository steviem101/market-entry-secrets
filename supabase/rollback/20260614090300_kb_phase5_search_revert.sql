-- Revert Phase 5: drop the search RPC.
drop function if exists public.match_knowledge(vector,text,int,float,jsonb,text[]);

-- The edge function itself is undeployed out-of-band:
--   supabase functions delete knowledge-search
