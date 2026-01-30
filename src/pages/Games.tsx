import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Games = () => {
  const { t } = useTranslation();

  // Fetch games from database
  const { data: games, isLoading, error } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch tournament stats per game
  const { data: tournamentStats } = useQuery({
    queryKey: ["tournament-stats-by-game"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("game_id, status");
      
      if (error) throw error;
      
      // Group stats by game_id
      const stats: Record<string, { total: number; active: number }> = {};
      data?.forEach((t) => {
        if (!stats[t.game_id]) {
          stats[t.game_id] = { total: 0, active: 0 };
        }
        stats[t.game_id].total++;
        if (t.status === "live" || t.status === "registration") {
          stats[t.game_id].active++;
        }
      });
      return stats;
    },
  });

  // Fetch player count per game
  const { data: playerStats } = useQuery({
    queryKey: ["player-stats-by-game"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_rankings")
        .select("game_id");
      
      if (error) throw error;
      
      // Count players per game
      const stats: Record<string, number> = {};
      data?.forEach((r) => {
        stats[r.game_id] = (stats[r.game_id] || 0) + 1;
      });
      return stats;
    },
  });

  const formatPlayerCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

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
            <Badge variant="default" className="mb-4">{t('games.badge')}</Badge>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
              {t('games.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {t('games.subtitle')}
            </p>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <p className="text-destructive">{t('games.error')}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && games?.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t('games.empty')}</p>
            </div>
          )}

          {/* Games Grid */}
          {games && games.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2">
              {games.map((game, index) => {
                const stats = tournamentStats?.[game.id] || { total: 0, active: 0 };
                const playerCount = playerStats?.[game.id] || 0;

                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <RiftCard className="h-full">
                      <RiftCardContent>
                        <div className="flex items-start gap-6">
                          {/* Game Icon */}
                          <div className="text-6xl flex-shrink-0">
                            {game.icon}
                          </div>

                          {/* Game Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                                {game.name}
                              </h2>
                              {stats.active > 0 && (
                                <Badge variant="live" size="sm">
                                  {stats.active} {t('games.active')}
                                </Badge>
                              )}
                            </div>

                            {game.description && (
                              <p className="text-sm text-muted-foreground mb-4">
                                {game.description}
                              </p>
                            )}

                            {/* Stats */}
                            <div className="flex gap-6 text-sm mb-4">
                              <div>
                                <span className="font-display text-lg font-bold text-primary">
                                  {formatPlayerCount(playerCount)}
                                </span>
                                <p className="text-xs text-muted-foreground">{t('games.players')}</p>
                              </div>
                              <div>
                                <span className="font-display text-lg font-bold text-primary">
                                  {stats.total}
                                </span>
                                <p className="text-xs text-muted-foreground">{t('games.tournaments')}</p>
                              </div>
                            </div>

                            <Link to={`/tournaments?game=${game.id}`}>
                              <Button variant="rift-outline" size="sm">
                                {t('games.viewTournaments')}
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </RiftCardContent>
                    </RiftCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Games;
