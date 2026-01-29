-- Drop the existing organizer update policy for tournaments
DROP POLICY IF EXISTS "Organizers can update own tournaments" ON public.tournaments;

-- Create a proper organizer update policy with both USING and WITH CHECK clauses
CREATE POLICY "Organizers can update own tournaments" 
ON public.tournaments 
FOR UPDATE 
TO authenticated
USING (organizer_id = auth.uid())
WITH CHECK (organizer_id = auth.uid());