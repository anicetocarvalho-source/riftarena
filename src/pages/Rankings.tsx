import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRankings, getRankTier, getWinRate } from "@/hooks/useRankings";
import { useGames } from "@/hooks/useTournaments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, TrendingUp, Trophy, Target } from "lucide-react";

const Rankings = () => {
  const [activeGameId, setActiveGameId] = useState<string | undefined>(undefined);
  const { data: games, isLoading: gamesLoading } = useGames();
  const { data: rankings, isLoading: rankingsLoading } = useRankings(activeGameId, 100);

  const isLoading = gamesLoading || rankingsLoading;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Badge variant="default" className="mb-4">Global Leaderboard</Badge>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
              Rankings
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Track your progress against the best players worldwide. 
              Climb the ranks, earn recognition, and prove your dominance.
            </p>
          </motion.div>

          {/* Game Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Game</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveGameId(undefined)}
                className={cn(
                  "px-4 py-2 text-sm font-display uppercase tracking-wider transition-all rounded-sm border",
                  !activeGameId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                )}
              >
                All Games
              </button>
              {games?.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setActiveGameId(game.id)}
                  className={cn(
                    "px-4 py-2 text-sm font-display uppercase tracking-wider transition-all rounded-sm border flex items-center gap-2",
                    activeGameId === game.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  <span>{game.icon}</span>
                  {game.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Rankings Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-sm border border-border bg-card overflow-hidden"
          >
            {/* Table Header */}
            <div className="hidden sm:flex items-center gap-4 border-b border-border px-4 py-3 bg-secondary/50">
              <div className="w-12 text-center text-xs font-display uppercase tracking-wider text-muted-foreground">
                Rank
              </div>
              <div className="flex-1 text-xs font-display uppercase tracking-wider text-muted-foreground">
                Player
              </div>
              <div className="hidden md:block w-24 text-center text-xs font-display uppercase tracking-wider text-muted-foreground">
                Tier
              </div>
              <div className="hidden sm:flex items-center gap-6 text-xs font-display uppercase tracking-wider text-muted-foreground">
                <div className="w-20 text-center">W/L</div>
                <div className="w-16 text-center">Win Rate</div>
              </div>
              <div className="w-20 text-right text-xs font-display uppercase tracking-wider text-muted-foreground">
                ELO
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !rankings || rankings.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No rankings yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete matches in tournaments to appear on the leaderboard
                </p>
              </div>
            ) : (
              /* Player Rows */
              rankings.map((ranking, index) => {
                const tier = getRankTier(ranking.elo_rating);
                const winRate = getWinRate(ranking.wins, ranking.losses);
                
                return (
                  <motion.div
                    key={ranking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 border-b border-border/50 hover:bg-secondary/30 transition-colors",
                      index < 3 && "bg-gradient-to-r from-primary/5 to-transparent"
                    )}
                  >
                    {/* Rank */}
                    <div className="w-12 text-center">
                      {index < 3 ? (
                        <div className={cn(
                          "inline-flex items-center justify-center w-8 h-8 rounded-full font-display font-bold",
                          index === 0 && "bg-yellow-500/20 text-yellow-500",
                          index === 1 && "bg-slate-400/20 text-slate-400",
                          index === 2 && "bg-amber-600/20 text-amber-600"
                        )}>
                          {index + 1}
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-display">{index + 1}</span>
                      )}
                    </div>

                    {/* Player */}
                    <Link 
                      to={`/player/${ranking.user_id}`}
                      className="flex-1 flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={ranking.user?.avatar_url || undefined} />
                        <AvatarFallback>
                          {ranking.user?.username?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-display font-medium truncate hover:text-primary transition-colors">
                          {ranking.user?.username || "Unknown"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {ranking.user?.country && <span>{ranking.user.country}</span>}
                          {!activeGameId && ranking.game && (
                            <span className="flex items-center gap-1">
                              {ranking.game.icon} {ranking.game.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Tier */}
                    <div className="hidden md:flex items-center justify-center w-24">
                      <span className={cn("flex items-center gap-1 text-sm", tier.color)}>
                        <span>{tier.icon}</span>
                        <span className="font-display">{tier.name}</span>
                      </span>
                    </div>

                    {/* W/L */}
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="w-20 text-center">
                        <span className="text-success">{ranking.wins}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-destructive">{ranking.losses}</span>
                      </div>
                      <div className="w-16 text-center">
                        <span className={cn(
                          "font-medium",
                          winRate >= 60 ? "text-success" : winRate >= 40 ? "text-foreground" : "text-destructive"
                        )}>
                          {winRate}%
                        </span>
                      </div>
                    </div>

                    {/* ELO */}
                    <div className="w-20 text-right">
                      <span className="font-display font-bold text-primary text-lg">
                        {ranking.elo_rating}
                      </span>
                      {ranking.win_streak > 2 && (
                        <div className="flex items-center justify-end gap-1 text-xs text-success">
                          <TrendingUp className="h-3 w-3" />
                          {ranking.win_streak} streak
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rankings;
