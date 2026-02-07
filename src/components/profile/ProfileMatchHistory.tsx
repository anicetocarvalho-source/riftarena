import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Gamepad2, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { PlayerMatch } from "@/hooks/usePlayerProfile";
import type { EloHistoryEntry } from "@/hooks/useRankings";

interface ProfileMatchHistoryProps {
  matches: PlayerMatch[] | undefined;
  eloHistory: EloHistoryEntry[] | undefined;
  userId: string;
}

export const ProfileMatchHistory = ({ matches, eloHistory, userId }: ProfileMatchHistoryProps) => {
  const { t } = useTranslation();

  // Build a map from match_id → elo_change
  const eloChangeMap = new Map<string, number>();
  if (eloHistory) {
    eloHistory.forEach(entry => {
      eloChangeMap.set(entry.match_id, entry.elo_change);
    });
  }

  return (
    <RiftCard>
      <RiftCardHeader>
        <RiftCardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          {t('playerProfile.matchHistory')}
        </RiftCardTitle>
      </RiftCardHeader>
      <RiftCardContent>
        {matches && matches.length > 0 ? (
          <div className="space-y-2">
            {matches.map((match) => {
              const isWinner = match.winner_id === userId;
              const opponent = match.participant1_id === userId 
                ? match.participant2 
                : match.participant1;
              const playerScore = match.participant1_id === userId 
                ? match.participant1_score 
                : match.participant2_score;
              const opponentScore = match.participant1_id === userId 
                ? match.participant2_score 
                : match.participant1_score;
              const eloChange = eloChangeMap.get(match.id);

              return (
                <div 
                  key={match.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-sm border transition-colors",
                    isWinner 
                      ? "bg-success/5 border-success/20 hover:border-success/40" 
                      : "bg-destructive/5 border-destructive/20 hover:border-destructive/40"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Badge variant={isWinner ? "default" : "destructive"} className="font-display w-14 justify-center">
                      {isWinner ? t('playerProfile.win') : t('playerProfile.loss')}
                    </Badge>
                    <div>
                      <p className="font-display text-sm">
                        {t('playerProfile.vs')}{" "}
                        {opponent ? (
                          <Link 
                            to={`/player/${opponent.id}`}
                            className="hover:text-primary transition-colors inline-flex items-center gap-1"
                          >
                            {opponent.username}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          "Unknown"
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {match.tournament?.game?.icon} {match.tournament?.name}
                        <span>•</span>
                        {t('playerProfile.round')} {match.round}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    {/* ELO Change */}
                    {eloChange !== undefined && (
                      <div className={cn(
                        "flex items-center gap-1 font-display text-sm font-bold",
                        eloChange > 0 ? "text-success" : "text-destructive"
                      )}>
                        {eloChange > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {eloChange > 0 ? "+" : ""}{eloChange}
                      </div>
                    )}
                    <div>
                      <p className="font-display font-bold">
                        {playerScore ?? 0} - {opponentScore ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {match.completed_at && format(new Date(match.completed_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Gamepad2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t('playerProfile.noMatches')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('playerProfile.noMatchesDesc')}
            </p>
          </div>
        )}
      </RiftCardContent>
    </RiftCard>
  );
};
