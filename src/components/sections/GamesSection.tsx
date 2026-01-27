import { motion } from "framer-motion";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export function GamesSection() {
  // Fetch games from database
  const { data: games, isLoading } = useQuery({
    queryKey: ["games-section"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("name")
        .limit(4);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch tournament stats per game
  const { data: tournamentStats } = useQuery({
    queryKey: ["tournament-stats-section"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select("game_id");
      
      if (error) throw error;
      
      const stats: Record<string, number> = {};
      data?.forEach((t) => {
        stats[t.game_id] = (stats[t.game_id] || 0) + 1;
      });
      return stats;
    },
  });

  // Fetch player count per game
  const { data: playerStats } = useQuery({
    queryKey: ["player-stats-section"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_rankings")
        .select("game_id");
      
      if (error) throw error;
      
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

  const getGradientColor = (index: number): string => {
    const colors = [
      "from-orange-500/20 to-transparent",
      "from-yellow-500/20 to-transparent",
      "from-green-500/20 to-transparent",
      "from-blue-500/20 to-transparent",
    ];
    return colors[index % colors.length];
  };

  return (
    <section className="py-24 bg-gradient-to-b from-card to-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm uppercase tracking-widest text-primary mb-2"
          >
            Supported Titles
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl font-bold uppercase tracking-wide"
          >
            Choose Your Arena
          </motion.h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Games Grid */}
        {games && games.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game, index) => {
              const playerCount = playerStats?.[game.id] || 0;
              const tournamentCount = tournamentStats?.[game.id] || 0;

              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/tournaments?game=${game.id}`}>
                    <RiftCard className="group cursor-pointer relative overflow-hidden h-full">
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColor(index)} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      
                      <RiftCardContent className="relative text-center py-8">
                        {/* Game Icon */}
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                          {game.icon}
                        </div>

                        {/* Game Name */}
                        <h3 className="font-display text-lg font-semibold uppercase tracking-wide mb-4">
                          {game.name}
                        </h3>

                        {/* Stats */}
                        <div className="flex justify-center gap-6 text-sm">
                          <div>
                            <p className="font-display text-lg font-bold text-primary">
                              {formatPlayerCount(playerCount)}
                            </p>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Players</p>
                          </div>
                          <div className="w-px bg-border" />
                          <div>
                            <p className="font-display text-lg font-bold text-primary">
                              {tournamentCount}
                            </p>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Tournaments</p>
                          </div>
                        </div>
                      </RiftCardContent>
                    </RiftCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!games || games.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum jogo disponível no momento.
          </div>
        )}
      </div>
    </section>
  );
}
