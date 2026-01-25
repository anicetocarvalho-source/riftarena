import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, Trophy } from "lucide-react";

const teams = [
  {
    id: "1",
    name: "NOVA ESPORTS",
    logo: "⚡",
    country: "🇧🇷 Brazil",
    rank: 1,
    wins: 156,
    players: 5,
    game: "Free Fire",
  },
  {
    id: "2",
    name: "TEAM FLASH",
    logo: "💥",
    country: "🇻🇳 Vietnam",
    rank: 2,
    wins: 142,
    players: 5,
    game: "Free Fire",
  },
  {
    id: "3",
    name: "LOUD",
    logo: "🔊",
    country: "🇧🇷 Brazil",
    rank: 3,
    wins: 138,
    players: 5,
    game: "PUBG Mobile",
  },
  {
    id: "4",
    name: "ALPHA LEGENDS",
    logo: "🦁",
    country: "🇮🇩 Indonesia",
    rank: 4,
    wins: 125,
    players: 5,
    game: "COD Mobile",
  },
  {
    id: "5",
    name: "VORTEX GAMING",
    logo: "🌀",
    country: "🇮🇳 India",
    rank: 5,
    wins: 118,
    players: 6,
    game: "PUBG Mobile",
  },
  {
    id: "6",
    name: "SHADOW PHOENIX",
    logo: "🐦‍🔥",
    country: "🇵🇭 Philippines",
    rank: 6,
    wins: 112,
    players: 5,
    game: "Free Fire",
  },
];

const Teams = () => {
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
            <Badge variant="default" className="mb-4">Competitive Teams</Badge>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
              Teams
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Discover the top competitive teams on RIFT. Follow their journey, 
              track their wins, and watch them compete for glory.
            </p>
          </motion.div>

          {/* Teams Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RiftCard className="h-full group">
                  <RiftCardContent>
                    {/* Team Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl bg-secondary rounded-sm p-3">
                        {team.logo}
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
                          {team.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {team.country}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        #{team.rank}
                      </Badge>
                    </div>

                    {/* Team Stats */}
                    <div className="flex gap-6 mb-4 py-4 border-y border-border">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="font-display font-semibold">{team.wins}</span>
                        <span className="text-xs text-muted-foreground">Wins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-display font-semibold">{team.players}</span>
                        <span className="text-xs text-muted-foreground">Players</span>
                      </div>
                    </div>

                    {/* Game Tag */}
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" size="sm">
                        {team.game}
                      </Badge>
                      <Button variant="rift-ghost" size="sm">
                        View Team
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
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

export default Teams;
