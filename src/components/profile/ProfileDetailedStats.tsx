import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Trophy, Target, Gamepad2, TrendingUp, Flame, Zap, Swords, BarChart3 } from "lucide-react";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { GlossaryTerm } from "@/components/ui/glossary-term";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProfileDetailedStatsProps {
  bestElo: number;
  peakElo: number;
  winRate: number;
  totalWins: number;
  totalLosses: number;
  totalMatches: number;
  bestWinStreak: number;
  currentWinStreak: number;
  gamesPlayed: number;
}

export const ProfileDetailedStats = ({
  bestElo,
  peakElo,
  winRate,
  totalWins,
  totalLosses,
  totalMatches,
  bestWinStreak,
  currentWinStreak,
  gamesPlayed,
}: ProfileDetailedStatsProps) => {
  const { t } = useTranslation();

  const stats = [
    {
      icon: Trophy,
      label: <GlossaryTerm term="elo" showIcon={false}>{t('playerProfile.currentElo')}</GlossaryTerm>,
      value: bestElo,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Zap,
      label: "Peak ELO",
      value: peakElo,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: Target,
      label: <GlossaryTerm term="winRate" showIcon={false}>{t('playerProfile.winRate')}</GlossaryTerm>,
      value: `${winRate}%`,
      color: "text-success",
      bgColor: "bg-success/10",
      progress: winRate,
    },
    {
      icon: Gamepad2,
      label: t('playerProfile.matches'),
      value: totalMatches,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      icon: Swords,
      label: t('playerProfile.wlRecord'),
      value: (
        <span>
          <span className="text-success">{totalWins}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-destructive">{totalLosses}</span>
        </span>
      ),
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      icon: Flame,
      label: t('playerProfile.bestStreak', 'Best Streak'),
      value: `${bestWinStreak}🔥`,
      color: "text-warning",
      bgColor: "bg-warning/10",
      sub: currentWinStreak > 0 ? `${t('playerProfile.currentStreak', 'Current')}: ${currentWinStreak}` : undefined,
    },
    {
      icon: BarChart3,
      label: t('playerProfile.avgPerMatch', 'Avg / Match'),
      value: totalMatches > 0 ? `${((totalWins / totalMatches) * 100).toFixed(0)}%` : "—",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: TrendingUp,
      label: t('playerProfile.gamesActive', 'Games Active'),
      value: gamesPlayed,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 mb-8"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 * i }}
        >
          <RiftCard className="h-full">
            <RiftCardContent className="flex flex-col gap-3 py-4">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-sm shrink-0", stat.bgColor, stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-display font-bold truncate">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                    {stat.label}
                  </p>
                </div>
              </div>
              {stat.progress !== undefined && (
                <Progress value={stat.progress} className="h-1.5" />
              )}
              {stat.sub && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.sub}</p>
              )}
            </RiftCardContent>
          </RiftCard>
        </motion.div>
      ))}
    </motion.div>
  );
};
