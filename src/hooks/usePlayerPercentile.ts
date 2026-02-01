import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PercentileData {
  percentile: number;
  position: number;
  totalPlayers: number;
  elo: number;
}

export function usePlayerPercentile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["player-percentile", user?.id],
    queryFn: async (): Promise<PercentileData | null> => {
      if (!user) return null;

      // Get all rankings ordered by ELO to find user's position
      const { data, error } = await supabase
        .from("player_rankings")
        .select("user_id, elo_rating")
        .order("elo_rating", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const userPosition = data.findIndex(r => r.user_id === user.id);
      const userRanking = data.find(r => r.user_id === user.id);

      if (userPosition === -1 || !userRanking) return null;

      const totalPlayers = data.length;
      const position = userPosition + 1;
      
      // Calculate percentile (what percentage of players you're ahead of)
      const percentile = Math.round(((totalPlayers - position) / totalPlayers) * 100);

      return {
        percentile,
        position,
        totalPlayers,
        elo: userRanking.elo_rating,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
