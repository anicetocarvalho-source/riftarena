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
  status: "live" | "upcoming" | "completed";
  prizePool: string;
  participants: number;
  maxParticipants: number;
  date: string;
  sponsor?: string;
}

interface TournamentCardProps {
  tournament: Tournament;
  index?: number;
}

export function TournamentCard({ tournament, index = 0 }: TournamentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <RiftCard className="group relative overflow-hidden">
        {/* Status Indicator */}
        <div className="absolute right-4 top-4">
          <Badge variant={tournament.status}>
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
              <span className="text-sm">Prize Pool</span>
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
              Powered by <span className="text-foreground">{tournament.sponsor}</span>
            </div>
          )}

          {/* CTA */}
          <Button variant="rift-outline" className="mt-4 w-full group-hover:bg-primary group-hover:text-primary-foreground">
            View Tournament
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </RiftCardContent>
      </RiftCard>
    </motion.div>
  );
}
