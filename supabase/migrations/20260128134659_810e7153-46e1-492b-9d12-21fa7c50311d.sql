-- Add RLS policy to allow team captains to register their teams
CREATE POLICY "Team captains can register their teams"
ON public.tournament_registrations
FOR INSERT
WITH CHECK (
  team_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = tournament_registrations.team_id
    AND teams.captain_id = auth.uid()
  )
);

-- Add policy for team captains to cancel their team's registration
CREATE POLICY "Team captains can cancel team registration"
ON public.tournament_registrations
FOR DELETE
USING (
  team_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.teams
    WHERE teams.id = tournament_registrations.team_id
    AND teams.captain_id = auth.uid()
  )
);