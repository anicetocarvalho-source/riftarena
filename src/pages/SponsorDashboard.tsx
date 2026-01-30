import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, TrendingUp, Eye, Users, Trophy, Calendar,
  ArrowUpRight, ArrowDownRight, Loader2, ChevronRight
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// Mock engagement data for chart (in production, this would come from analytics)
const engagementData = [
  { month: "Jan", impressions: 12000, clicks: 890, conversions: 45 },
  { month: "Feb", impressions: 15000, clicks: 1200, conversions: 62 },
  { month: "Mar", impressions: 18000, clicks: 1450, conversions: 78 },
  { month: "Abr", impressions: 22000, clicks: 1800, conversions: 95 },
  { month: "Mai", impressions: 28000, clicks: 2100, conversions: 112 },
  { month: "Jun", impressions: 35000, clicks: 2800, conversions: 145 },
];

const audienceData = [
  { game: "Free Fire", percentage: 38 },
  { game: "PUBG Mobile", percentage: 28 },
  { game: "COD Mobile", percentage: 22 },
  { game: "eFootball", percentage: 12 },
];

const SponsorDashboard = () => {
  const { t } = useTranslation();
  const { user, profile, isSponsor, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !isSponsor) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isSponsor, navigate]);

  // Fetch sponsored tournaments
  const { data: sponsoredTournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ["sponsored-tournaments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("tournaments")
        .select(`
          id,
          name,
          status,
          prize_pool,
          max_participants,
          start_date,
          game:games(name, icon)
        `)
        .eq("sponsor_id", user.id)
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && isSponsor,
  });

  // Fetch registration counts for sponsored tournaments
  const { data: registrationCounts } = useQuery({
    queryKey: ["sponsor-registration-counts", sponsoredTournaments?.map(t => t.id)],
    queryFn: async () => {
      if (!sponsoredTournaments?.length) return {};
      
      const { data, error } = await supabase
        .from("tournament_registrations")
        .select("tournament_id")
        .in("tournament_id", sponsoredTournaments.map(t => t.id))
        .eq("status", "approved");
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(r => {
        counts[r.tournament_id] = (counts[r.tournament_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!sponsoredTournaments?.length,
  });

  // Calculate aggregate metrics
  const totalImpressions = engagementData.reduce((sum, d) => sum + d.impressions, 0);
  const totalClicks = engagementData.reduce((sum, d) => sum + d.clicks, 0);
  const totalConversions = engagementData.reduce((sum, d) => sum + d.conversions, 0);
  const ctr = ((totalClicks / totalImpressions) * 100).toFixed(2);
  const conversionRate = ((totalConversions / totalClicks) * 100).toFixed(2);

  const totalParticipants = sponsoredTournaments?.reduce((sum, t) => {
    return sum + (registrationCounts?.[t.id] || 0);
  }, 0) || 0;

  const activeTournaments = sponsoredTournaments?.filter(
    t => t.status === "live" || t.status === "registration"
  ).length || 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isSponsor) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live": return <Badge variant="live">{t("sponsorDashboard.status.live")}</Badge>;
      case "registration": return <Badge variant="success">{t("sponsorDashboard.status.registration")}</Badge>;
      case "completed": return <Badge variant="secondary">{t("sponsorDashboard.status.completed")}</Badge>;
      case "draft": return <Badge variant="outline">{t("sponsorDashboard.status.draft")}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
                    {t("sponsorDashboard.title")}
                  </h1>
                  <Badge variant="platinum">Sponsor</Badge>
                </div>
                <p className="text-muted-foreground">
                  {t("sponsorDashboard.description")}
                </p>
              </div>
              <Button variant="rift" onClick={() => navigate("/dashboard")}>
                {t("sponsorDashboard.backToDashboard")}
              </Button>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12"
          >
            <RiftCard>
              <RiftCardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {t("sponsorDashboard.totalImpressions")}
                    </p>
                    <p className="text-3xl font-display font-bold">
                      {(totalImpressions / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <Eye className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+24% {t("sponsorDashboard.vsLastMonth")}</span>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {t("sponsorDashboard.ctr")}
                    </p>
                    <p className="text-3xl font-display font-bold">{ctr}%</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10 text-success">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>+0.5% {t("sponsorDashboard.vsLastMonth")}</span>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {t("sponsorDashboard.activeTournaments")}
                    </p>
                    <p className="text-3xl font-display font-bold">{activeTournaments}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-warning/10 text-warning">
                    <Trophy className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {sponsoredTournaments?.length || 0} {t("sponsorDashboard.tournamentsTotal")}
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {t("sponsorDashboard.playerReach")}
                    </p>
                    <p className="text-3xl font-display font-bold">{totalParticipants}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-destructive">
                  <ArrowDownRight className="h-3 w-3" />
                  <span>-5% {t("sponsorDashboard.vsLastMonth")}</span>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Charts Section */}
          <div className="grid gap-8 lg:grid-cols-3 mb-12">
            {/* Engagement Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {t("sponsorDashboard.engagementOverTime")}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={engagementData}>
                        <defs>
                          <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="month" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "4px"
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="impressions" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorImpressions)" 
                          name={t("sponsorDashboard.impressionsLabel")}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="clicks" 
                          stroke="hsl(var(--success))" 
                          fillOpacity={1} 
                          fill="url(#colorClicks)" 
                          name={t("sponsorDashboard.clicksLabel")}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Audience by Game */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {t("sponsorDashboard.audienceByGame")}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={audienceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          type="number" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="game" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          width={80}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "4px"
                          }}
                          formatter={(value) => [`${value}%`, t("sponsorDashboard.audienceLabel")]}
                        />
                        <Bar 
                          dataKey="percentage" 
                          fill="hsl(var(--primary))" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          </div>

          {/* Sponsored Tournaments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RiftCard>
              <RiftCardHeader>
                <div className="flex items-center justify-between">
                  <RiftCardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    {t("sponsorDashboard.sponsoredTournaments")}
                  </RiftCardTitle>
                  <Button variant="rift-outline" size="sm" onClick={() => navigate("/tournaments")}>
                    {t("sponsorDashboard.viewAll")}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </RiftCardHeader>
              <RiftCardContent>
                {tournamentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sponsoredTournaments && sponsoredTournaments.length > 0 ? (
                  <div className="divide-y divide-border">
                    {sponsoredTournaments.slice(0, 5).map((tournament) => (
                      <div 
                        key={tournament.id} 
                        className="flex items-center justify-between py-4 hover:bg-muted/50 -mx-6 px-6 cursor-pointer transition-colors"
                        onClick={() => navigate(`/tournaments/${tournament.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">
                            {tournament.game?.icon || "🎮"}
                          </span>
                          <div>
                            <p className="font-display font-semibold uppercase tracking-wide">
                              {tournament.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(tournament.start_date).toLocaleDateString("pt-BR")}</span>
                              <span>•</span>
                              <span>{tournament.game?.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-display font-bold text-primary">
                              {registrationCounts?.[tournament.id] || 0}/{tournament.max_participants}
                            </p>
                            <p className="text-xs text-muted-foreground">{t("sponsorDashboard.participants")}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-bold">
                              R$ {Number(tournament.prize_pool).toLocaleString("pt-BR")}
                            </p>
                            <p className="text-xs text-muted-foreground">{t("sponsorDashboard.prizePool")}</p>
                          </div>
                          {getStatusBadge(tournament.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t("sponsorDashboard.noTournaments")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("sponsorDashboard.noTournamentsHint")}
                    </p>
                  </div>
                )}
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Conversion Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <RiftCard glow>
              <RiftCardHeader>
                <RiftCardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  {t("sponsorDashboard.conversionMetrics")}
                </RiftCardTitle>
              </RiftCardHeader>
              <RiftCardContent>
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="text-center p-4 rounded-sm bg-muted/50">
                    <p className="text-3xl font-display font-bold text-primary">
                      {totalClicks.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{t("sponsorDashboard.totalClicks")}</p>
                  </div>
                  <div className="text-center p-4 rounded-sm bg-muted/50">
                    <p className="text-3xl font-display font-bold text-success">
                      {totalConversions}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{t("sponsorDashboard.conversions")}</p>
                  </div>
                  <div className="text-center p-4 rounded-sm bg-muted/50">
                    <p className="text-3xl font-display font-bold text-warning">
                      {conversionRate}%
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{t("sponsorDashboard.conversionRate")}</p>
                  </div>
                  <div className="text-center p-4 rounded-sm bg-muted/50">
                    <p className="text-3xl font-display font-bold">
                      R$ 2.45
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{t("sponsorDashboard.costPerConversion")}</p>
                  </div>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SponsorDashboard;
