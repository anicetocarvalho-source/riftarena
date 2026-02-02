import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { TrendingUp, Trophy, Zap, Users } from "lucide-react";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Progress } from "@/components/ui/progress";
import { useUserRankings, getRankTier, getWinRate } from "@/hooks/useRankings";
import { usePlayerPercentile } from "@/hooks/usePlayerPercentile";
import { cn } from "@/lib/utils";

// Tier thresholds for calculating progress
const TIER_THRESHOLDS = [
  { min: 0, max: 1200, name: "Iron", next: "Bronze" },
  { min: 1200, max: 1400, name: "Bronze", next: "Silver" },
  { min: 1400, max: 1600, name: "Silver", next: "Gold" },
  { min: 1600, max: 1800, name: "Gold", next: "Platinum" },
  { min: 1800, max: 2000, name: "Platinum", next: "Diamond" },
  { min: 2000, max: 2200, name: "Diamond", next: "Master" },
  { min: 2200, max: 2400, name: "Master", next: "Grandmaster" },
  { min: 2400, max: Infinity, name: "Grandmaster", next: null },
];

const getTierProgress = (elo: number) => {
  const tier = TIER_THRESHOLDS.find(t => elo >= t.min && elo < t.max) || TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];
  
  if (tier.max === Infinity) {
    return { percentage: 100, remaining: 0, nextTier: null, currentTier: tier.name };
  }
  
  const tierRange = tier.max - tier.min;
  const progress = elo - tier.min;
  const percentage = Math.round((progress / tierRange) * 100);
  const remaining = tier.max - elo;
  
  return { percentage, remaining, nextTier: tier.next, currentTier: tier.name };
};

export const RankProgressCard = () => {
  const { t } = useTranslation();
  const { data: rankings, isLoading } = useUserRankings();
  const { data: percentileData } = usePlayerPercentile();

  // Get the highest ranked game or first available
  const primaryRanking = rankings?.length 
    ? rankings.reduce((best, current) => 
        current.elo_rating > best.elo_rating ? current : best
      )
    : null;

  if (isLoading) {
    return (
      <RiftCard className="animate-pulse">
        <RiftCardContent className="py-6">
          <div className="h-24 bg-muted/50 rounded" />
        </RiftCardContent>
      </RiftCard>
    );
  }

  if (!primaryRanking) {
    return (
      <RiftCard>
        <RiftCardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-muted/50 text-muted-foreground">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.noRankYet', 'No rank yet')}</p>
              <p className="text-xs text-muted-foreground/70">
                {t('dashboard.playMatchesToRank', 'Play matches to get ranked!')}
              </p>
            </div>
          </div>
        </RiftCardContent>
      </RiftCard>
    );
  }

  const { elo_rating, wins, losses, win_streak, game } = primaryRanking;
  const tier = getRankTier(elo_rating);
  const { percentage, remaining, nextTier } = getTierProgress(elo_rating);
  const winRate = getWinRate(wins, losses);

  return (
    <RiftCard glow className="overflow-hidden">
      <RiftCardContent className="py-6">
        <div className="flex flex-col gap-4">
          {/* Header with current rank */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-sm text-3xl",
                  "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
                )}
              >
                {tier.icon}
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn("font-display text-xl font-bold uppercase tracking-wide", tier.color)}>
                    {tier.name}
                  </span>
                  {game && (
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      {game.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono font-bold text-foreground">{elo_rating} ELO</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{winRate}% WR</span>
                  {win_streak > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="flex items-center gap-1 text-success">
                        <Zap className="h-3 w-3" />
                        {win_streak} streak
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {nextTier && (
              <div className="text-right hidden sm:block">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t('dashboard.nextRank', 'Next Rank')}
                </p>
                <p className="font-display font-bold text-primary">{nextTier}</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {nextTier ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {t('dashboard.progressToNext', 'Progress to {{tier}}', { tier: nextTier })}
                </span>
                <span className="font-mono font-medium text-primary">
                  {percentage}%
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-3 bg-muted/50"
                indicatorClassName="bg-gradient-to-r from-primary to-primary/70"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {remaining} ELO {t('dashboard.remaining', 'remaining')}
                </span>
                <span className="sm:hidden">
                  → {nextTier}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-primary">
              <Trophy className="h-4 w-4" />
              <span className="font-display uppercase tracking-wider">
                {t('dashboard.maxRankReached', 'Maximum rank achieved!')}
              </span>
            </div>
          )}

          {/* Social comparison */}
          {percentileData && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('dashboard.aheadOfPlayers', 'Estás à frente de {{percent}}% dos jogadores', { percent: percentileData.percentile })}
              </span>
              <span className="ml-auto text-xs font-mono text-primary">
                #{percentileData.position}/{percentileData.totalPlayers}
              </span>
            </div>
          )}
        </div>
      </RiftCardContent>
    </RiftCard>
  );
};
