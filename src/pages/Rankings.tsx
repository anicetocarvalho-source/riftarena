import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { RankingRow } from "@/components/rankings/RankingRow";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

const games = ["All Games", "Free Fire", "PUBG Mobile", "COD Mobile"];
const seasons = ["Season 4", "Season 3", "Season 2", "All Time"];

const allPlayers = [
  { rank: 1, username: "PHANTOM_X", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=phantom", country: "🇧🇷 Brazil", elo: 2847, wins: 342, losses: 45, winRate: 88 },
  { rank: 2, username: "SHADOW_STRIKE", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=shadow", country: "🇮🇩 Indonesia", elo: 2756, wins: 298, losses: 52, winRate: 85 },
  { rank: 3, username: "VIPER_ACE", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=viper", country: "🇮🇳 India", elo: 2698, wins: 276, losses: 61, winRate: 82 },
  { rank: 4, username: "STORM_FURY", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=storm", country: "🇵🇭 Philippines", elo: 2634, wins: 254, losses: 68, winRate: 79 },
  { rank: 5, username: "BLAZE_KING", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=blaze", country: "🇻🇳 Vietnam", elo: 2589, wins: 231, losses: 72, winRate: 76 },
  { rank: 6, username: "NIGHT_OWL", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=night", country: "🇹🇭 Thailand", elo: 2534, wins: 218, losses: 78, winRate: 74 },
  { rank: 7, username: "FROST_BITE", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=frost", country: "🇲🇾 Malaysia", elo: 2487, wins: 205, losses: 82, winRate: 71 },
  { rank: 8, username: "THUNDER_BOLT", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=thunder", country: "🇸🇬 Singapore", elo: 2445, wins: 198, losses: 85, winRate: 70 },
  { rank: 9, username: "DARK_REAPER", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=dark", country: "🇯🇵 Japan", elo: 2398, wins: 187, losses: 89, winRate: 68 },
  { rank: 10, username: "IRON_FIST", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=iron", country: "🇰🇷 South Korea", elo: 2356, wins: 176, losses: 92, winRate: 66 },
];

const Rankings = () => {
  const [activeGame, setActiveGame] = useState("All Games");
  const [activeSeason, setActiveSeason] = useState("Season 4");

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

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-6 mb-8"
          >
            {/* Game Filter */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Game</p>
              <div className="flex flex-wrap gap-2">
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
              </div>
            </div>

            {/* Season Filter */}
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Season</p>
              <div className="flex flex-wrap gap-2">
                {seasons.map((season) => (
                  <button
                    key={season}
                    onClick={() => setActiveSeason(season)}
                    className={cn(
                      "px-4 py-2 text-sm font-display uppercase tracking-wider transition-all rounded-sm border",
                      activeSeason === season
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {season}
                  </button>
                ))}
              </div>
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
              <div className="hidden sm:flex items-center gap-6 text-xs font-display uppercase tracking-wider text-muted-foreground">
                <div className="w-16 text-center">W/L</div>
                <div className="w-16 text-center">Win Rate</div>
              </div>
              <div className="w-20 text-right text-xs font-display uppercase tracking-wider text-muted-foreground">
                ELO
              </div>
            </div>

            {/* Player Rows */}
            {allPlayers.map((player, index) => (
              <RankingRow key={player.username} player={player} index={index} />
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Rankings;
