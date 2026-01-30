import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Calendar, Users, Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tournament {
  id: string;
  name: string;
  game: string;
  gameIcon: string;
  status: "live" | "upcoming" | "completed" | "draft" | "registration" | "cancelled";
  prizePool: string;
  participants: number;
  maxParticipants: number;
  date: string;
  sponsor?: string;
  isOwner?: boolean;
}

interface TournamentCardProps {
  tournament: Tournament;
  index?: number;
  onManage?: () => void;
}

export function TournamentCard({ tournament, index = 0, onManage }: TournamentCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const displayStatus = tournament.status === "registration" ? "upcoming" : tournament.status;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <RiftCard className="group relative overflow-hidden">
        {/* Status Indicator */}
        <div className="absolute right-4 top-4">
          <Badge variant={displayStatus as "live" | "upcoming" | "completed"}>
            {tournament.status === "live" && "● "}
            {tournament.status.toUpperCase()}
          </Badge>
        </div>

        <RiftCardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-secondary text-2xl">
              {tournament.gameIcon}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {tournament.game}
              </p>
              <RiftCardTitle className="line-clamp-1">{tournament.name}</RiftCardTitle>
            </div>
          </div>
        </RiftCardHeader>

        <RiftCardContent className="space-y-4">
          {/* Prize Pool */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-sm">{t('tournaments.prizePool')}</span>
            </div>
            <span className="font-display text-lg font-semibold text-primary">
              {tournament.prizePool}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {tournament.participants}/{tournament.maxParticipants}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{tournament.date}</span>
            </div>
          </div>

          {/* Sponsor */}
          {tournament.sponsor && (
            <div className="pt-2 text-xs text-muted-foreground">
              {t('tournaments.poweredBy')} <span className="text-foreground">{tournament.sponsor}</span>
            </div>
          )}

          {/* CTA */}
          <div className="mt-4 flex flex-col gap-2">
            <Button 
              variant="rift-outline" 
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
              onClick={() => navigate(`/tournaments/${tournament.id}`)}
            >
              {t('tournaments.viewTournament')}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            {onManage && (
              <Button variant="rift" className="w-full" onClick={onManage}>
                {t('tournaments.manageTournament')}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>
        </RiftCardContent>
      </RiftCard>
    </motion.div>
  );
}
