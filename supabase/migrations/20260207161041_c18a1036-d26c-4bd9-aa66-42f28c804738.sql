-- Allow anyone to view public profiles (needed for the /player/:id public page)
CREATE POLICY "Public profiles are viewable by anyone"
ON public.profiles
FOR SELECT
USING (public_profile = true);
