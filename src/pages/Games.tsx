import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const games = [
  {
    id: "freefire",
    name: "Free Fire",
    icon: "🔥",
    players: "18.5K",
    tournaments: 342,
    activeTournaments: 12,
    description: "Battle Royale action with 50-player matches on a remote island.",
    formats: ["Solo", "Duo", "Squad"],
  },
  {
    id: "pubg",
    name: "PUBG Mobile",
    icon: "🎯",
    players: "15.2K",
    tournaments: 287,
    activeTournaments: 8,
    description: "The original battle royale experience optimized for mobile.",
    formats: ["Solo", "Duo", "Squad", "TDM"],
  },
  {
    id: "codm",
    name: "Call of Duty Mobile",
    icon: "💀",
    players: "12.8K",
    tournaments: 198,
    activeTournaments: 6,
    description: "Fast-paced FPS action with classic Call of Duty gameplay.",
    formats: ["Multiplayer", "Battle Royale", "Ranked"],
  },
  {
    id: "efootball",
    name: "eFootball",
    icon: "⚽",
    players: "8.3K",
    tournaments: 156,
    activeTournaments: 4,
    description: "Competitive football simulation with real teams and players.",
    formats: ["1v1", "Co-op", "League"],
  },
];

const Games = () => {
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
            <Badge variant="default" className="mb-4">Supported Titles</Badge>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
              Games
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Explore all supported games on RIFT. Each title features dedicated 
              rankings, tournaments, and competitive formats.
            </p>
          </motion.div>

          {/* Games Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {games.map((game, index) => (
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
                          <Badge variant="live" size="sm">
                            {game.activeTournaments} Live
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">
                          {game.description}
                        </p>

                        {/* Formats */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {game.formats.map((format) => (
                            <Badge key={format} variant="outline" size="sm">
                              {format}
                            </Badge>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 text-sm mb-4">
                          <div>
                            <span className="font-display text-lg font-bold text-primary">{game.players}</span>
                            <p className="text-xs text-muted-foreground">Players</p>
                          </div>
                          <div>
                            <span className="font-display text-lg font-bold text-primary">{game.tournaments}</span>
                            <p className="text-xs text-muted-foreground">Tournaments</p>
                          </div>
                        </div>

                        <Button variant="rift-outline" size="sm">
                          View Tournaments
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </RiftCardContent>
                </RiftCard>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Games;
