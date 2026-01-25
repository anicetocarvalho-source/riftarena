import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, Users, Gamepad2, Calendar, TrendingUp, Settings, 
  Shield, BarChart3, DollarSign, Bell, ChevronRight, Loader2
} from "lucide-react";

const Dashboard = () => {
  const { user, profile, roles, isLoading, isAdmin, isOrganizer, isSponsor, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "diamond";
      case "organizer": return "gold";
      case "sponsor": return "platinum";
      default: return "default";
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
                  <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
                    Welcome, {profile.username}
                  </h1>
                  <div className="flex gap-2">
                    {roles.map((role) => (
                      <Badge key={role} variant={getRoleBadgeVariant(role)}>
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {profile.country && `${profile.country} • `}
                  Manage your tournaments, track rankings, and grow your esports career.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="rift-outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12"
          >
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">0</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Tournaments</p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10 text-success">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">—</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Rank</p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-warning/10 text-warning">
                  <Gamepad2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">0</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Matches Played</p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">$0</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Winnings</p>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Role-specific Sections */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Player Section (shown to all) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    My Tournaments
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You haven't joined any tournaments yet.
                    </p>
                    <Button variant="rift" onClick={() => navigate("/tournaments")}>
                      Browse Tournaments
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No new notifications
                    </p>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          </div>

          {/* Organizer Section */}
          {isOrganizer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <RiftCard glow>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Organizer Dashboard
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="rift-outline" className="justify-start h-auto py-4">
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">Create Tournament</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          Set up a new competition
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4">
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">Manage Tournaments</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          Edit existing events
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4">
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">Match Results</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          Validate and submit scores
                        </p>
                      </div>
                    </Button>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          )}

          {/* Sponsor Section */}
          {isSponsor && (
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
                    Sponsor Dashboard
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="rift-outline" className="justify-start h-auto py-4">
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">Campaign Analytics</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          View engagement metrics
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4">
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">Brand Exposure</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          Track visibility across events
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4">
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">Audience Insights</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          Demographics and reach
                        </p>
                      </div>
                    </Button>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <RiftCard glow className="border-destructive/30">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-destructive" />
                    Admin Panel
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Button variant="rift-outline" className="justify-start h-auto py-4">
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">User Management</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          Manage roles and accounts
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4">
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">All Tournaments</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          Oversee all competitions
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4">
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">Sponsor Management</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          Manage brand partnerships
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4">
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">Platform Analytics</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          Overview of all metrics
                        </p>
                      </div>
                    </Button>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
