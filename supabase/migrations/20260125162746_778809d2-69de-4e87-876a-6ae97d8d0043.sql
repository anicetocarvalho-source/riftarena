-- Create player_rankings table for ELO tracking
CREATE TABLE public.player_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  elo_rating INTEGER NOT NULL DEFAULT 1200,
  peak_elo INTEGER NOT NULL DEFAULT 1200,
  matches_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  win_streak INTEGER NOT NULL DEFAULT 0,
  best_win_streak INTEGER NOT NULL DEFAULT 0,
  last_match_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Create match_elo_history table to track ELO changes
CREATE TABLE public.match_elo_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.tournament_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  elo_before INTEGER NOT NULL,
  elo_after INTEGER NOT NULL,
  elo_change INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_elo_history ENABLE ROW LEVEL SECURITY;

-- Rankings policies (public read)
CREATE POLICY "Anyone can view rankings" ON public.player_rankings FOR SELECT USING (true);
CREATE POLICY "System can manage rankings" ON public.player_rankings FOR ALL USING (true);

-- ELO history policies
CREATE POLICY "Anyone can view elo history" ON public.match_elo_history FOR SELECT USING (true);
CREATE POLICY "System can manage elo history" ON public.match_elo_history FOR ALL USING (true);

-- Indexes
CREATE INDEX idx_rankings_user ON public.player_rankings(user_id);
CREATE INDEX idx_rankings_game ON public.player_rankings(game_id);
CREATE INDEX idx_rankings_elo ON public.player_rankings(elo_rating DESC);
CREATE INDEX idx_elo_history_match ON public.match_elo_history(match_id);
CREATE INDEX idx_elo_history_user ON public.match_elo_history(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_rankings_updated_at
  BEFORE UPDATE ON public.player_rankings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to calculate ELO change
CREATE OR REPLACE FUNCTION public.calculate_elo_change(
  winner_elo INTEGER,
  loser_elo INTEGER,
  k_factor INTEGER DEFAULT 32
)
RETURNS INTEGER AS $$
DECLARE
  expected_score NUMERIC;
  elo_change INTEGER;
BEGIN
  -- Calculate expected score for winner
  expected_score := 1.0 / (1.0 + POWER(10, (loser_elo - winner_elo)::NUMERIC / 400));
  
  -- Calculate ELO change (winner gains, loser loses same amount)
  elo_change := ROUND(k_factor * (1 - expected_score));
  
  -- Minimum change of 1, maximum of k_factor
  elo_change := GREATEST(1, LEAST(elo_change, k_factor));
  
  RETURN elo_change;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Function to get or create player ranking
CREATE OR REPLACE FUNCTION public.get_or_create_ranking(
  _user_id UUID,
  _game_id UUID
)
RETURNS public.player_rankings AS $$
DECLARE
  ranking public.player_rankings;
BEGIN
  SELECT * INTO ranking FROM public.player_rankings
  WHERE user_id = _user_id AND game_id = _game_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.player_rankings (user_id, game_id)
    VALUES (_user_id, _game_id)
    RETURNING * INTO ranking;
  END IF;
  
  RETURN ranking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update ELO after match
CREATE OR REPLACE FUNCTION public.update_elo_after_match(
  _match_id UUID,
  _winner_id UUID,
  _loser_id UUID,
  _game_id UUID
)
RETURNS TABLE(winner_change INTEGER, loser_change INTEGER) AS $$
DECLARE
  winner_ranking public.player_rankings;
  loser_ranking public.player_rankings;
  elo_change INTEGER;
  new_winner_elo INTEGER;
  new_loser_elo INTEGER;
BEGIN
  -- Get or create rankings
  winner_ranking := public.get_or_create_ranking(_winner_id, _game_id);
  loser_ranking := public.get_or_create_ranking(_loser_id, _game_id);
  
  -- Calculate ELO change
  elo_change := public.calculate_elo_change(winner_ranking.elo_rating, loser_ranking.elo_rating);
  
  new_winner_elo := winner_ranking.elo_rating + elo_change;
  new_loser_elo := GREATEST(100, loser_ranking.elo_rating - elo_change); -- Minimum 100 ELO
  
  -- Update winner
  UPDATE public.player_rankings SET
    elo_rating = new_winner_elo,
    peak_elo = GREATEST(peak_elo, new_winner_elo),
    matches_played = matches_played + 1,
    wins = wins + 1,
    win_streak = win_streak + 1,
    best_win_streak = GREATEST(best_win_streak, win_streak + 1),
    last_match_at = now(),
    updated_at = now()
  WHERE user_id = _winner_id AND game_id = _game_id;
  
  -- Update loser
  UPDATE public.player_rankings SET
    elo_rating = new_loser_elo,
    matches_played = matches_played + 1,
    losses = losses + 1,
    win_streak = 0,
    last_match_at = now(),
    updated_at = now()
  WHERE user_id = _loser_id AND game_id = _game_id;
  
  -- Record ELO history for winner
  INSERT INTO public.match_elo_history (match_id, user_id, elo_before, elo_after, elo_change)
  VALUES (_match_id, _winner_id, winner_ranking.elo_rating, new_winner_elo, elo_change);
  
  -- Record ELO history for loser
  INSERT INTO public.match_elo_history (match_id, user_id, elo_before, elo_after, elo_change)
  VALUES (_match_id, _loser_id, loser_ranking.elo_rating, new_loser_elo, -elo_change);
  
  RETURN QUERY SELECT elo_change, -elo_change;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;