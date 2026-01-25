export interface Team {
  id: string;
  name: string;
  tag: string;
  logo_url: string | null;
  description: string | null;
  captain_id: string;
  max_members: number;
  created_at: string;
  updated_at: string;
  captain?: { id: string; username: string; avatar_url: string | null };
  members_count?: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  user?: { id: string; username: string; avatar_url: string | null };
}

export interface TeamInvite {
  id: string;
  team_id: string;
  user_id: string;
  status: string;
  created_at: string;
  team?: Team;
  user?: { id: string; username: string; avatar_url: string | null };
}

export interface CreateTeamData {
  name: string;
  tag: string;
  description?: string;
  max_members?: number;
}
