import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tournament, Game, TournamentRegistration, TournamentMatch, CreateTournamentData, TournamentStatus, MatchStatus } from "@/types/tournament";
import { useToast } from "@/hooks/use-toast";
import { useAchievementSound } from "@/hooks/useAchievementSound";
export const useGames = () => {
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Game[];
    },
  });
};

export const useTournaments = (organizerId?: string) => {
  return useQuery({
    queryKey: ["tournaments", organizerId],
    queryFn: async () => {
      let query = supabase
        .from("tournaments")
        .select(`
          *,
          game:games(*),
          organizer:profiles!tournaments_organizer_id_fkey(username)
        `)
        .order("created_at", { ascending: false });
      
      if (organizerId) {
        query = query.eq("organizer_id", organizerId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Tournament[];
    },
  });
};

export const useTournament = (id: string) => {
  return useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select(`
          *,
          game:games(*),
          organizer:profiles!tournaments_organizer_id_fkey(username)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Tournament;
    },
    enabled: !!id,
  });
};

export const useTournamentRegistrations = (tournamentId: string) => {
  return useQuery({
    queryKey: ["tournament-registrations", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_registrations")
        .select(`
          *,
          user:profiles(id, username, avatar_url),
          team:teams(id, name, tag, logo_url)
        `)
        .eq("tournament_id", tournamentId)
        .order("created_at");
      
      if (error) throw error;
      return data as TournamentRegistration[];
    },
    enabled: !!tournamentId,
  });
};

export const useTournamentMatches = (tournamentId: string) => {
  return useQuery({
    queryKey: ["tournament-matches", tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_matches")
        .select(`
          *,
          participant1:profiles!tournament_matches_participant1_id_fkey(id, username),
          participant2:profiles!tournament_matches_participant2_id_fkey(id, username),
          winner:profiles!tournament_matches_winner_id_fkey(id, username)
        `)
        .eq("tournament_id", tournamentId)
        .order("round")
        .order("match_number");
      
      if (error) throw error;
      return data as TournamentMatch[];
    },
    enabled: !!tournamentId,
  });
};

export const useCreateTournament = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTournamentData) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data: tournament, error } = await supabase
        .from("tournaments")
        .insert({
          ...data,
          organizer_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return tournament;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      toast({ title: "Tournament created successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error creating tournament", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Tournament> & { id: string }) => {
      const { data: tournament, error } = await supabase
        .from("tournaments")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return tournament;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament", variables.id] });
      toast({ title: "Tournament updated successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error updating tournament", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateTournamentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TournamentStatus }) => {
      const { data: tournament, error } = await supabase
        .from("tournaments")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return tournament;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament", variables.id] });
      toast({ title: `Tournament status updated to ${variables.status}` });
    },
    onError: (error) => {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateRegistrationStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, tournamentId }: { id: string; status: string; tournamentId: string }) => {
      const { data, error } = await supabase
        .from("tournament_registrations")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return { registration: data, tournamentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-registrations", data.tournamentId] });
      toast({ title: "Registration updated" });
    },
    onError: (error) => {
      toast({ title: "Error updating registration", description: error.message, variant: "destructive" });
    },
  });
};

export const useGenerateBracket = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tournamentId, participants }: { tournamentId: string; participants: TournamentRegistration[] }) => {
      // Delete existing matches
      await supabase
        .from("tournament_matches")
        .delete()
        .eq("tournament_id", tournamentId);

      // Get confirmed participants
      const confirmedParticipants = participants.filter(p => p.status === "confirmed");
      const numParticipants = confirmedParticipants.length;
      
      if (numParticipants < 2) {
        throw new Error("Need at least 2 confirmed participants");
      }

      // Calculate bracket size (next power of 2)
      const bracketSize = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
      const numRounds = Math.log2(bracketSize);
      const numByes = bracketSize - numParticipants;

      // Shuffle participants for seeding
      const shuffled = [...confirmedParticipants].sort(() => Math.random() - 0.5);
      
      // Generate first round matches
      const matches: Array<{
        tournament_id: string;
        round: number;
        match_number: number;
        participant1_id: string | null;
        participant2_id: string | null;
        status: MatchStatus;
      }> = [];

      const firstRoundMatches = bracketSize / 2;
      let participantIndex = 0;

      for (let i = 0; i < firstRoundMatches; i++) {
        const p1 = shuffled[participantIndex]?.user_id || null;
        participantIndex++;
        const p2 = shuffled[participantIndex]?.user_id || null;
        participantIndex++;

        matches.push({
          tournament_id: tournamentId,
          round: 1,
          match_number: i + 1,
          participant1_id: p1,
          participant2_id: p2,
          status: "pending" as MatchStatus,
        });
      }

      // Generate empty matches for subsequent rounds
      for (let round = 2; round <= numRounds; round++) {
        const matchesInRound = bracketSize / Math.pow(2, round);
        for (let i = 0; i < matchesInRound; i++) {
          matches.push({
            tournament_id: tournamentId,
            round,
            match_number: i + 1,
            participant1_id: null,
            participant2_id: null,
            status: "pending" as MatchStatus,
          });
        }
      }

      const { error } = await supabase
        .from("tournament_matches")
        .insert(matches);

      if (error) throw error;
      return { tournamentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-matches", data.tournamentId] });
      toast({ title: "Bracket generated successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error generating bracket", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateMatchResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  const { playSuccessSound } = useAchievementSound();

  return useMutation({
    mutationFn: async ({
      matchId,
      tournamentId,
      winnerId,
      loserId,
      gameId,
      participant1Score,
      participant2Score,
    }: {
      matchId: string;
      tournamentId: string;
      winnerId: string;
      loserId: string;
      gameId: string;
      participant1Score: number;
      participant2Score: number;
    }) => {
      // Get current ELO before update to check for rank up
      let winnerEloBefore: number | null = null;
      if (user && winnerId === user.id) {
        const { data: rankingBefore } = await supabase
          .from("player_rankings")
          .select("elo_rating")
          .eq("user_id", winnerId)
          .eq("game_id", gameId)
          .maybeSingle();
        winnerEloBefore = rankingBefore?.elo_rating ?? null;
      }

      // Update the match
      const { data: match, error } = await supabase
        .from("tournament_matches")
        .update({
          winner_id: winnerId,
          participant1_score: participant1Score,
          participant2_score: participant2Score,
          status: "completed" as MatchStatus,
          completed_at: new Date().toISOString(),
        })
        .eq("id", matchId)
        .select()
        .single();

      if (error) throw error;

      // Update ELO ratings using the database function
      const { error: eloError } = await supabase.rpc("update_elo_after_match", {
        _match_id: matchId,
        _winner_id: winnerId,
        _loser_id: loserId,
        _game_id: gameId,
      });

      if (eloError) {
        console.error("ELO update error:", eloError);
        // Don't throw - match result is saved, ELO is secondary
      }

      // Find next round match and update with winner
      const nextRound = match.round + 1;
      const nextMatchNumber = Math.ceil(match.match_number / 2);

      const { data: nextMatch } = await supabase
        .from("tournament_matches")
        .select()
        .eq("tournament_id", tournamentId)
        .eq("round", nextRound)
        .eq("match_number", nextMatchNumber)
        .maybeSingle();

      if (nextMatch) {
        const isFirstParticipant = match.match_number % 2 === 1;
        await supabase
          .from("tournament_matches")
          .update(isFirstParticipant ? { participant1_id: winnerId } : { participant2_id: winnerId })
          .eq("id", nextMatch.id);
      }

      // Check for rank up if current user was winner
      let didRankUp = false;
      if (user && winnerId === user.id && winnerEloBefore !== null) {
        const { data: rankingAfter } = await supabase
          .from("player_rankings")
          .select("elo_rating")
          .eq("user_id", winnerId)
          .eq("game_id", gameId)
          .maybeSingle();
        
        if (rankingAfter) {
          const oldTier = getRankTierFromElo(winnerEloBefore);
          const newTier = getRankTierFromElo(rankingAfter.elo_rating);
          didRankUp = newTier > oldTier;
        }
      }

      return { tournamentId, isCurrentUserWinner: user?.id === winnerId, didRankUp };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tournament-matches", data.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      
      // Play success sound if current user won or ranked up
      if (data.isCurrentUserWinner || data.didRankUp) {
        playSuccessSound();
      }
      
      toast({ title: "Match result saved! ELO updated." });
    },
    onError: (error) => {
      toast({ title: "Error saving result", description: error.message, variant: "destructive" });
    },
  });
};

// Helper to get rank tier level for comparison
const getRankTierFromElo = (elo: number): number => {
  if (elo >= 2400) return 8; // Grandmaster
  if (elo >= 2200) return 7; // Master
  if (elo >= 2000) return 6; // Diamond
  if (elo >= 1800) return 5; // Platinum
  if (elo >= 1600) return 4; // Gold
  if (elo >= 1400) return 3; // Silver
  if (elo >= 1200) return 2; // Bronze
  return 1; // Iron
};
