-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tag TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  captain_id UUID NOT NULL REFERENCES public.profiles(id),
  max_members INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT teams_tag_unique UNIQUE (tag)
);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team invites table
CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id, status)
);

-- Add team support to tournaments
ALTER TABLE public.tournaments 
ADD COLUMN is_team_based BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN team_size INTEGER DEFAULT 5;

-- Add team reference to tournament registrations
ALTER TABLE public.tournament_registrations
ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
ALTER COLUMN user_id DROP NOT NULL;

-- Add constraint: either user_id or team_id must be set
ALTER TABLE public.tournament_registrations
ADD CONSTRAINT registration_participant_check 
CHECK (
  (user_id IS NOT NULL AND team_id IS NULL) OR 
  (user_id IS NULL AND team_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create teams" ON public.teams 
  FOR INSERT WITH CHECK (auth.uid() = captain_id);

CREATE POLICY "Captains can update their teams" ON public.teams 
  FOR UPDATE USING (auth.uid() = captain_id);

CREATE POLICY "Captains can delete their teams" ON public.teams 
  FOR DELETE USING (auth.uid() = captain_id);

-- Team members policies
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);

CREATE POLICY "Captains can add members" ON public.team_members 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND captain_id = auth.uid())
  );

CREATE POLICY "Captains can remove members" ON public.team_members 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND captain_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Team invites policies
CREATE POLICY "Users can view their invites" ON public.team_invites 
  FOR SELECT USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND captain_id = auth.uid())
  );

CREATE POLICY "Captains can create invites" ON public.team_invites 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND captain_id = auth.uid())
  );

CREATE POLICY "Users can update their invites" ON public.team_invites 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Captains can delete invites" ON public.team_invites 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_id AND captain_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_teams_captain ON public.teams(captain_id);
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
CREATE INDEX idx_team_invites_user ON public.team_invites(user_id);
CREATE INDEX idx_team_invites_team ON public.team_invites(team_id);
CREATE INDEX idx_registrations_team ON public.tournament_registrations(team_id);

-- Triggers
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to add captain as team member on team creation
CREATE OR REPLACE FUNCTION public.add_captain_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.captain_id, 'captain');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER add_captain_on_team_create
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.add_captain_as_member();