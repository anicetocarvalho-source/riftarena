import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DashboardStats {
  tournamentsJoined: number;
  matchesPlayed: number;
  bestElo: number | null;
  bestTier: string | null;
  totalWinnings: number;
}

export interface UserTournamentRegistration {
  id: string;
  status: string;
  created_at: string;
  tournament: {
    id: string;
    name: string;
    status: string;
    start_date: string;
    prize_pool: number;
    banner_url: string | null;
    game: { name: string; icon: string } | null;
  } | null;
}

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) return { tournamentsJoined: 0, matchesPlayed: 0, bestElo: null, bestTier: null, totalWinnings: 0 };

      // Fetch rankings and tournament registrations in parallel
      const [rankingsRes, registrationsRes] = await Promise.all([
        supabase
          .from("player_rankings")
          .select("elo_rating, matches_played, peak_elo")
          .eq("user_id", user.id),
        supabase
          .from("tournament_registrations")
          .select("id")
          .eq("user_id", user.id)
          .in("status", ["confirmed", "pending"]),
      ]);

      const rankings = rankingsRes.data || [];
      const registrations = registrationsRes.data || [];

      const matchesPlayed = rankings.reduce((sum, r) => sum + r.matches_played, 0);
      const bestElo = rankings.length > 0 ? Math.max(...rankings.map(r => r.elo_rating)) : null;

      let bestTier: string | null = null;
      if (bestElo !== null) {
        if (bestElo >= 2400) bestTier = "Grandmaster";
        else if (bestElo >= 2200) bestTier = "Master";
        else if (bestElo >= 2000) bestTier = "Diamond";
        else if (bestElo >= 1800) bestTier = "Platinum";
        else if (bestElo >= 1600) bestTier = "Gold";
        else if (bestElo >= 1400) bestTier = "Silver";
        else if (bestElo >= 1200) bestTier = "Bronze";
        else bestTier = "Iron";
      }

      return {
        tournamentsJoined: registrations.length,
        matchesPlayed,
        bestElo,
        bestTier,
        totalWinnings: 0, // Placeholder — would need a winnings tracking table
      };
    },
    enabled: !!user,
  });
};

export const useUserTournaments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-tournaments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("tournament_registrations")
        .select(`
          id, status, created_at,
          tournament:tournaments(
            id, name, status, start_date, prize_pool, banner_url,
            game:games(name, icon)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []) as UserTournamentRegistration[];
    },
    enabled: !!user,
  });
};
