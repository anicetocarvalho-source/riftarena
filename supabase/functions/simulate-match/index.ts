import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SimulateMatchRequest {
  tournamentId: string;
  winnerId: string;
  loserId: string;
  winnerScore?: number;
  loserScore?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body: SimulateMatchRequest = await req.json();
    const { tournamentId, winnerId, loserId, winnerScore = 3, loserScore = 1 } = body;

    if (!tournamentId || !winnerId || !loserId) {
      throw new Error("Missing required fields: tournamentId, winnerId, loserId");
    }

    // Get tournament info to find the game_id
    const { data: tournament, error: tournamentError } = await supabaseAdmin
      .from("tournaments")
      .select("id, game_id, name")
      .eq("id", tournamentId)
      .single();

    if (tournamentError || !tournament) {
      throw new Error("Tournament not found");
    }

    // Get existing matches or determine next match number
    const { data: existingMatches } = await supabaseAdmin
      .from("tournament_matches")
      .select("match_number, round")
      .eq("tournament_id", tournamentId)
      .order("match_number", { ascending: false })
      .limit(1);

    const nextMatchNumber = existingMatches?.[0]?.match_number 
      ? existingMatches[0].match_number + 1 
      : 1;
    const round = existingMatches?.[0]?.round || 1;

    // Get player names for logging
    const { data: players } = await supabaseAdmin
      .from("profiles")
      .select("id, username")
      .in("id", [winnerId, loserId]);

    const winnerName = players?.find(p => p.id === winnerId)?.username || "Unknown";
    const loserName = players?.find(p => p.id === loserId)?.username || "Unknown";

    // Get ELO before the match
    const { data: winnerRankingBefore } = await supabaseAdmin
      .from("player_rankings")
      .select("elo_rating, wins, losses, matches_played")
      .eq("user_id", winnerId)
      .eq("game_id", tournament.game_id)
      .single();

    const { data: loserRankingBefore } = await supabaseAdmin
      .from("player_rankings")
      .select("elo_rating, wins, losses, matches_played")
      .eq("user_id", loserId)
      .eq("game_id", tournament.game_id)
      .single();

    console.log(`Simulating match: ${winnerName} vs ${loserName}`);
    console.log(`Before - ${winnerName}: ${winnerRankingBefore?.elo_rating}, ${loserName}: ${loserRankingBefore?.elo_rating}`);

    // Create the match
    const { data: match, error: matchError } = await supabaseAdmin
      .from("tournament_matches")
      .insert({
        tournament_id: tournamentId,
        round,
        match_number: nextMatchNumber,
        participant1_id: winnerId,
        participant2_id: loserId,
        participant1_score: winnerScore,
        participant2_score: loserScore,
        winner_id: winnerId,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (matchError) {
      throw new Error(`Failed to create match: ${matchError.message}`);
    }

    // Update ELO using the database function
    const { data: eloResult, error: eloError } = await supabaseAdmin.rpc(
      "update_elo_after_match",
      {
        _match_id: match.id,
        _winner_id: winnerId,
        _loser_id: loserId,
        _game_id: tournament.game_id,
      }
    );

    if (eloError) {
      throw new Error(`Failed to update ELO: ${eloError.message}`);
    }

    // Get ELO after the match
    const { data: winnerRankingAfter } = await supabaseAdmin
      .from("player_rankings")
      .select("elo_rating, wins, losses, matches_played, peak_elo, win_streak")
      .eq("user_id", winnerId)
      .eq("game_id", tournament.game_id)
      .single();

    const { data: loserRankingAfter } = await supabaseAdmin
      .from("player_rankings")
      .select("elo_rating, wins, losses, matches_played")
      .eq("user_id", loserId)
      .eq("game_id", tournament.game_id)
      .single();

    const winnerChange = (winnerRankingAfter?.elo_rating || 0) - (winnerRankingBefore?.elo_rating || 0);
    const loserChange = (loserRankingAfter?.elo_rating || 0) - (loserRankingBefore?.elo_rating || 0);

    console.log(`After - ${winnerName}: ${winnerRankingAfter?.elo_rating} (+${winnerChange}), ${loserName}: ${loserRankingAfter?.elo_rating} (${loserChange})`);

    return new Response(
      JSON.stringify({
        success: true,
        match: {
          id: match.id,
          matchNumber: nextMatchNumber,
          round,
          score: `${winnerScore}-${loserScore}`,
        },
        winner: {
          id: winnerId,
          username: winnerName,
          eloBefore: winnerRankingBefore?.elo_rating || 1200,
          eloAfter: winnerRankingAfter?.elo_rating || 0,
          eloChange: `+${winnerChange}`,
          totalWins: winnerRankingAfter?.wins || 0,
          winStreak: winnerRankingAfter?.win_streak || 0,
        },
        loser: {
          id: loserId,
          username: loserName,
          eloBefore: loserRankingBefore?.elo_rating || 1200,
          eloAfter: loserRankingAfter?.elo_rating || 0,
          eloChange: loserChange,
          totalLosses: loserRankingAfter?.losses || 0,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error simulating match:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
