-- 1. Upgrade subscription to enterprise
UPDATE user_subscriptions
SET tier = 'enterprise', updated_at = now()
WHERE user_id = 'db079fd9-c221-4411-bd82-a9868974b1b4';

-- 2. Update the report's tier so ALL sections unlock
UPDATE user_reports
SET tier_at_generation = 'enterprise', updated_at = now()
WHERE id = '2bfe9ed5-0460-4e25-b02d-9dc0e8229360';