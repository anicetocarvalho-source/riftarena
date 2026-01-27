import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTournaments, useGames } from "@/hooks/useTournaments";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Tournaments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOrganizer, isAdmin, user } = useAuth();
  const { data: tournaments, isLoading } = useTournaments();
  const { data: games } = useGames();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>(searchParams.get("game") || "all");

  // Sync URL param with state
  useEffect(() => {
    const gameParam = searchParams.get("game");
    if (gameParam) {
      setSelectedGame(gameParam);
    }
  }, [searchParams]);

  const handleGameChange = (value: string) => {
    setSelectedGame(value);
    if (value === "all") {
      searchParams.delete("game");
    } else {
      searchParams.set("game", value);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedGame("all");
    setSearchTerm("");
    setSearchParams({});
  };

  const filteredTournaments = tournaments?.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.game?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = selectedGame === "all" || t.game_id === selectedGame;
    return matchesSearch && matchesGame;
  }) || [];

  const hasActiveFilters = selectedGame !== "all" || searchTerm !== "";

  // Transform database tournaments to match TournamentCard format
  const transformedTournaments = filteredTournaments.map(t => ({
    id: t.id,
    name: t.name,
    game: t.game?.name || "Unknown",
    gameIcon: t.game?.icon || "🎮",
    status: t.status as "live" | "upcoming" | "completed",
    prizePool: `$${t.prize_pool.toLocaleString()}`,
    participants: 0, // Will be fetched separately if needed
    maxParticipants: t.max_participants,
    date: new Date(t.start_date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    }),
    sponsor: undefined,
    isOwner: t.organizer_id === user?.id,
  }));

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
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <Badge variant="default" className="mb-4">Browse Tournaments</Badge>
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
                  Tournaments
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Find and join competitive tournaments across all supported games. 
                  Compete for cash prizes, sponsor rewards, and global recognition.
                </p>
              </div>
              {(isOrganizer || isAdmin) && (
                <Button variant="rift" onClick={() => navigate("/tournaments/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Tournament
                </Button>
              )}
            </div>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedGame} onValueChange={handleGameChange}>
                <SelectTrigger className="w-[180px] bg-secondary border-border">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {games?.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.icon} {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="rift-outline" size="default">
                <Calendar className="mr-2 h-4 w-4" />
                Date
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="default" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </motion.div>

          {/* Tournament Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : transformedTournaments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tournaments found</p>
              {(isOrganizer || isAdmin) && (
                <Button variant="rift" onClick={() => navigate("/tournaments/create")}>
                  Create Your First Tournament
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {transformedTournaments.map((tournament, index) => (
                <TournamentCard 
                  key={tournament.id} 
                  tournament={tournament} 
                  index={index}
                  onManage={tournament.isOwner ? () => navigate(`/tournaments/manage/${tournament.id}`) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tournaments;
