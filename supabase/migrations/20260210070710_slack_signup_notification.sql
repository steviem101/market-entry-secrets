-- Migration: Slack notification on new user signup
--
-- This creates a pg_net based trigger that posts directly to Slack
-- when a new profile row is created (i.e. a user signs up).
--
-- PREREQUISITE: Set the Slack webhook URL as a database config parameter:
--   ALTER DATABASE postgres SET app.settings.slack_webhook_url = 'https://hooks.slack.com/services/T.../B.../xxx';
--
-- Alternatively, you can skip this migration entirely and configure
-- a Database Webhook in the Supabase Dashboard instead:
--   Dashboard → Database → Webhooks → Create
--   Table: public.profiles | Event: INSERT | Function: notify-slack
-- ──────────────────────────────────────────────────────────────────

-- Enable pg_net extension for async HTTP calls from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function: post a Slack message when a new profile is created
CREATE OR REPLACE FUNCTION public.notify_slack_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  slack_url text;
  user_name text;
  payload jsonb;
BEGIN
  -- Read the Slack webhook URL from database settings
  slack_url := current_setting('app.settings.slack_webhook_url', true);

  IF slack_url IS NULL OR slack_url = '' THEN
    -- No Slack URL configured — silently skip
    RETURN NEW;
  END IF;

  -- Build a display name from profile fields
  user_name := COALESCE(NULLIF(TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '')), ''), 'Unknown');

  -- Build a simple Slack message payload
  payload := jsonb_build_object(
    'text', format('New user signed up: *%s* (ID: `%s`)', user_name, NEW.id),
    'blocks', jsonb_build_array(
      jsonb_build_object(
        'type', 'header',
        'text', jsonb_build_object('type', 'plain_text', 'text', 'New User Signed Up')
      ),
      jsonb_build_object(
        'type', 'section',
        'fields', jsonb_build_array(
          jsonb_build_object('type', 'mrkdwn', 'text', format('*Name:*\n%s', user_name)),
          jsonb_build_object('type', 'mrkdwn', 'text', format('*User ID:*\n`%s`', NEW.id))
        )
      ),
      jsonb_build_object(
        'type', 'context',
        'elements', jsonb_build_array(
          jsonb_build_object('type', 'mrkdwn', 'text', 'Market Entry Secrets | Signup via pg_net')
        )
      )
    )
  );

  -- Fire-and-forget HTTP POST via pg_net (async, non-blocking)
  PERFORM net.http_post(
    url    := slack_url,
    body   := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$;

-- Attach trigger to profiles table (fires after handle_new_user inserts the row)
DROP TRIGGER IF EXISTS notify_slack_on_new_profile ON public.profiles;
CREATE TRIGGER notify_slack_on_new_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_slack_on_signup();
