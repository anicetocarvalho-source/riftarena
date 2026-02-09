import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OrganizerTournamentStat {
  id: string;
  name: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  start_date: string;
  end_date: string | null;
  created_at: string;
  game: { name: string; icon: string } | null;
  registrations_count: number;
  matches_total: number;
  matches_completed: number;
}

export interface OrganizerStats {
  tournaments: OrganizerTournamentStat[];
  totalTournaments: number;
  byStatus: { status: string; count: number }[];
  totalRegistrations: number;
  totalPrizePool: number;
  totalMatches: number;
  completedMatches: number;
}

export const useOrganizerStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["organizer-stats", user?.id],
    queryFn: async (): Promise<OrganizerStats> => {
      if (!user) throw new Error("Not authenticated");

      // Fetch organizer's tournaments with game info
      const { data: tournaments, error: tErr } = await supabase
        .from("tournaments")
        .select("id, name, status, prize_pool, max_participants, start_date, end_date, created_at, game:games(name, icon)")
        .eq("organizer_id", user.id)
        .order("created_at", { ascending: false });

      if (tErr) throw tErr;
      const tournamentList = tournaments || [];
      const tournamentIds = tournamentList.map((t) => t.id);

      // Fetch registrations and matches counts in parallel
      let registrations: { tournament_id: string }[] = [];
      let matches: { tournament_id: string; status: string }[] = [];

      if (tournamentIds.length > 0) {
        const [regResult, matchResult] = await Promise.all([
          supabase
            .from("tournament_registrations")
            .select("tournament_id")
            .in("tournament_id", tournamentIds),
          supabase
            .from("tournament_matches")
            .select("tournament_id, status")
            .in("tournament_id", tournamentIds),
        ]);
        registrations = regResult.data || [];
        matches = matchResult.data || [];
      }

      // Build per-tournament stats
      const regCountMap = registrations.reduce((acc, r) => {
        acc[r.tournament_id] = (acc[r.tournament_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const matchCountMap = matches.reduce(
        (acc, m) => {
          if (!acc[m.tournament_id]) acc[m.tournament_id] = { total: 0, completed: 0 };
          acc[m.tournament_id].total++;
          if (m.status === "completed") acc[m.tournament_id].completed++;
          return acc;
        },
        {} as Record<string, { total: number; completed: number }>
      );

      const enriched: OrganizerTournamentStat[] = tournamentList.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        prize_pool: t.prize_pool,
        max_participants: t.max_participants,
        start_date: t.start_date,
        end_date: t.end_date,
        created_at: t.created_at,
        game: t.game,
        registrations_count: regCountMap[t.id] || 0,
        matches_total: matchCountMap[t.id]?.total || 0,
        matches_completed: matchCountMap[t.id]?.completed || 0,
      }));

      // Aggregates
      const byStatus = tournamentList.reduce((acc, t) => {
        const existing = acc.find((s) => s.status === t.status);
        if (existing) existing.count++;
        else acc.push({ status: t.status, count: 1 });
        return acc;
      }, [] as { status: string; count: number }[]);

      return {
        tournaments: enriched,
        totalTournaments: tournamentList.length,
        byStatus,
        totalRegistrations: registrations.length,
        totalPrizePool: tournamentList.reduce((sum, t) => sum + t.prize_pool, 0),
        totalMatches: matches.length,
        completedMatches: matches.filter((m) => m.status === "completed").length,
      };
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};
