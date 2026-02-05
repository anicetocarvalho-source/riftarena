-- Replace the authenticated-only policy with a public one that has proper field validation
-- This keeps the form accessible to unauthenticated users while addressing the linter warning
DROP POLICY IF EXISTS "Authenticated users can submit partnership inquiries" ON public.partnership_inquiries;

CREATE POLICY "Anyone can submit partnership inquiries with valid data"
ON public.partnership_inquiries
FOR INSERT
WITH CHECK (
  length(trim(company_name)) >= 2
  AND length(trim(contact_name)) >= 2
  AND length(trim(email)) >= 5
  AND length(trim(message)) >= 20
);