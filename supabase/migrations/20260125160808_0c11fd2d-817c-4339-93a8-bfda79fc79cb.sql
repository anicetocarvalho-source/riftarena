-- Create tournament status enum
CREATE TYPE public.tournament_status AS ENUM ('draft', 'registration', 'live', 'completed', 'cancelled');

-- Create match status enum
CREATE TYPE public.match_status AS ENUM ('pending', 'in_progress', 'completed', 'disputed');

-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default games
INSERT INTO public.games (name, icon, description) VALUES
  ('Free Fire', '🔥', 'Battle Royale mobile game'),
  ('PUBG Mobile', '🎯', 'PlayerUnknown''s Battlegrounds Mobile'),
  ('Call of Duty Mobile', '💀', 'COD Mobile FPS');

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  game_id UUID NOT NULL REFERENCES public.games(id),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id),
  sponsor_id UUID REFERENCES public.profiles(id),
  status tournament_status NOT NULL DEFAULT 'draft',
  prize_pool DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_participants INTEGER NOT NULL DEFAULT 64,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  registration_deadline TIMESTAMPTZ,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  rules TEXT,
  bracket_type TEXT NOT NULL DEFAULT 'single_elimination',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tournament registrations table
CREATE TABLE public.tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  seed INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Create tournament matches table
CREATE TABLE public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  participant1_id UUID REFERENCES public.profiles(id),
  participant2_id UUID REFERENCES public.profiles(id),
  winner_id UUID REFERENCES public.profiles(id),
  participant1_score INTEGER,
  participant2_score INTEGER,
  status match_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, round, match_number)
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

-- Games policies (public read)
CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Admins can manage games" ON public.games FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Tournaments policies
CREATE POLICY "Anyone can view non-draft tournaments" ON public.tournaments 
  FOR SELECT USING (status != 'draft' OR organizer_id = auth.uid());

CREATE POLICY "Organizers can create tournaments" ON public.tournaments 
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'organizer') AND organizer_id = auth.uid());

CREATE POLICY "Organizers can update own tournaments" ON public.tournaments 
  FOR UPDATE USING (organizer_id = auth.uid());

CREATE POLICY "Admins can manage all tournaments" ON public.tournaments 
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Registrations policies
CREATE POLICY "Anyone can view registrations" ON public.tournament_registrations 
  FOR SELECT USING (true);

CREATE POLICY "Users can register for tournaments" ON public.tournament_registrations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own registration" ON public.tournament_registrations 
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Organizers can manage registrations" ON public.tournament_registrations 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
  );

-- Matches policies
CREATE POLICY "Anyone can view matches" ON public.tournament_matches FOR SELECT USING (true);

CREATE POLICY "Organizers can manage matches" ON public.tournament_matches 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
  );

CREATE POLICY "Admins can manage all matches" ON public.tournament_matches 
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_tournaments_organizer ON public.tournaments(organizer_id);
CREATE INDEX idx_tournaments_game ON public.tournaments(game_id);
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_registrations_tournament ON public.tournament_registrations(tournament_id);
CREATE INDEX idx_registrations_user ON public.tournament_registrations(user_id);
CREATE INDEX idx_matches_tournament ON public.tournament_matches(tournament_id);

-- Triggers for updated_at
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.tournament_matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();