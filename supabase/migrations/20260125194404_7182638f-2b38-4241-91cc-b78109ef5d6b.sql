-- Create storage bucket for team logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-logos', 'team-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view team logos (public bucket)
CREATE POLICY "Team logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'team-logos');

-- Only team captains can upload their team's logo
CREATE POLICY "Captains can upload team logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'team-logos' 
  AND EXISTS (
    SELECT 1 FROM public.teams 
    WHERE teams.id::text = (storage.foldername(name))[1]
    AND teams.captain_id = auth.uid()
  )
);

-- Only team captains can update their team's logo
CREATE POLICY "Captains can update team logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'team-logos' 
  AND EXISTS (
    SELECT 1 FROM public.teams 
    WHERE teams.id::text = (storage.foldername(name))[1]
    AND teams.captain_id = auth.uid()
  )
);

-- Only team captains can delete their team's logo
CREATE POLICY "Captains can delete team logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'team-logos' 
  AND EXISTS (
    SELECT 1 FROM public.teams 
    WHERE teams.id::text = (storage.foldername(name))[1]
    AND teams.captain_id = auth.uid()
  )
);