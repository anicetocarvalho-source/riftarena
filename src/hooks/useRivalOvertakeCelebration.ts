import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RivalOvertakeData {
  id: string;
  rivalName: string;
  rivalId: string;
  gameName: string;
  newPosition: number;
}

/**
 * Hook to detect when the current user has overtaken a rival
 * Checks for unread notifications where OTHER users were overtaken BY the current user
 */
export function useRivalOvertakeCelebration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [celebrationData, setCelebrationData] = useState<RivalOvertakeData | null>(null);

  // Check for recent ELO increases that resulted in overtaking rivals
  const { data: recentOvertakes } = useQuery({
    queryKey: ["user-overtakes", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get recent match history where user won
      const { data: recentMatches, error: matchError } = await supabase
        .from("match_elo_history")
        .select(`
          id,
          match_id,
          elo_before,
          elo_after,
          elo_change,
          created_at
        `)
        .eq("user_id", user.id)
        .gt("elo_change", 0)
        .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
        .order("created_at", { ascending: false })
        .limit(1);

      if (matchError || !recentMatches?.length) return [];

      const latestWin = recentMatches[0];

      // Check if this ELO increase caused any overtakes
      // by finding players whose ELO is between old and new ELO
      const { data: overtakenPlayers, error: overtakeError } = await supabase
        .from("player_rankings")
        .select(`
          user_id,
          elo_rating,
          game_id,
          game:games(name)
        `)
        .neq("user_id", user.id)
        .gte("elo_rating", latestWin.elo_before)
        .lt("elo_rating", latestWin.elo_after)
        .limit(5);

      if (overtakeError || !overtakenPlayers?.length) return [];

      // Get profiles of overtaken players
      const userIds = overtakenPlayers.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      if (!profiles?.length) return [];

      // Get current user's position
      const { data: allRankings } = await supabase
        .from("player_rankings")
        .select("user_id, elo_rating")
        .order("elo_rating", { ascending: false });

      const userPosition = allRankings?.findIndex(r => r.user_id === user.id) ?? -1;

      return overtakenPlayers.map(player => {
        const profile = profiles.find(p => p.id === player.user_id);
        const game = player.game as { name: string } | null;
        return {
          id: `overtake-${player.user_id}-${Date.now()}`,
          rivalName: profile?.username || "Unknown",
          rivalId: player.user_id,
          gameName: game?.name || "",
          newPosition: userPosition + 1,
        };
      });
    },
    enabled: !!user,
    refetchInterval: 10000, // Check every 10 seconds
    staleTime: 5000,
  });

  // Check localStorage to see if we've already celebrated this overtake
  useEffect(() => {
    if (!recentOvertakes?.length) return;

    const celebratedOvertakes = JSON.parse(
      localStorage.getItem("celebrated-overtakes") || "[]"
    ) as string[];

    // Find first uncelebrated overtake
    const uncelebrated = recentOvertakes.find(
      o => !celebratedOvertakes.includes(o.id)
    );

    if (uncelebrated) {
      setCelebrationData(uncelebrated);
    }
  }, [recentOvertakes]);

  const dismissCelebration = useCallback(() => {
    if (!celebrationData) return;

    // Mark as celebrated in localStorage
    const celebrated = JSON.parse(
      localStorage.getItem("celebrated-overtakes") || "[]"
    ) as string[];
    celebrated.push(celebrationData.id);
    
    // Keep only last 50 entries
    const trimmed = celebrated.slice(-50);
    localStorage.setItem("celebrated-overtakes", JSON.stringify(trimmed));

    setCelebrationData(null);
  }, [celebrationData]);

  return {
    celebrationData,
    dismissCelebration,
  };
}
