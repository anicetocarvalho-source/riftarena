-- Add banner_url column to tournaments table
ALTER TABLE public.tournaments 
ADD COLUMN banner_url TEXT;

-- Create storage bucket for tournament banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('tournament-banners', 'tournament-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for tournament banners
CREATE POLICY "Tournament banners are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'tournament-banners');

CREATE POLICY "Organizers can upload tournament banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tournament-banners' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Organizers can update their tournament banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tournament-banners' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Organizers can delete their tournament banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tournament-banners' 
  AND auth.uid() IS NOT NULL
);