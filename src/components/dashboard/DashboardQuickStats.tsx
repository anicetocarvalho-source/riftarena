import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Gamepad2, DollarSign } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function DashboardQuickStats() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      icon: Trophy,
      iconBg: "bg-primary/10 text-primary",
      value: isLoading ? null : (stats?.tournamentsJoined ?? 0),
      label: t('dashboard.tournaments'),
    },
    {
      icon: TrendingUp,
      iconBg: "bg-success/10 text-success",
      value: isLoading ? null : (stats?.bestElo ? `${stats.bestElo}` : "—"),
      sublabel: stats?.bestTier || undefined,
      label: t('dashboard.currentRank'),
    },
    {
      icon: Gamepad2,
      iconBg: "bg-warning/10 text-warning",
      value: isLoading ? null : (stats?.matchesPlayed ?? 0),
      label: t('dashboard.matchesPlayed'),
    },
    {
      icon: DollarSign,
      iconBg: "bg-primary/10 text-primary",
      value: isLoading ? null : `$${stats?.totalWinnings ?? 0}`,
      label: t('dashboard.winnings'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12"
    >
      {statCards.map((stat, i) => (
        <RiftCard key={i}>
          <RiftCardContent className="flex items-center gap-4 py-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-sm ${stat.iconBg}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              {stat.value === null ? (
                <Skeleton className="h-7 w-16 mb-1" />
              ) : (
                <p className="text-2xl font-display font-bold">{stat.value}</p>
              )}
              {stat.sublabel && (
                <p className="text-xs text-primary font-display">{stat.sublabel}</p>
              )}
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            </div>
          </RiftCardContent>
        </RiftCard>
      ))}
    </motion.div>
  );
}
