import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2, Trophy } from "lucide-react";
import { useTournaments } from "@/hooks/useTournaments";
import { useMemo } from "react";

export function FeaturedTournaments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: tournaments, isLoading } = useTournaments();

  // Pick featured tournaments: prioritize live > registration > upcoming, max 3
  const featured = useMemo(() => {
    if (!tournaments) return [];
    
    const statusPriority: Record<string, number> = {
      live: 0,
      registration: 1,
      completed: 2,
      draft: 3,
      cancelled: 4,
    };

    return [...tournaments]
      .filter(t => t.status !== "draft" && t.status !== "cancelled")
      .sort((a, b) => {
        const priorityDiff = (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99);
        if (priorityDiff !== 0) return priorityDiff;
        return b.prize_pool - a.prize_pool;
      })
      .slice(0, 3)
      .map(t => ({
        id: t.id,
        name: t.name,
        game: t.game?.name || "Unknown",
        gameIcon: t.game?.icon || "🎮",
        status: t.status as "live" | "upcoming" | "completed",
        prizePool: `$${t.prize_pool.toLocaleString()}`,
        participants: 0,
        maxParticipants: t.max_participants,
        date: new Date(t.start_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        bannerUrl: t.banner_url || undefined,
        sponsor: undefined,
      }));
  }, [tournaments]);

  if (isLoading) {
    return (
      <section className="py-24 bg-gradient-to-b from-background to-card">
        <div className="container flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (featured.length === 0) return null;

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
              {t('featured.badge')}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl font-bold uppercase tracking-wide"
            >
              {t('featured.title')}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Button variant="rift-outline" onClick={() => navigate("/tournaments")}>
              {t('featured.viewAll')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* Tournament Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((tournament, index) => (
            <TournamentCard key={tournament.id} tournament={tournament} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
