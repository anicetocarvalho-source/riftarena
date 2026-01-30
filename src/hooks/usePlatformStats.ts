import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  totalPlayers: number;
  tournamentsHosted: number;
  totalPrizeDistributed: number;
  activeTeams: number;
}

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      // Fetch total players
      const { count: playersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch tournaments (completed ones for "hosted" metric)
      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("prize_pool, status");

      const completedTournaments = tournaments?.filter(t => t.status === "completed") || [];
      const allTournaments = tournaments || [];
      
      const totalPrize = completedTournaments.reduce(
        (sum, t) => sum + (Number(t.prize_pool) || 0),
        0
      );

      // Fetch active teams
      const { count: teamsCount } = await supabase
        .from("teams")
        .select("*", { count: "exact", head: true });

      return {
        totalPlayers: playersCount || 0,
        tournamentsHosted: allTournaments.length,
        totalPrizeDistributed: totalPrize,
        activeTeams: teamsCount || 0,
      };
    },
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });
};
