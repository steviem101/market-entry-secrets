-- Add stripe_price_id column to lead_databases for individual Stripe checkout
ALTER TABLE public.lead_databases ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- TODO: Populate stripe_price_id values with actual Stripe Price IDs from the Stripe dashboard
-- Example: UPDATE public.lead_databases SET stripe_price_id = 'price_xxx' WHERE slug = 'australian-fintech-decision-makers';
