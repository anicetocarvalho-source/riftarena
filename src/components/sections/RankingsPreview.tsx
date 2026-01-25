import { motion } from "framer-motion";
import { RankingRow } from "@/components/rankings/RankingRow";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const games = ["All Games", "Free Fire", "PUBG Mobile", "COD Mobile"];

const topPlayers = [
  {
    rank: 1,
    username: "PHANTOM_X",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=phantom",
    country: "🇧🇷 Brazil",
    elo: 2847,
    wins: 342,
    losses: 45,
    winRate: 88,
  },
  {
    rank: 2,
    username: "SHADOW_STRIKE",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=shadow",
    country: "🇮🇩 Indonesia",
    elo: 2756,
    wins: 298,
    losses: 52,
    winRate: 85,
  },
  {
    rank: 3,
    username: "VIPER_ACE",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=viper",
    country: "🇮🇳 India",
    elo: 2698,
    wins: 276,
    losses: 61,
    winRate: 82,
  },
  {
    rank: 4,
    username: "STORM_FURY",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=storm",
    country: "🇵🇭 Philippines",
    elo: 2634,
    wins: 254,
    losses: 68,
    winRate: 79,
  },
  {
    rank: 5,
    username: "BLAZE_KING",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=blaze",
    country: "🇻🇳 Vietnam",
    elo: 2589,
    wins: 231,
    losses: 72,
    winRate: 76,
  },
];

export function RankingsPreview() {
  const [activeGame, setActiveGame] = useState("All Games");

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
              Global Leaderboard
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl font-bold uppercase tracking-wide"
            >
              Top Players
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Button variant="rift-outline">
              Full Rankings
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Game Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {games.map((game) => (
            <button
              key={game}
              onClick={() => setActiveGame(game)}
              className={cn(
                "px-4 py-2 text-sm font-display uppercase tracking-wider transition-all rounded-sm border",
                activeGame === game
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              {game}
            </button>
          ))}
        </motion.div>

        {/* Rankings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
            <div className="hidden sm:flex items-center gap-6 text-xs font-display uppercase tracking-wider text-muted-foreground">
              <div className="w-16 text-center">W/L</div>
              <div className="w-16 text-center">Win Rate</div>
            </div>
            <div className="w-20 text-right text-xs font-display uppercase tracking-wider text-muted-foreground">
              ELO
            </div>
          </div>

          {/* Player Rows */}
          {topPlayers.map((player, index) => (
            <RankingRow key={player.username} player={player} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
