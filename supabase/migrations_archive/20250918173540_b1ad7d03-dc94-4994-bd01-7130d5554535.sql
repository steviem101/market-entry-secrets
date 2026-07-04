-- Add all three new values to subscription_tier enum
ALTER TYPE subscription_tier ADD VALUE 'growth';
ALTER TYPE subscription_tier ADD VALUE 'scale';
ALTER TYPE subscription_tier ADD VALUE 'enterprise';