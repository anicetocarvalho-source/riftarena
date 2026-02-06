import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, ChevronRight, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { useUserTournaments } from "@/hooks/useDashboardStats";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";

export function DashboardMyTournaments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: registrations, isLoading } = useUserTournaments();

  const getRegStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-3.5 w-3.5 text-success" />;
      case "pending": return <Clock className="h-3.5 w-3.5 text-warning" />;
      default: return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    }
  };

  const getTournamentStatusVariant = (status: string) => {
    switch (status) {
      case "live": return "live" as const;
      case "registration": return "default" as const;
      case "completed": return "gold" as const;
      default: return "secondary" as const;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-sm">
            <Skeleton className="h-10 w-10 rounded-sm" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!registrations || registrations.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title={t('dashboard.noTournamentsYet')}
        description={t('dashboard.noTournamentsDesc')}
        tip={t('dashboard.noTournamentsTip')}
        actions={[
          {
            label: t('dashboard.exploreTournaments'),
            onClick: () => navigate("/tournaments"),
            icon: Search,
          },
        ]}
        compact
      />
    );
  }

  return (
    <div className="space-y-2">
      {registrations.map((reg) => {
        const tournament = reg.tournament;
        if (!tournament) return null;

        return (
          <motion.div
            key={reg.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 rounded-sm bg-secondary/30 border border-border hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => navigate(`/tournaments/${tournament.id}`)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-secondary text-xl border border-border shrink-0">
                {tournament.game?.icon || "🎮"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display text-sm font-medium truncate">{tournament.name}</p>
                  <Badge variant={getTournamentStatusVariant(tournament.status)} className="text-[10px] shrink-0">
                    {t(`tournamentStatus.${tournament.status}`)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {getRegStatusIcon(reg.status)}
                    {reg.status === "confirmed" ? t('dashboard.confirmed') : reg.status === "pending" ? t('dashboard.pending') : reg.status}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </motion.div>
        );
      })}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full mt-2 text-xs" 
        onClick={() => navigate("/tournaments")}
      >
        {t('dashboard.viewAllTournaments')}
        <ChevronRight className="ml-1 h-3 w-3" />
      </Button>
    </div>
  );
}
