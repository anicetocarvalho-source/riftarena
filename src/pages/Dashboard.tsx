import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MyTeamsSection } from "@/components/dashboard/MyTeamsSection";
import { RankProgressCard } from "@/components/dashboard/RankProgressCard";
import { NextRivalCard } from "@/components/dashboard/NextRivalCard";
import { ActivityUrgencyCard } from "@/components/dashboard/ActivityUrgencyCard";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { RivalOvertakeCelebration } from "@/components/rankings/RivalOvertakeCelebration";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useRivalOvertakeCelebration } from "@/hooks/useRivalOvertakeCelebration";
import { 
  Trophy, Users, Gamepad2, TrendingUp, Settings, 
  Shield, BarChart3, DollarSign, Bell, Loader2, Search
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, profile, roles, isLoading, isAdmin, isOrganizer, isSponsor, signOut } = useAuth();
  const { showOnboarding, isLoading: onboardingLoading, completeOnboarding, skipOnboarding } = useOnboarding();
  const { celebrationData, dismissCelebration } = useRivalOvertakeCelebration();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || onboardingLoading) {
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
      <SEOHead title="Dashboard" noIndex />
      {/* Onboarding Wizard */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard 
            onComplete={completeOnboarding} 
            onSkip={skipOnboarding} 
          />
        )}
      </AnimatePresence>

      {/* Rival Overtake Celebration */}
      <AnimatePresence>
        {celebrationData && (
          <RivalOvertakeCelebration
            data={celebrationData}
            onDismiss={dismissCelebration}
          />
        )}
      </AnimatePresence>

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
                    {t('dashboard.welcome')}, {profile.username}
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
                  {t('dashboard.welcomeMessage')}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="rift" size="sm" onClick={() => navigate(`/player/${user.id}`)}>
                  <Users className="mr-2 h-4 w-4" />
                  {t('dashboard.viewProfile')}
                </Button>
                <Button variant="rift-outline" size="sm" onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  {t('dashboard.settings')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  {t('dashboard.signOut')}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Personal Rank Progress, Next Rival & Activity Urgency - Prominent Position */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <RankProgressCard />
            <NextRivalCard />
            <ActivityUrgencyCard />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12"
          >
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">0</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('dashboard.tournaments')}</p>
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
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('dashboard.currentRank')}</p>
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
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('dashboard.matchesPlayed')}</p>
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
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('dashboard.winnings')}</p>
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
                    {t('dashboard.myTournaments')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <EmptyState
                    icon={Trophy}
                    title={t('dashboard.noTournamentsYet')}
                    description={t('dashboard.noTournamentsDesc')}
                    tip={t('dashboard.noTournamentsTip')}
                    actions={[
                      {
                        label: t('dashboard.exploreTournaments'),
                        onClick: () => navigate("/tournaments"),
                        icon: Search,
                      },
                    ]}
                    compact
                  />
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
                    {t('dashboard.notifications')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.noNotifications')}
                    </p>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          </div>

          {/* My Teams Section */}
          <MyTeamsSection />

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
                    {t('dashboard.organizerDashboard')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="rift-outline" className="justify-start h-auto py-4" onClick={() => navigate("/tournaments/create")}>
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">{t('dashboard.createTournament')}</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          {t('dashboard.createTournamentDesc')}
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4" onClick={() => navigate("/tournaments")}>
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">{t('dashboard.manageTournaments')}</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          {t('dashboard.manageTournamentsDesc')}
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4" onClick={() => navigate("/tournaments")}>
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">{t('dashboard.matchResults')}</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          {t('dashboard.matchResultsDesc')}
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
                    {t('dashboard.sponsorDashboard')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="flex flex-col gap-4">
                    <p className="text-muted-foreground">
                      {t('dashboard.sponsorDashboardDesc')}
                    </p>
                    <Button variant="rift" onClick={() => navigate("/sponsor/dashboard")}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {t('dashboard.openSponsorDashboard')}
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
                    {t('dashboard.adminPanel')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Button variant="rift-outline" className="justify-start h-auto py-4" onClick={() => navigate("/admin/users")}>
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">{t('dashboard.userManagement')}</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          {t('dashboard.userManagementDesc')}
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4" onClick={() => navigate("/tournaments")}>
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">{t('dashboard.allTournaments')}</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          {t('dashboard.allTournamentsDesc')}
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4" onClick={() => navigate("/sponsors")}>
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">{t('dashboard.sponsorManagement')}</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          {t('dashboard.sponsorManagementDesc')}
                        </p>
                      </div>
                    </Button>
                    <Button variant="rift-outline" className="justify-start h-auto py-4" onClick={() => navigate("/rankings")}>
                      <div className="text-left">
                        <p className="font-display uppercase tracking-wider">{t('dashboard.platformAnalytics')}</p>
                        <p className="text-xs text-muted-foreground font-body normal-case tracking-normal">
                          {t('dashboard.platformAnalyticsDesc')}
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
