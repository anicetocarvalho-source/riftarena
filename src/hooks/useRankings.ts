import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlayerRanking {
  id: string;
  user_id: string;
  game_id: string;
  elo_rating: number;
  peak_elo: number;
  matches_played: number;
  wins: number;
  losses: number;
  win_streak: number;
  best_win_streak: number;
  last_match_at: string | null;
  created_at: string;
  updated_at: string;
  user?: { id: string; username: string; avatar_url: string | null; country: string | null };
  game?: { id: string; name: string; icon: string };
}

export interface EloHistoryEntry {
  id: string;
  match_id: string;
  user_id: string;
  elo_before: number;
  elo_after: number;
  elo_change: number;
  created_at: string;
}

export const useRankings = (gameId?: string, limit: number = 100) => {
  return useQuery({
    queryKey: ["rankings", gameId, limit],
    queryFn: async () => {
      let query = supabase
        .from("player_rankings")
        .select(`
          *,
          user:profiles(id, username, avatar_url, country),
          game:games(id, name, icon)
        `)
        .order("elo_rating", { ascending: false })
        .limit(limit);
      
      if (gameId) {
        query = query.eq("game_id", gameId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as PlayerRanking[];
    },
  });
};

export const useUserRankings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-rankings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("player_rankings")
        .select(`
          *,
          game:games(id, name, icon)
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data as PlayerRanking[];
    },
    enabled: !!user,
  });
};

export const usePlayerRanking = (userId: string, gameId: string) => {
  return useQuery({
    queryKey: ["player-ranking", userId, gameId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_rankings")
        .select(`
          *,
          user:profiles(id, username, avatar_url, country),
          game:games(id, name, icon)
        `)
        .eq("user_id", userId)
        .eq("game_id", gameId)
        .maybeSingle();
      
      if (error) throw error;
      return data as PlayerRanking | null;
    },
    enabled: !!userId && !!gameId,
  });
};

export const useEloHistory = (userId: string, limit: number = 20) => {
  return useQuery({
    queryKey: ["elo-history", userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("match_elo_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as EloHistoryEntry[];
    },
    enabled: !!userId,
  });
};

// Helper to get rank tier based on ELO
export const getRankTier = (elo: number): { name: string; color: string; icon: string } => {
  if (elo >= 2400) return { name: "Grandmaster", color: "text-red-500", icon: "👑" };
  if (elo >= 2200) return { name: "Master", color: "text-purple-500", icon: "💎" };
  if (elo >= 2000) return { name: "Diamond", color: "text-cyan-400", icon: "💠" };
  if (elo >= 1800) return { name: "Platinum", color: "text-emerald-400", icon: "🏆" };
  if (elo >= 1600) return { name: "Gold", color: "text-yellow-500", icon: "🥇" };
  if (elo >= 1400) return { name: "Silver", color: "text-slate-400", icon: "🥈" };
  if (elo >= 1200) return { name: "Bronze", color: "text-amber-600", icon: "🥉" };
  return { name: "Iron", color: "text-stone-500", icon: "⚔️" };
};

// Helper to calculate win rate
export const getWinRate = (wins: number, losses: number): number => {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};
