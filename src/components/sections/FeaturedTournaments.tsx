import { motion } from "framer-motion";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const featuredTournaments = [
  {
    id: "1",
    name: "RIFT Championship Series",
    game: "Free Fire",
    gameIcon: "🔥",
    status: "live" as const,
    prizePool: "$50,000",
    participants: 128,
    maxParticipants: 128,
    date: "Jan 28, 2025",
    sponsor: "Samsung",
  },
  {
    id: "2",
    name: "Mobile Legends Cup",
    game: "PUBG Mobile",
    gameIcon: "🎯",
    status: "upcoming" as const,
    prizePool: "$25,000",
    participants: 89,
    maxParticipants: 100,
    date: "Feb 5, 2025",
    sponsor: "Redbull",
  },
  {
    id: "3",
    name: "Pro League Season 4",
    game: "Call of Duty Mobile",
    gameIcon: "💀",
    status: "upcoming" as const,
    prizePool: "$15,000",
    participants: 45,
    maxParticipants: 64,
    date: "Feb 12, 2025",
  },
];

export function FeaturedTournaments() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-card">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm uppercase tracking-widest text-primary mb-2"
            >
              Live & Upcoming
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl font-bold uppercase tracking-wide"
            >
              Featured Tournaments
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Button variant="rift-outline">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Tournament Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredTournaments.map((tournament, index) => (
            <TournamentCard key={tournament.id} tournament={tournament} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
