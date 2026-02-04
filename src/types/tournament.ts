export type TournamentStatus = 'draft' | 'registration' | 'live' | 'completed' | 'cancelled';
export type MatchStatus = 'pending' | 'in_progress' | 'completed' | 'disputed';

export interface PrizeDistribution {
  first: number;
  second: number;
  third: number;
  fourth?: number;
  fifth?: number;
  sixth?: number;
  seventh?: number;
  eighth?: number;
}

export interface Game {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string | null;
  game_id: string;
  organizer_id: string;
  sponsor_id: string | null;
  status: TournamentStatus;
  prize_pool: number;
  max_participants: number;
  registration_fee: number;
  registration_deadline: string | null;
  start_date: string;
  end_date: string | null;
  rules: string | null;
  bracket_type: string;
  is_team_based: boolean;
  team_size: number | null;
  banner_url: string | null;
  prize_distribution: PrizeDistribution | null;
  created_at: string;
  updated_at: string;
  game?: Game;
  organizer?: { username: string };
  registrations_count?: number;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string | null;
  team_id: string | null;
  status: string;
  seed: number | null;
  created_at: string;
  user?: { id: string; username: string; avatar_url: string | null };
  team?: { id: string; name: string; tag: string; logo_url: string | null };
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  participant1_id: string | null;
  participant2_id: string | null;
  winner_id: string | null;
  participant1_score: number | null;
  participant2_score: number | null;
  status: MatchStatus;
  scheduled_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  participant1?: { id: string; username: string };
  participant2?: { id: string; username: string };
  winner?: { id: string; username: string };
}

export interface CreateTournamentData {
  name: string;
  description?: string;
  game_id: string;
  prize_pool: number;
  max_participants: number;
  registration_fee?: number;
  registration_deadline?: string;
  start_date: string;
  end_date?: string;
  rules?: string;
  bracket_type: string;
  banner_url?: string;
  prize_distribution?: PrizeDistribution;
}
