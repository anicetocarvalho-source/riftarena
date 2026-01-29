-- Drop the existing admin policy for tournaments
DROP POLICY IF EXISTS "Admins can manage all tournaments" ON public.tournaments;

-- Create a proper admin policy with both USING and WITH CHECK clauses
CREATE POLICY "Admins can manage all tournaments" 
ON public.tournaments 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));