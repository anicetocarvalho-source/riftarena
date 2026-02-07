
-- Fix: Add explicit deny-all policy for vapid_keys (resolves "RLS enabled no policy" warning)
CREATE POLICY "No client access to vapid keys"
ON public.vapid_keys FOR ALL
USING (false)
WITH CHECK (false);

-- Fix: Set search_path on trigger function + include notification data field
CREATE OR REPLACE FUNCTION public.trigger_send_push_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://hukjbusmnrzhwiizhodt.supabase.co/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1a2pidXNtbnJ6aHdpaXpob2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzNTAxNjEsImV4cCI6MjA4NDkyNjE2MX0.yv2Ate46R7P8AjBa97NflLPX7tTWIL_fmkrd_VFEO8g'
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'title', NEW.title,
      'message', NEW.message,
      'type', NEW.type,
      'notification_id', NEW.id,
      'data', COALESCE(NEW.data, '{}'::jsonb)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add UPDATE policy for push_subscriptions (needed for upsert)
CREATE POLICY "Users can update own push subscriptions"
ON public.push_subscriptions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
