
-- Add notification and privacy preference columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS match_reminders boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS team_invites_notifications boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS public_profile boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS show_stats boolean NOT NULL DEFAULT true;
