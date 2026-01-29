import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  totalUsers: number;
  totalTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  totalGames: number;
  totalRegistrations: number;
  usersByRole: { role: string; count: number }[];
  tournamentsByStatus: { status: string; count: number }[];
  recentUsers: { id: string; username: string; created_at: string; country: string | null }[];
  topGames: { id: string; name: string; icon: string; tournament_count: number }[];
}

export const usePlatformAnalytics = () => {
  return useQuery({
    queryKey: ["platform-analytics"],
    queryFn: async (): Promise<PlatformStats> => {
      // Fetch all stats in parallel
      const [
        usersResult,
        tournamentsResult,
        teamsResult,
        matchesResult,
        gamesResult,
        registrationsResult,
        rolesResult,
        recentUsersResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("tournaments").select("id, status"),
        supabase.from("teams").select("id", { count: "exact", head: true }),
        supabase.from("tournament_matches").select("id, status"),
        supabase.from("games").select("id, name, icon"),
        supabase.from("tournament_registrations").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("profiles").select("id, username, created_at, country").order("created_at", { ascending: false }).limit(5),
      ]);

      // Calculate tournament stats by status
      const tournaments = tournamentsResult.data || [];
      const tournamentsByStatus = tournaments.reduce((acc, t) => {
        const existing = acc.find(item => item.status === t.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: t.status, count: 1 });
        }
        return acc;
      }, [] as { status: string; count: number }[]);

      const activeTournaments = tournaments.filter(t => t.status === "live" || t.status === "registration").length;
      const completedTournaments = tournaments.filter(t => t.status === "completed").length;

      // Calculate match stats
      const matches = matchesResult.data || [];
      const completedMatches = matches.filter(m => m.status === "completed").length;

      // Calculate roles distribution
      const roles = rolesResult.data || [];
      const usersByRole = roles.reduce((acc, r) => {
        const existing = acc.find(item => item.role === r.role);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ role: r.role, count: 1 });
        }
        return acc;
      }, [] as { role: string; count: number }[]);

      // Get tournament count per game
      const games = gamesResult.data || [];
      const tournamentCountByGame = tournaments.reduce((acc, t) => {
        acc[t.id] = (acc[t.id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // For top games, we need to count tournaments per game
      const { data: tournamentGames } = await supabase
        .from("tournaments")
        .select("game_id");
      
      const gameCountMap = (tournamentGames || []).reduce((acc, t) => {
        acc[t.game_id] = (acc[t.game_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topGames = games
        .map(g => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          tournament_count: gameCountMap[g.id] || 0,
        }))
        .sort((a, b) => b.tournament_count - a.tournament_count)
        .slice(0, 5);

      return {
        totalUsers: usersResult.count || 0,
        totalTournaments: tournaments.length,
        activeTournaments,
        completedTournaments,
        totalTeams: teamsResult.count || 0,
        totalMatches: matches.length,
        completedMatches,
        totalGames: games.length,
        totalRegistrations: registrationsResult.count || 0,
        usersByRole,
        tournamentsByStatus,
        recentUsers: recentUsersResult.data || [],
        topGames,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
