import { useTranslation } from "react-i18next";
import { Gamepad2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getRankTier, getWinRate } from "@/hooks/useRankings";

interface GameRanking {
  id: string;
  elo_rating: number;
  peak_elo: number;
  wins: number;
  losses: number;
  matches_played: number;
  win_streak: number;
  best_win_streak: number;
  game?: { id: string; name: string; icon: string };
}

interface ProfileGameRankingsProps {
  rankings: GameRanking[] | undefined;
}

// Get the next tier threshold for progress bar
const getNextTierThreshold = (elo: number) => {
  const thresholds = [1200, 1400, 1600, 1800, 2000, 2200, 2400];
  for (const t of thresholds) {
    if (elo < t) return t;
  }
  return 2600;
};

const getPreviousTierThreshold = (elo: number) => {
  const thresholds = [1200, 1400, 1600, 1800, 2000, 2200, 2400];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (elo >= thresholds[i]) return thresholds[i];
  }
  return 0;
};

export const ProfileGameRankings = ({ rankings }: ProfileGameRankingsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <RiftCard>
      <RiftCardHeader>
        <RiftCardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-primary" />
          {t('playerProfile.rankingsByGame')}
        </RiftCardTitle>
      </RiftCardHeader>
      <RiftCardContent>
        {rankings && rankings.length > 0 ? (
          <div className="space-y-4">
            {rankings.map((ranking) => {
              const tier = getRankTier(ranking.elo_rating);
              const rate = getWinRate(ranking.wins, ranking.losses);
              const nextThreshold = getNextTierThreshold(ranking.elo_rating);
              const prevThreshold = getPreviousTierThreshold(ranking.elo_rating);
              const progressToNext = ((ranking.elo_rating - prevThreshold) / (nextThreshold - prevThreshold)) * 100;

              return (
                <div 
                  key={ranking.id} 
                  className="group p-4 rounded-sm bg-secondary/50 border border-border hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => ranking.game && navigate(`/rankings?game=${ranking.game.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ranking.game?.icon}</span>
                      <div>
                        <p className="font-display text-sm font-semibold">{ranking.game?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ranking.matches_played} {t('playerProfile.matches').toLowerCase()} • {ranking.wins}W / {ranking.losses}L
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-display font-bold text-xl text-primary">{ranking.elo_rating}</p>
                        <p className={cn("text-xs font-display", tier.color)}>{tier.icon} {tier.name}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Progress to next rank */}
                  <div className="flex items-center gap-3">
                    <Progress value={Math.min(progressToNext, 100)} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground font-display whitespace-nowrap">
                      {nextThreshold - ranking.elo_rating} to next
                    </span>
                  </div>

                  {/* Mini stats row */}
                  <div className="flex items-center gap-4 mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>Win Rate: <span className="text-success font-semibold">{rate}%</span></span>
                    <span>Peak: <span className="text-warning font-semibold">{ranking.peak_elo}</span></span>
                    {ranking.win_streak > 0 && (
                      <span>Streak: <span className="text-warning font-semibold">{ranking.win_streak}🔥</span></span>
                    )}
                    <span>Best: <span className="font-semibold">{ranking.best_win_streak}🔥</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t('playerProfile.noRankings')}
          </div>
        )}
      </RiftCardContent>
    </RiftCard>
  );
};
