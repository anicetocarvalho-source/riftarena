import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { usePlatformAnalytics } from "@/hooks/usePlatformAnalytics";
import { 
  Users, Trophy, Gamepad2, Shield, TrendingUp, 
  Calendar, BarChart3, Activity, Loader2, 
  UserCheck, Swords, Flag
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted))"];

const AdminAnalytics = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading } = usePlatformAnalytics();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const statusLabels: Record<string, string> = {
    draft: "Draft",
    registration: "Registration",
    live: "Live",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const roleLabels: Record<string, string> = {
    player: "Players",
    organizer: "Organizers",
    sponsor: "Sponsors",
    admin: "Admins",
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
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="diamond" className="gap-1">
                <Shield className="h-3 w-3" />
                Admin Only
              </Badge>
            </div>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
              Platform Analytics
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Visão geral das métricas e estatísticas da plataforma RIFT Arena em tempo real.
            </p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
          >
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{stats?.totalUsers || 0}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Users</p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10 text-success">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{stats?.totalTournaments || 0}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Tournaments</p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-warning/10 text-warning">
                  <Flag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{stats?.totalTeams || 0}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Teams</p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-destructive/10 text-destructive">
                  <Swords className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{stats?.totalMatches || 0}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Matches</p>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Secondary Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8"
          >
            <RiftCard>
              <RiftCardContent className="py-4 text-center">
                <Activity className="h-5 w-5 mx-auto mb-2 text-success" />
                <p className="text-xl font-display font-bold">{stats?.activeTournaments || 0}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-4 text-center">
                <Calendar className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xl font-display font-bold">{stats?.completedTournaments || 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-4 text-center">
                <Gamepad2 className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-xl font-display font-bold">{stats?.totalGames || 0}</p>
                <p className="text-xs text-muted-foreground">Games</p>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-4 text-center">
                <UserCheck className="h-5 w-5 mx-auto mb-2 text-success" />
                <p className="text-xl font-display font-bold">{stats?.totalRegistrations || 0}</p>
                <p className="text-xs text-muted-foreground">Registrations</p>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-warning" />
                <p className="text-xl font-display font-bold">{stats?.completedMatches || 0}</p>
                <p className="text-xs text-muted-foreground">Matches Done</p>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="py-4 text-center">
                <BarChart3 className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-xl font-display font-bold">
                  {stats?.totalMatches ? Math.round((stats.completedMatches / stats.totalMatches) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Match Rate</p>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Charts Row */}
          <div className="grid gap-8 lg:grid-cols-2 mb-8">
            {/* Tournaments by Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Tournaments by Status
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  {stats?.tournamentsByStatus && stats.tournamentsByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.tournamentsByStatus.map(t => ({
                        name: statusLabels[t.status] || t.status,
                        value: t.count,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--background))", 
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "4px"
                          }} 
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                      No tournament data available
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Users by Role */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Users by Role
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  {stats?.usersByRole && stats.usersByRole.length > 0 ? (
                    <div className="flex items-center gap-8">
                      <ResponsiveContainer width="50%" height={200}>
                        <PieChart>
                          <Pie
                            data={stats.usersByRole.map(r => ({
                              name: roleLabels[r.role] || r.role,
                              value: r.count,
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {stats.usersByRole.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "hsl(var(--background))", 
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "4px"
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {stats.usersByRole.map((role, index) => (
                          <div key={role.role} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-sm" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm capitalize">{roleLabels[role.role] || role.role}</span>
                            </div>
                            <span className="font-display font-bold">{role.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                      No role data available
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Top Games */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    Top Games by Tournaments
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  {stats?.topGames && stats.topGames.length > 0 ? (
                    <div className="space-y-4">
                      {stats.topGames.map((game, index) => (
                        <div key={game.id} className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-secondary text-xl">
                            {game.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{game.name}</p>
                            <div className="h-2 bg-secondary rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ 
                                  width: `${stats.topGames[0].tournament_count > 0 
                                    ? (game.tournament_count / stats.topGames[0].tournament_count) * 100 
                                    : 0}%` 
                                }}
                              />
                            </div>
                          </div>
                          <span className="font-display font-bold text-lg">
                            {game.tournament_count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      No games available
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Recent Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Recent Signups
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 rounded-sm bg-secondary/50">
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.country || "Unknown location"}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString("pt-PT", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      No recent users
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAnalytics;
