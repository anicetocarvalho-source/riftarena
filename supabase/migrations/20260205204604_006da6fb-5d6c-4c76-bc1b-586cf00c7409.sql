-- Replace the overly permissive INSERT policy on partnership_inquiries
-- with one that requires authentication, preventing anonymous spam
DROP POLICY IF EXISTS "Anyone can submit partnership inquiries" ON public.partnership_inquiries;

CREATE POLICY "Authenticated users can submit partnership inquiries"
ON public.partnership_inquiries
FOR INSERT
TO authenticated
WITH CHECK (true);