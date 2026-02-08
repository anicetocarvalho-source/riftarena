import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar, Search, Plus, X, ArrowUpDown, Trophy, Gamepad2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTournaments, useGames } from "@/hooks/useTournaments";
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/seo/SEOHead";
import { TournamentGridSkeleton } from "@/components/skeletons/TournamentCardSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Tournaments = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOrganizer, isAdmin, user } = useAuth();
  const { data: tournaments, isLoading } = useTournaments();
  const { data: games } = useGames();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>(searchParams.get("game") || "all");
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get("status") || "all");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "date_desc");

  // Sync URL params with state
  useEffect(() => {
    const gameParam = searchParams.get("game");
    const statusParam = searchParams.get("status");
    const sortParam = searchParams.get("sort");
    if (gameParam) setSelectedGame(gameParam);
    if (statusParam) setSelectedStatus(statusParam);
    if (sortParam) setSortBy(sortParam);
  }, [searchParams]);

  const handleGameChange = (value: string) => {
    setSelectedGame(value);
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete("game");
    } else {
      newParams.set("game", value);
    }
    setSearchParams(newParams);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    const newParams = new URLSearchParams(searchParams);
    if (value === "all") {
      newParams.delete("status");
    } else {
      newParams.set("status", value);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const newParams = new URLSearchParams(searchParams);
    if (value === "date_desc") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", value);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSelectedGame("all");
    setSelectedStatus("all");
    setSearchTerm("");
    setSortBy("date_desc");
    setSearchParams({});
  };

  const filteredTournaments = useMemo(() => {
    let result = tournaments?.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.game?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGame = selectedGame === "all" || t.game_id === selectedGame;
      const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;
      return matchesSearch && matchesGame && matchesStatus;
    }) || [];

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case "date_desc":
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        case "prize_desc":
          return b.prize_pool - a.prize_pool;
        case "prize_asc":
          return a.prize_pool - b.prize_pool;
        case "participants_desc":
          return b.max_participants - a.max_participants;
        case "participants_asc":
          return a.max_participants - b.max_participants;
        default:
          return 0;
      }
    });

    return result;
  }, [tournaments, searchTerm, selectedGame, selectedStatus, sortBy]);

  const hasActiveFilters = selectedGame !== "all" || selectedStatus !== "all" || searchTerm !== "" || sortBy !== "date_desc";

  // Transform database tournaments to match TournamentCard format
  // Fetch registration counts for all tournaments
  const { data: registrationCounts } = useQuery({
    queryKey: ["tournament-registration-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournament_registrations")
        .select("tournament_id")
        .in("status", ["confirmed", "pending"]);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(reg => {
        counts[reg.tournament_id] = (counts[reg.tournament_id] || 0) + 1;
      });
      return counts;
    },
  });

  const transformedTournaments = filteredTournaments.map(t => ({
    id: t.id,
    name: t.name,
    game: t.game?.name || "Unknown",
    gameIcon: t.game?.icon || "🎮",
    status: t.status as "live" | "upcoming" | "completed",
    prizePool: `$${t.prize_pool.toLocaleString()}`,
    participants: registrationCounts?.[t.id] || 0,
    maxParticipants: t.max_participants,
    date: new Date(t.start_date).toLocaleDateString(i18n.language === "pt" ? "pt-PT" : "en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    }),
    sponsor: undefined,
    canManage: isAdmin || t.organizer_id === user?.id,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Tournaments"
        description="Browse and join competitive esports tournaments. Single elimination, double elimination, and round robin brackets with real prize pools."
        canonical="https://riftarena.lovable.app/tournaments"
      />
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
                <Badge variant="default" className="mb-4">{t('tournaments.badge')}</Badge>
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
                  {t('tournaments.title')}
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  {t('tournaments.description')}
                </p>
              </div>
              {(isOrganizer || isAdmin) && (
                <Button variant="rift" onClick={() => navigate("/tournaments/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('tournaments.createTournament')}
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
                placeholder={t('tournaments.searchPlaceholder')}
                className="pl-10 bg-secondary border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedGame} onValueChange={handleGameChange}>
                <SelectTrigger className="w-[180px] bg-secondary border-border">
                  <SelectValue placeholder={t('tournaments.allGames')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tournaments.allGames')}</SelectItem>
                  {games?.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.icon} {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[150px] bg-secondary border-border">
                  <SelectValue placeholder={t('tournaments.allStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('tournaments.allStatus')}</SelectItem>
                  <SelectItem value="live">🔴 {t('tournaments.live')}</SelectItem>
                  <SelectItem value="registration">📝 {t('tournaments.registration')}</SelectItem>
                  <SelectItem value="upcoming">📅 {t('tournaments.upcoming')}</SelectItem>
                  <SelectItem value="completed">✅ {t('tournaments.completed')}</SelectItem>
                  <SelectItem value="cancelled">❌ {t('tournaments.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] bg-secondary border-border">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t('tournaments.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">📅 {t('tournaments.dateNewest')}</SelectItem>
                  <SelectItem value="date_asc">📅 {t('tournaments.dateOldest')}</SelectItem>
                  <SelectItem value="prize_desc">💰 {t('tournaments.prizeHigh')}</SelectItem>
                  <SelectItem value="prize_asc">💰 {t('tournaments.prizeLow')}</SelectItem>
                  <SelectItem value="participants_desc">👥 {t('tournaments.sizeLarge')}</SelectItem>
                  <SelectItem value="participants_asc">👥 {t('tournaments.sizeSmall')}</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="default" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  {t('tournaments.clearFilters')}
                </Button>
              )}
            </div>
          </motion.div>

          {/* Tournament Grid */}
          {isLoading ? (
            <TournamentGridSkeleton />
          ) : transformedTournaments.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                icon={Search}
                title={t('tournaments.noTournamentsSearch')}
                description={t('tournaments.noTournamentsSearchDesc')}
                actions={[
                  {
                    label: t('tournaments.clearFilters'),
                    onClick: clearFilters,
                    icon: X,
                  },
                ]}
              />
            ) : (
              <EmptyState
                icon={Trophy}
                title={t('tournaments.noTournamentsEmpty')}
                description={t('tournaments.noTournamentsEmptyDesc')}
                tip={t('tournaments.noTournamentsTip')}
                actions={
                  (isOrganizer || isAdmin)
                    ? [
                        {
                          label: t('tournaments.createTournament'),
                          onClick: () => navigate("/tournaments/create"),
                          icon: Plus,
                        },
                      ]
                    : [
                        {
                          label: t('tournaments.exploreGames'),
                          onClick: () => navigate("/games"),
                          icon: Gamepad2,
                        },
                      ]
                }
              />
            )
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {transformedTournaments.map((tournament, index) => (
                <TournamentCard 
                  key={tournament.id} 
                  tournament={tournament} 
                  index={index}
                  onManage={tournament.canManage ? () => navigate(`/tournaments/manage/${tournament.id}`) : undefined}
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
