import { motion } from "framer-motion";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";

const games = [
  {
    id: "freefire",
    name: "Free Fire",
    icon: "🔥",
    players: "18.5K",
    tournaments: 342,
    color: "from-orange-500/20 to-transparent",
  },
  {
    id: "pubg",
    name: "PUBG Mobile",
    icon: "🎯",
    players: "15.2K",
    tournaments: 287,
    color: "from-yellow-500/20 to-transparent",
  },
  {
    id: "codm",
    name: "Call of Duty Mobile",
    icon: "💀",
    players: "12.8K",
    tournaments: 198,
    color: "from-green-500/20 to-transparent",
  },
  {
    id: "efootball",
    name: "eFootball",
    icon: "⚽",
    players: "8.3K",
    tournaments: 156,
    color: "from-blue-500/20 to-transparent",
  },
];

export function GamesSection() {
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

        {/* Games Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <RiftCard className="group cursor-pointer relative overflow-hidden h-full">
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                
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
                      <p className="font-display text-lg font-bold text-primary">{game.players}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Players</p>
                    </div>
                    <div className="w-px bg-border" />
                    <div>
                      <p className="font-display text-lg font-bold text-primary">{game.tournaments}</p>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Tournaments</p>
                    </div>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
