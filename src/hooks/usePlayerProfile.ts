import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlayerMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  participant1_id: string | null;
  participant2_id: string | null;
  winner_id: string | null;
  participant1_score: number | null;
  participant2_score: number | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  participant1?: { id: string; username: string };
  participant2?: { id: string; username: string };
  tournament?: { id: string; name: string; game_id: string; game?: { name: string; icon: string } };
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  created_at: string;
}

export interface PlayerAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

export const usePlayerProfile = (userId: string) => {
  return useQuery({
    queryKey: ["player-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      return data as PlayerProfile;
    },
    enabled: !!userId,
  });
};

export const usePlayerMatches = (userId: string, limit: number = 20) => {
  return useQuery({
    queryKey: ["player-matches", userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_matches")
        .select(`
          *,
          participant1:profiles!tournament_matches_participant1_id_fkey(id, username),
          participant2:profiles!tournament_matches_participant2_id_fkey(id, username),
          tournament:tournaments(id, name, game_id, game:games(name, icon))
        `)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as PlayerMatch[];
    },
    enabled: !!userId,
  });
};

export const usePlayerAllRankings = (userId: string) => {
  return useQuery({
    queryKey: ["player-all-rankings", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_rankings")
        .select(`
          *,
          game:games(id, name, icon)
        `)
        .eq("user_id", userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Calculate achievements based on player stats
export const calculateAchievements = (
  rankings: { wins: number; losses: number; matches_played: number; best_win_streak: number; peak_elo: number; elo_rating: number }[],
  matchCount: number
): PlayerAchievement[] => {
  const achievements: PlayerAchievement[] = [];
  
  const totalWins = rankings.reduce((sum, r) => sum + r.wins, 0);
  const totalMatches = rankings.reduce((sum, r) => sum + r.matches_played, 0);
  const bestStreak = Math.max(...rankings.map(r => r.best_win_streak), 0);
  const peakElo = Math.max(...rankings.map(r => r.peak_elo), 0);

  // First Blood - Play first match
  if (totalMatches >= 1) {
    achievements.push({
      id: "first_blood",
      name: "First Blood",
      description: "Complete your first match",
      icon: "🎮",
      rarity: "common",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Warrior - Win 10 matches
  if (totalWins >= 10) {
    achievements.push({
      id: "warrior",
      name: "Warrior",
      description: "Win 10 matches",
      icon: "⚔️",
      rarity: "common",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Gladiator - Win 50 matches
  if (totalWins >= 50) {
    achievements.push({
      id: "gladiator",
      name: "Gladiator",
      description: "Win 50 matches",
      icon: "🛡️",
      rarity: "rare",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Champion - Win 100 matches
  if (totalWins >= 100) {
    achievements.push({
      id: "champion",
      name: "Champion",
      description: "Win 100 matches",
      icon: "🏆",
      rarity: "epic",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Hot Streak - 5 win streak
  if (bestStreak >= 5) {
    achievements.push({
      id: "hot_streak",
      name: "Hot Streak",
      description: "Achieve a 5-win streak",
      icon: "🔥",
      rarity: "rare",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Unstoppable - 10 win streak
  if (bestStreak >= 10) {
    achievements.push({
      id: "unstoppable",
      name: "Unstoppable",
      description: "Achieve a 10-win streak",
      icon: "💪",
      rarity: "epic",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Rising Star - Reach 1400 ELO
  if (peakElo >= 1400) {
    achievements.push({
      id: "rising_star",
      name: "Rising Star",
      description: "Reach Silver rank (1400 ELO)",
      icon: "⭐",
      rarity: "common",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Golden Player - Reach 1600 ELO
  if (peakElo >= 1600) {
    achievements.push({
      id: "golden_player",
      name: "Golden Player",
      description: "Reach Gold rank (1600 ELO)",
      icon: "🥇",
      rarity: "rare",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Platinum Elite - Reach 1800 ELO
  if (peakElo >= 1800) {
    achievements.push({
      id: "platinum_elite",
      name: "Platinum Elite",
      description: "Reach Platinum rank (1800 ELO)",
      icon: "💎",
      rarity: "epic",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Diamond Legend - Reach 2000 ELO
  if (peakElo >= 2000) {
    achievements.push({
      id: "diamond_legend",
      name: "Diamond Legend",
      description: "Reach Diamond rank (2000 ELO)",
      icon: "💠",
      rarity: "epic",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Grandmaster - Reach 2400 ELO
  if (peakElo >= 2400) {
    achievements.push({
      id: "grandmaster",
      name: "Grandmaster",
      description: "Reach Grandmaster rank (2400 ELO)",
      icon: "👑",
      rarity: "legendary",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Veteran - Play 50 matches
  if (totalMatches >= 50) {
    achievements.push({
      id: "veteran",
      name: "Veteran",
      description: "Complete 50 matches",
      icon: "🎖️",
      rarity: "rare",
      unlockedAt: new Date().toISOString(),
    });
  }

  // Legend - Play 200 matches
  if (totalMatches >= 200) {
    achievements.push({
      id: "legend",
      name: "Legend",
      description: "Complete 200 matches",
      icon: "🌟",
      rarity: "legendary",
      unlockedAt: new Date().toISOString(),
    });
  }

  return achievements;
};

// Get locked achievements for display
export const getLockedAchievements = (): PlayerAchievement[] => {
  return [
    { id: "first_blood", name: "First Blood", description: "Complete your first match", icon: "🎮", rarity: "common" },
    { id: "warrior", name: "Warrior", description: "Win 10 matches", icon: "⚔️", rarity: "common" },
    { id: "rising_star", name: "Rising Star", description: "Reach Silver rank (1400 ELO)", icon: "⭐", rarity: "common" },
    { id: "hot_streak", name: "Hot Streak", description: "Achieve a 5-win streak", icon: "🔥", rarity: "rare" },
    { id: "gladiator", name: "Gladiator", description: "Win 50 matches", icon: "🛡️", rarity: "rare" },
    { id: "golden_player", name: "Golden Player", description: "Reach Gold rank (1600 ELO)", icon: "🥇", rarity: "rare" },
    { id: "veteran", name: "Veteran", description: "Complete 50 matches", icon: "🎖️", rarity: "rare" },
    { id: "champion", name: "Champion", description: "Win 100 matches", icon: "🏆", rarity: "epic" },
    { id: "unstoppable", name: "Unstoppable", description: "Achieve a 10-win streak", icon: "💪", rarity: "epic" },
    { id: "platinum_elite", name: "Platinum Elite", description: "Reach Platinum rank (1800 ELO)", icon: "💎", rarity: "epic" },
    { id: "diamond_legend", name: "Diamond Legend", description: "Reach Diamond rank (2000 ELO)", icon: "💠", rarity: "epic" },
    { id: "grandmaster", name: "Grandmaster", description: "Reach Grandmaster rank (2400 ELO)", icon: "👑", rarity: "legendary" },
    { id: "legend", name: "Legend", description: "Complete 200 matches", icon: "🌟", rarity: "legendary" },
  ];
};
