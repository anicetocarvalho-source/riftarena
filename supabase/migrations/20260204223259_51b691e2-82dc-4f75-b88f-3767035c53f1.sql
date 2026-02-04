-- Add prize distribution column to tournaments table
-- Stores distribution as JSONB with structure: { "first": number, "second": number, "third": number }
ALTER TABLE public.tournaments 
ADD COLUMN prize_distribution jsonb DEFAULT '{"first": 50, "second": 30, "third": 20}'::jsonb;