import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const tournaments = [
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
  {
    id: "4",
    name: "Elite Squad Tournament",
    game: "Free Fire",
    gameIcon: "🔥",
    status: "upcoming" as const,
    prizePool: "$10,000",
    participants: 32,
    maxParticipants: 64,
    date: "Feb 18, 2025",
    sponsor: "Intel",
  },
  {
    id: "5",
    name: "Battle Royale Masters",
    game: "PUBG Mobile",
    gameIcon: "🎯",
    status: "completed" as const,
    prizePool: "$20,000",
    participants: 100,
    maxParticipants: 100,
    date: "Jan 20, 2025",
  },
  {
    id: "6",
    name: "COD Pro Invitational",
    game: "Call of Duty Mobile",
    gameIcon: "💀",
    status: "completed" as const,
    prizePool: "$12,000",
    participants: 48,
    maxParticipants: 48,
    date: "Jan 15, 2025",
    sponsor: "Razer",
  },
];

const Tournaments = () => {
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
            <Badge variant="default" className="mb-4">Browse Tournaments</Badge>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
              Tournaments
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Find and join competitive tournaments across all supported games. 
              Compete for cash prizes, sponsor rewards, and global recognition.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tournaments..." 
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="rift-outline" size="default">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="rift-outline" size="default">
                <Calendar className="mr-2 h-4 w-4" />
                Date
              </Button>
            </div>
          </motion.div>

          {/* Tournament Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament, index) => (
              <TournamentCard key={tournament.id} tournament={tournament} index={index} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tournaments;
