

# Upgrade Your Account to Growth Tier

## What will change

1. **Update your subscription** in the `user_subscriptions` table from `free` to `growth`
2. **Update the report's generation tier** from `free` to `growth` so the gated sections (SWOT Analysis, Mentor Recommendations) become visible on the report you're currently viewing

## SQL to execute

```text
-- 1. Upgrade subscription tier
UPDATE user_subscriptions
SET tier = 'growth', updated_at = now()
WHERE user_id = 'db079fd9-c221-4411-bd82-a9868974b1b4';

-- 2. Update the report's tier so gated sections unlock
UPDATE user_reports
SET tier_at_generation = 'growth', updated_at = now()
WHERE id = '2bfe9ed5-0460-4e25-b02d-9dc0e8229360';
```

## Result
- Your account will show as Growth tier
- The report page will unlock the SWOT Analysis and Mentor Recommendations sections (currently showing the lock/upgrade overlay)
- Lead List will still be gated (requires Scale tier)

