-- Remove duplicate RLS policy on player_rankings
-- "Users can view their own rankings" is redundant since "Anyone can view rankings" already uses true
DROP POLICY IF EXISTS "Users can view their own rankings" ON public.player_rankings;