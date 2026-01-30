import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users, Trophy, DollarSign, UsersRound } from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { Skeleton } from "@/components/ui/skeleton";

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
};

const formatCurrency = (num: number): string => {
  if (num >= 1000000) {
    return "$" + (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return "$" + (num / 1000).toFixed(0) + "K";
  }
  return "$" + num.toLocaleString();
};

export function PlatformMetrics() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = usePlatformStats();

  const metrics = [
    {
      icon: Users,
      value: stats?.totalPlayers || 0,
      label: t("platformMetrics.activePlayers"),
      format: formatNumber,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Trophy,
      value: stats?.tournamentsHosted || 0,
      label: t("platformMetrics.tournamentsHosted"),
      format: formatNumber,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: DollarSign,
      value: stats?.totalPrizeDistributed || 0,
      label: t("platformMetrics.prizeDistributed"),
      format: formatCurrency,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: UsersRound,
      value: stats?.activeTeams || 0,
      label: t("platformMetrics.activeTeams"),
      format: formatNumber,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <section className="py-12 bg-card/50 border-y border-border">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${metric.bgColor} mb-3 transition-transform group-hover:scale-110`}
                >
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mb-1" />
                ) : (
                  <motion.p
                    className="font-display text-2xl md:text-3xl font-bold tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {metric.format(metric.value)}
                  </motion.p>
                )}
                <p className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider mt-1">
                  {metric.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
