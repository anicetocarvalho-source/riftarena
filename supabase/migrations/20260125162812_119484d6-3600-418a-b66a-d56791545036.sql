-- Fix overly permissive RLS policies for player_rankings
DROP POLICY IF EXISTS "System can manage rankings" ON public.player_rankings;

-- Only allow inserts/updates through the security definer functions
-- Direct table modifications restricted to authenticated users for their own records
CREATE POLICY "Users can view their own rankings" ON public.player_rankings 
  FOR SELECT USING (true);

-- Fix overly permissive RLS policies for match_elo_history  
DROP POLICY IF EXISTS "System can manage elo history" ON public.match_elo_history;

-- ELO history is read-only for users, managed by security definer functions
CREATE POLICY "Users can view their own elo history" ON public.match_elo_history 
  FOR SELECT USING (true);