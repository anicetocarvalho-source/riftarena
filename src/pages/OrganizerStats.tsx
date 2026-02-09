import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOrganizerStats } from "@/hooks/useOrganizerStats";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Trophy, Users, BarChart3, PieChart as PieChartIcon,
  Loader2, ArrowLeft, TrendingUp, Gamepad2, Eye,
} from "lucide-react";
import { format } from "date-fns";

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  gold: "hsl(var(--gold))",
  diamond: "hsl(var(--diamond))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
  info: "hsl(var(--info))",
};

const STATUS_COLORS: Record<string, string> = {
  draft: CHART_COLORS.muted,
  registration: CHART_COLORS.info,
  live: CHART_COLORS.success,
  completed: CHART_COLORS.gold,
  cancelled: CHART_COLORS.destructive,
};

const OrganizerStats = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isOrganizer } = useAuth();
  const { data: stats, isLoading } = useOrganizerStats();

  useEffect(() => {
    if (!authLoading && (!user || !isOrganizer)) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isOrganizer, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const statusPieData = stats.byStatus.map((s) => ({
    name: t(`organizerStats.status.${s.status}`, s.status),
    value: s.count,
    color: STATUS_COLORS[s.status] || CHART_COLORS.muted,
  }));

  // Bar chart: registrations per tournament (top 10)
  const regBarData = stats.tournaments
    .slice(0, 10)
    .map((t) => ({
      name: t.name.length > 18 ? t.name.slice(0, 18) + "…" : t.name,
      registrations: t.registrations_count,
      max: t.max_participants,
    }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title={t("organizerStats.title")} noIndex />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          <PageBreadcrumbs
            items={[
              { label: t("breadcrumbs.dashboard"), href: "/dashboard" },
              { label: t("organizerStats.title") },
            ]}
            className="mb-6"
          />

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide">
                    {t("organizerStats.title")}
                  </h1>
                </div>
                <p className="text-muted-foreground">{t("organizerStats.subtitle")}</p>
              </div>
              <Button variant="rift-outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("organizerStats.backToDashboard")}
              </Button>
            </div>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
          >
            <RiftCard glow>
              <RiftCardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{stats.totalTournaments}</p>
                    <p className="text-xs text-muted-foreground">{t("organizerStats.totalTournaments")}</p>
                  </div>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-gold/10">
                    <Users className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{stats.totalRegistrations}</p>
                    <p className="text-xs text-muted-foreground">{t("organizerStats.totalRegistrations")}</p>
                  </div>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-diamond/10">
                    <TrendingUp className="h-6 w-6 text-diamond" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">${stats.totalPrizePool.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{t("organizerStats.totalPrizePool")}</p>
                  </div>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10">
                    <Gamepad2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">
                      {stats.completedMatches}/{stats.totalMatches}
                    </p>
                    <p className="text-xs text-muted-foreground">{t("organizerStats.matchesCompleted")}</p>
                  </div>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Tournament Status Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    {t("organizerStats.statusDistribution")}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  {statusPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "4px",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                      {t("organizerStats.noData")}
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Registrations per Tournament */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-gold" />
                    {t("organizerStats.registrationsPerTournament")}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  {regBarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={regBarData} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          width={120}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "4px",
                          }}
                        />
                        <Bar dataKey="registrations" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} name={t("organizerStats.registrations")} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                      {t("organizerStats.noData")}
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          </div>

          {/* Tournaments Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <RiftCard>
              <RiftCardHeader>
                <RiftCardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  {t("organizerStats.allTournaments")}
                </RiftCardTitle>
              </RiftCardHeader>
              <RiftCardContent>
                {stats.tournaments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left py-3 px-2 font-medium">{t("organizerStats.tournament")}</th>
                          <th className="text-left py-3 px-2 font-medium">{t("organizerStats.game")}</th>
                          <th className="text-center py-3 px-2 font-medium">{t("organizerStats.statusLabel")}</th>
                          <th className="text-center py-3 px-2 font-medium">{t("organizerStats.players")}</th>
                          <th className="text-center py-3 px-2 font-medium">{t("organizerStats.matches")}</th>
                          <th className="text-right py-3 px-2 font-medium">{t("organizerStats.prize")}</th>
                          <th className="text-center py-3 px-2 font-medium">{t("organizerStats.date")}</th>
                          <th className="py-3 px-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.tournaments.map((tournament) => (
                          <tr key={tournament.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-2 font-medium max-w-[200px] truncate">{tournament.name}</td>
                            <td className="py-3 px-2">
                              <span className="flex items-center gap-1.5">
                                <span>{tournament.game?.icon}</span>
                                <span className="text-muted-foreground">{tournament.game?.name}</span>
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <Badge variant={getStatusVariant(tournament.status)}>
                                {t(`organizerStats.status.${tournament.status}`, tournament.status)}
                              </Badge>
                            </td>
                            <td className="py-3 px-2 text-center">
                              {tournament.registrations_count}/{tournament.max_participants}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {tournament.matches_completed}/{tournament.matches_total}
                            </td>
                            <td className="py-3 px-2 text-right font-medium">${tournament.prize_pool.toLocaleString()}</td>
                            <td className="py-3 px-2 text-center text-muted-foreground text-xs">
                              {format(new Date(tournament.start_date), "dd/MM/yyyy")}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/tournaments/${tournament.id}/stats`)}
                                  title={t("organizerStats.viewDetails")}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>{t("organizerStats.noTournaments")}</p>
                    <Button variant="rift" className="mt-4" onClick={() => navigate("/tournaments/create")}>
                      {t("organizerStats.createFirst")}
                    </Button>
                  </div>
                )}
              </RiftCardContent>
            </RiftCard>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

function getStatusVariant(status: string) {
  switch (status) {
    case "live":
      return "default" as const;
    case "completed":
      return "gold" as const;
    case "registration":
      return "secondary" as const;
    case "cancelled":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export default OrganizerStats;
