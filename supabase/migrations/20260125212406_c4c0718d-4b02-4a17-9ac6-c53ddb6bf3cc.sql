-- Add social link columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN discord_username TEXT,
ADD COLUMN twitter_username TEXT,
ADD COLUMN twitch_username TEXT;