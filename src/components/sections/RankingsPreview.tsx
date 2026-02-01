import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronRight, Crown, Medal, Award, Trophy, Loader2, TrendingUp, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRankings, getRankTier, getWinRate } from "@/hooks/useRankings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { GlossaryTerm } from "@/components/ui/glossary-term";
import { useAuth } from "@/contexts/AuthContext";
import { DailyChangesCard } from "@/components/rankings/DailyChangesCard";

export function RankingsPreview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGameId, setSelectedGameId] = useState<string | undefined>(undefined);
  
  // Fetch games for filter
  const { data: games } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch top 3 rankings
  const { data: rankings, isLoading } = useRankings(selectedGameId, 3);

  // Fetch user's personal ranking position
  const { data: userRankingData } = useQuery({
    queryKey: ["user-ranking-position", user?.id, selectedGameId],
    queryFn: async () => {
      if (!user) return null;

      // Get all rankings ordered by ELO to find user's position
      let query = supabase
        .from("player_rankings")
        .select(`
          id,
          user_id,
          elo_rating,
          wins,
          losses,
          win_streak,
          game:games(id, name, icon)
        `)
        .order("elo_rating", { ascending: false });

      if (selectedGameId) {
        query = query.eq("game_id", selectedGameId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const userPosition = data.findIndex(r => r.user_id === user.id);
      const userRanking = data.find(r => r.user_id === user.id);

      if (userPosition === -1 || !userRanking) return null;

      return {
        position: userPosition + 1,
        totalPlayers: data.length,
        elo: userRanking.elo_rating,
        wins: userRanking.wins,
        losses: userRanking.losses,
        winStreak: userRanking.win_streak,
        game: userRanking.game,
      };
    },
    enabled: !!user,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-300" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-display">{rank}</span>;
    }
  };

  const getRankBgClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-transparent border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-slate-400/15 via-slate-400/5 to-transparent border-slate-400/20";
      case 3:
        return "bg-gradient-to-r from-amber-600/15 via-amber-600/5 to-transparent border-amber-600/20";
      default:
        return "border-border/50";
    }
  };

  return (
    <section className="py-24">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center mb-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm uppercase tracking-widest text-primary mb-2"
            >
              {t("rankingsPreview.badge")}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl font-bold uppercase tracking-wide"
            >
              {t("rankingsPreview.title")}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Button variant="rift-outline" onClick={() => navigate("/rankings")}>
              {t("rankingsPreview.fullRankings")}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Personal Rank Indicator for logged-in users */}
        {user && userRankingData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <div 
              className="relative rounded-sm border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => navigate(`/player/${user.id}`)}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border-2 border-primary">
                    <span className="font-display font-bold text-xl text-primary">
                      #{userRankingData.position}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm uppercase tracking-wider text-muted-foreground">
                        {t("rankingsPreview.yourPosition")}
                      </span>
                    </div>
                    <p className="font-display text-lg font-bold">
                      {t("rankingsPreview.rankedOf", { position: userRankingData.position, total: userRankingData.totalPlayers })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-display font-bold text-2xl text-primary">
                      {userRankingData.elo}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      <GlossaryTerm term="elo" showIcon={false}>ELO</GlossaryTerm>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-display font-bold text-lg">
                      <span className="text-success">{userRankingData.wins}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className="text-destructive">{userRankingData.losses}</span>
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("rankingsPreview.wl")}
                    </p>
                  </div>
                  {userRankingData.winStreak > 0 && (
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-display font-bold">{userRankingData.winStreak}</span>
                      <span className="text-xs">{t("rankingsPreview.streak")}</span>
                    </div>
                  )}
                </div>

                <Button variant="rift-outline" size="sm" className="ml-auto">
                  {t("rankingsPreview.viewProfile")}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Daily Changes Card */}
        {user && <DailyChangesCard selectedGameId={selectedGameId} />}

        {/* Game Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <button
            onClick={() => setSelectedGameId(undefined)}
            className={cn(
              "px-4 py-2 text-sm font-display uppercase tracking-wider transition-all rounded-sm border",
              !selectedGameId
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            )}
          >
            {t("rankingsPreview.allGames")}
          </button>
          {games?.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGameId(game.id)}
              className={cn(
                "px-4 py-2 text-sm font-display uppercase tracking-wider transition-all rounded-sm border flex items-center gap-2",
                selectedGameId === game.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              <span>{game.icon}</span>
              {game.name}
            </button>
          ))}
        </motion.div>

        {/* Top 3 Leaderboard Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid gap-4 md:grid-cols-3"
        >
          {isLoading ? (
            <div className="col-span-3 flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : rankings && rankings.length > 0 ? (
            rankings.map((ranking, index) => {
              const rank = index + 1;
              const tier = getRankTier(ranking.elo_rating);
              const winRate = getWinRate(ranking.wins, ranking.losses);
              
              return (
                <motion.div
                  key={ranking.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative rounded-sm border p-6 cursor-pointer transition-all hover:scale-[1.02]",
                    getRankBgClass(rank)
                  )}
                  onClick={() => navigate(`/player/${ranking.user_id}`)}
                >
                  {/* Rank Badge */}
                  <div className="absolute -top-3 -left-3 flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-primary">
                    {getRankIcon(rank)}
                  </div>

                  {/* Player Info */}
                  <div className="flex items-center gap-4 mb-4 pt-2">
                    <div className="relative">
                      <img
                        src={ranking.user?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${ranking.user_id}`}
                        alt={ranking.user?.username || "Player"}
                        className="w-14 h-14 rounded-sm border border-border"
                      />
                      <span className="absolute -bottom-1 -right-1 text-lg">{tier.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold uppercase tracking-wide truncate">
                        {ranking.user?.username || "Unknown"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {ranking.user?.country || "Unknown"}
                      </p>
                      <p className={cn("text-xs font-medium", tier.color)}>
                        {tier.name}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-secondary/50 rounded-sm p-2">
                      <p className="text-xl font-display font-bold text-primary">
                        {ranking.elo_rating}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        <GlossaryTerm term="elo" showIcon={false}>ELO</GlossaryTerm>
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-sm p-2">
                      <p className="text-xl font-display font-bold text-success">
                        {ranking.wins}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t("rankingsPreview.wins")}
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-sm p-2">
                      <p className="text-xl font-display font-bold">
                        {winRate}%
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t("rankingsPreview.winRate")}
                      </p>
                    </div>
                  </div>

                  {/* Game badge if filtered */}
                  {ranking.game && (
                    <div className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <span>{ranking.game.icon}</span>
                      <span>{ranking.game.name}</span>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">{t("rankingsPreview.noRankings")}</p>
              <Button variant="rift" className="mt-4" onClick={() => navigate("/tournaments")}>
                {t("rankingsPreview.joinTournament")}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}