-- Remove redundant duplicate SELECT policy on match_elo_history
-- "Anyone can view elo history" already covers all users, so "Users can view their own elo history" is redundant
DROP POLICY IF EXISTS "Users can view their own elo history" ON public.match_elo_history;